import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createDecipheriv, createHash } from 'crypto';
import { RedisService } from 'nestjs-redis';
import { Redis } from 'ioredis';
import { XMLParser } from 'fast-xml-parser';
import FormData from 'form-data';
import fetch from 'node-fetch';
import qs from 'query-string';

import { MinioService } from 'server/minio';

import { WxACodeUnlimitedDto, WxAuthorizationCode, WxAccessToken, WxMessagePayload, WechatApp } from './models';
import { WXMsgCrypto } from './wechat.crypto';

const WECHAT_ACCESS_TOKEN = 'wechat:accessToken';
const WECHAT_API_ROOT = 'https://api.weixin.qq.com';

@Injectable()
export class WechatService {
  private readonly logger = new Logger(WechatService.name);
  private redisClient: Redis;

  constructor(
    private readonly redisService: RedisService,
    private readonly minioService: MinioService,
    @InjectRepository(WechatApp)
    private readonly wechatAppRepo: Repository<WechatApp>,
  ) {
    this.redisClient = this.redisService.getClient('wechat');
    this.clearAccessTokens().then(() => {
      this.logger.debug('cleared all access tokens');
    });
  }

  public async getAuthorizationCodeMiniApp(appNamespace: string, code: string): Promise<WxAuthorizationCode> {
    const { appId, appSecret } = await this.getAppIdAndSecret(appNamespace);
    const url = `${WECHAT_API_ROOT}/sns/jscode2session`;

    return this.getAuthorizationCode(appId, appSecret, url, code);
  }

  public async getAuthorizationCodeOAuth(appNamespace: string, code: string): Promise<WxAuthorizationCode> {
    const { appId, appSecret } = await this.getAppIdAndSecret(appNamespace);
    const url = `${WECHAT_API_ROOT}/sns/oauth2/access_token`;

    return this.getAuthorizationCode(appId, appSecret, url, code);
  }

  public async getWxACodeUnlimited(appNamespace: string, data: WxACodeUnlimitedDto): Promise<Buffer> {
    const token = await this.getAccessToken(appNamespace);

    const response = await fetch(`${WECHAT_API_ROOT}/wxa/getwxacodeunlimit?access_token=${token}`, {
      headers: { 'Content-Type': 'application/json' },
      method: 'post',
      body: JSON.stringify(data),
    });

    const buffer = await response.buffer();

    if (!buffer || buffer.length <= 0) {
      throw new NotFoundException('cannot get WXA code');
    }

    return buffer;
  }

  public async sendMessage(appNamespace: string, message: WxMessagePayload): Promise<void> {
    const access_token = await this.getAccessToken(appNamespace);

    this.logger.debug(message);

    const response = await fetch(`${WECHAT_API_ROOT}/cgi-bin/message/custom/send?access_token=${access_token}`, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify(message),
    });

    const data = await response.json();

