import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';
import { Redis } from 'ioredis';
import { ConfigService } from 'nestjs-config';
import { RedisService } from 'nestjs-redis';
import fetch from 'node-fetch';
import qs from 'query-string';

import { WecomCredentials, WxAccessToken } from './models';
import { WecomMsgCrypto } from './wecom.crypto';

const WECOM_ACCESS_TOKEN = 'wecom:accessToken';
const WECOM_API_ROOT = 'https://qyapi.weixin.qq.com';

@Injectable()
export class WecomService {
  private readonly logger = new Logger(WecomService.name);
  private redisClient: Redis;
  private credentials: WecomCredentials;

  constructor(private readonly configService: ConfigService, private readonly redisService: RedisService) {
    this.credentials = this.configService.get('wecom');
    this.redisClient = this.redisService.getClient('wechat');

    this.clearAccessTokens().then(() => {
      this.logger.debug('cleared wecom access token');
    });
  }

  public validateWecomRequestSignature(signature: string, timestamp: string, nonce: string, echostr: string): boolean {
    const { corpId, token, aesKey } = this.credentials;
    const crypto = new WecomMsgCrypto(corpId, token, aesKey);
    const sign = crypto.getSignature(timestamp, nonce, echostr);
    return sign === signature;
  }

  public decryptXmlMessage(encryptedXml: string): any {
    const parser = new XMLParser();
    return parser.parse(this.decryptMessage(encryptedXml)).xml;
  }

  public decryptMessage(encrypted: string): string {
    const { corpId, token, aesKey } = this.credentials;
    const crypto = new WecomMsgCrypto(corpId, token, aesKey);
    const { message, corpId: decryptedCorpId } = crypto.decrypt(encrypted);

    if (decryptedCorpId !== corpId) {
      throw new BadRequestException('invalid receiveID');
    }

    return message;
  }

  public async getAccessToken(): Promise<string> {
    const key = `${WECOM_ACCESS_TOKEN}`;

    const tokenData = await this.redisClient.get(key);

    if (!tokenData) {
      this.logger.debug('no wecom access token cached, fetching');

      const { corpId, corpSecret } = this.credentials;

      // 请求token
      const accessTokenResponse = await this.fetchAccessToken(corpId, corpSecret);
      const { access_token } = accessTokenResponse;
      this.logger.debug(`fetched wecom access token ${access_token}`);

      await this.redisClient.set(key, access_token, 'ex', 7100);

      return access_token;
    }

    return tokenData;
  }

  private async fetchAccessToken(corpid: string, corpsecret: string): Promise<WxAccessToken> {
    return (await this.getWxTokenOrCode(`${WECOM_API_ROOT}/cgi-bin/gettoken`, {
      corpid,
      corpsecret,
    })) as WxAccessToken;
  }

  private async getWxTokenOrCode(url: string, params: any): Promise<any> {
    const response = await fetch(`${url}?${qs.stringify(params)}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  }

  private async clearAccessTokens(): Promise<any> {
    const keys = await this.redisClient.keys(`${WECOM_ACCESS_TOKEN}`);

    if (keys.length <= 0) {
      return;
    }

    const pipeline = this.redisClient.pipeline();
    keys.forEach((key: string) => pipeline.del(key));

    return pipeline.exec();
  }
}
