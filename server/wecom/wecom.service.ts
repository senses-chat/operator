import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'nestjs-redis';
import fetch from 'node-fetch';
import qs from 'query-string';

import { WecomCredentials, WecomAccessToken, WecomMessagePayload, WecomSyncMsgResponse } from './models';
import { WecomMsgCrypto } from './wecom.crypto';
import { plainToInstance } from 'class-transformer';

const WECOM_ACCESS_TOKEN = 'wecom:accessToken';
const WECOM_LATEST_CURSOR = 'wecom:latestCursor';
const WECOM_API_ROOT = 'https://qyapi.weixin.qq.com';

@Injectable()
export class WecomService {
  private readonly logger = new Logger(WecomService.name);
  private redisClient: Redis;
  private credentials: WecomCredentials;

  constructor(private readonly configService: ConfigService, private readonly redisService: RedisService) {
    this.credentials = this.configService.get('wecom');
    this.redisClient = this.redisService.getClient('wecom');

    // this.clearAccessTokens().then(() => {
    //   this.logger.debug('cleared wecom access token');
    // });
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

  public async sendMessage(payload: WecomMessagePayload, code?: string): Promise<void> {
    const access_token = await this.getAccessToken();

    if (code) {
      const response = await fetch(`${WECOM_API_ROOT}/cgi-bin/kf/send_msg_on_event?access_token=${access_token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          code,
        }),
      });

      return response.json();
    }

    const response = await fetch(`${WECOM_API_ROOT}/cgi-bin/kf/send_msg?access_token=${access_token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return response.json();
  }

  public async syncMessage(token: string, limit = 1000): Promise<WecomSyncMsgResponse> {
    const access_token = await this.getAccessToken();
    const cursor = await this.getLatestCursor();

    const response = await fetch(`${WECOM_API_ROOT}/cgi-bin/kf/sync_msg?access_token=${access_token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        cursor,
        limit,
      }),
    });

    const resultJson = await response.json();
    this.logger.debug(JSON.stringify(resultJson));
    const result = plainToInstance(WecomSyncMsgResponse, resultJson);

    if (result.next_cursor) {
      await this.setLatestCursor(result.next_cursor);
    }

    return result;
  }

  private async getLatestCursor(): Promise<string | null> {
    const key = `${WECOM_LATEST_CURSOR}`;
    const cursorData = await this.redisClient.get(key);
    return cursorData;
  }

  private async setLatestCursor(cursor: string): Promise<void> {
    const key = `${WECOM_LATEST_CURSOR}`;
    await this.redisClient.set(key, cursor);
  }

  public async getAccessToken(): Promise<string> {
    const key = `${WECOM_ACCESS_TOKEN}`;

    const tokenData = await this.redisClient.get(key);

    if (!tokenData) {
      this.logger.debug('no wecom access token cached, fetching');

      const { corpId, secret } = this.credentials;

      // 请求token
      const accessTokenResponse = await this.fetchAccessToken(corpId, secret);
      const { access_token } = accessTokenResponse;
      this.logger.debug(`fetched wecom access token ${access_token}`);

      await this.redisClient.set(key, access_token, 'ex', 7100);

      return access_token;
    }

    return tokenData;
  }

  private async fetchAccessToken(corpid: string, corpsecret: string): Promise<WecomAccessToken> {
    return (await this.getRequest(`${WECOM_API_ROOT}/cgi-bin/gettoken`, {
      corpid,
      corpsecret,
    })) as WecomAccessToken;
  }

  private async getRequest(url: string, params: any): Promise<any> {
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