    this.logger.debug(data);
  }

  public async uploadImage(appNamespace: string, imagePath: string): Promise<string> {
    const access_token = await this.getAccessToken(appNamespace);

    if (imagePath.startsWith('s3://')) {
      try {
        // TODO: this might have subpaths later
        const [bucket, key] = imagePath.replace('s3://', '').split('/');

        this.logger.debug(`s3 location: ${bucket}/${key}`);

        const imageStats = await this.minioService.instance.statObject(bucket, key);

        this.logger.debug(imageStats);

        const imageStream = await this.minioService.instance.getObject(bucket, key);

        const form = new FormData();
        form.append('media', imageStream, {
          filename: key,
          contentType: imageStats.metaData['content-type'],
          knownLength: imageStats.size,
        });

        const response = await fetch(`${WECHAT_API_ROOT}/cgi-bin/media/upload?type=image&access_token=${access_token}`, {
          headers: form.getHeaders(),
          body: form,
          method: 'POST',
        });

        const data: any = await response.json();

        this.logger.debug(data);

        return data.media_id;
      } catch (err) {
        console.error(err);
        throw err;
      }
    }

    throw new BadRequestException('protocol not supported');
  }

  public decodeMiniAppEncryptedData(appid: string, sessionKey: string, encryptedData: string, iv: string): any {
    // base64 decode
    const sessionKeyBuffer = Buffer.from(sessionKey, 'base64');
    const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
    const ivBuffer = Buffer.from(iv, 'base64');

    // 解密
    const decipher = createDecipheriv('aes-128-cbc', sessionKeyBuffer, ivBuffer);
    // 设置自动 padding 为 true，删除填充补位
    decipher.setAutoPadding(true);
    const decodedString = decipher.update(encryptedDataBuffer, null, 'utf8') + decipher.final('utf8');

    this.logger.debug(`decoded:\n${decodedString}`);

    const decodedObject = JSON.parse(decodedString);

    if (decodedObject.watermark.appid !== appid) {
      throw new Error('appid not match');
    }

    return decodedObject;
  }

  public async decodeEncryptedXmlMessage(appNamespace: string, encrypted: string): Promise<any> {
    const { appId, token, aesKey } = await this.getAppIdAndSecret(appNamespace);
    const crypto = new WXMsgCrypto(appId, token, aesKey);
    const parser = new XMLParser();
    return parser.parse(crypto.decrypt(encrypted).message).xml;
  }

  public async validateWechatServer(appNamespace: string, signature: string, timestamp: string, nonce: string): Promise<boolean> {
    const { token } = await this.getAppIdAndSecret(appNamespace);
    // 1）将token、timestamp、nonce三个参数进行字典序排序
    const list = [token, timestamp, nonce].sort();
    // 2）将三个参数字符串拼接成一个字符串进行sha1加密
    const sign = createHash('sha1').update(list.join('')).digest('hex');
    // 3）开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
    return sign === signature;
  }

  public async getAccessToken(appNamespace: string): Promise<string> {
    const key = `${WECHAT_ACCESS_TOKEN}:${appNamespace}`;

    const tokenData = await this.redisClient.get(key);

    if (!tokenData) {
      this.logger.debug('no access token cached, fetching');

      const { appId, appSecret } = await this.getAppIdAndSecret(appNamespace);
      this.logger.debug(`found wechat app: ${appId} ${appSecret}`);

      // 请求token
      const accessTokenResponse = await this.fetchAccessToken(appId, appSecret);
      const { access_token } = accessTokenResponse;
      this.logger.debug(`fetched access token ${access_token}`);

      await this.redisClient.set(key, access_token, 'ex', 7100);

      return access_token;
    }

    return tokenData;
  }

  private async getAuthorizationCode(appid: string, secret: string, url: string, code: string): Promise<WxAuthorizationCode> {
    return (await this.getWxTokenOrCode(url, {
      appid,
      secret,
      code,
      grant_type: 'authorization_code',
    })) as WxAuthorizationCode;
  }

  private async fetchAccessToken(appid: string, secret: string): Promise<WxAccessToken> {
    return (await this.getWxTokenOrCode(`${WECHAT_API_ROOT}/cgi-bin/token`, {
      grant_type: 'client_credential',
      appid,
      secret,
    })) as WxAccessToken;
  }

  private async clearAccessTokens(): Promise<any> {
    const keys = await this.redisClient.keys(`${WECHAT_ACCESS_TOKEN}:*`);

    if (keys.length <= 0) {
      return;
    }

    const pipeline = this.redisClient.pipeline();
    keys.forEach((key: string) => pipeline.del(key));

    return pipeline.exec();
  }

  private async getWxTokenOrCode(url: string, params: any): Promise<any> {
    const response = await fetch(`${url}?${qs.stringify(params)}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  }

  private async getAppIdAndSecret(appNamespace: string): Promise<WechatApp> {
    return this.wechatAppRepo.findOne({
      name: appNamespace,
    });
  }
}
