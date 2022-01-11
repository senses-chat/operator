import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';
import { Client as Minio } from 'minio';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';
import qs from 'query-string';
import contentDisposition from 'content-disposition';
import { lookup } from 'mime-types';

import { KeyValueStorageBase, WXKF_KV_STORAGE, MinioService } from 'server/modules/storage';

import {
  WxkfCredentials,
  WxkfAccessToken,
  WxkfMessagePayload,
  WxkfSyncMsgResponse,
} from './models';
import { WxkfMsgCrypto } from './wxkf.crypto';
import { plainToInstance } from 'class-transformer';

const WXKF_ACCESS_TOKEN = 'wxkf:accessToken';
const WXKF_LATEST_CURSOR = 'wxkf:latestCursor';
const WXKF_API_ROOT = 'https://qyapi.weixin.qq.com';

@Injectable()
export class WxkfService {
  private readonly logger = new Logger(WxkfService.name);
  private minioClient: Minio;
  private credentials: WxkfCredentials;
  private assetsBucket: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly minioService: MinioService,
    @Inject(WXKF_KV_STORAGE)
    private readonly kvStorage: KeyValueStorageBase,
  ) {
    this.credentials = this.configService.get<WxkfCredentials>('wxkf.credentials');
    this.assetsBucket = this.configService.get<string>('wxkf.assetsBucket');
    this.minioClient = this.minioService.instance;

    // this.clearAccessTokens().then(() => {
    //   this.logger.debug('cleared wxkf access token');
    // });
  }

  public async downloadMedia(mediaId: string): Promise<string> {
    const access_token = await this.getAccessToken();
    const url = `${WXKF_API_ROOT}/cgi-bin/media/get?access_token=${access_token}&media_id=${mediaId}`;
    const response = await fetch(url);
    const contentType = response.headers.get('Content-Type');
    const cdHeaderValue = response.headers.get('Content-Disposition');
    const { filename } = contentDisposition.parse(cdHeaderValue).parameters;
    const buffer = await response.buffer();
    await this.minioClient.putObject(this.assetsBucket, filename, buffer, {
      'Content-Type': lookup(filename) || contentType,
    });
    return `s3://${this.assetsBucket}/${filename}`;
  }

  public validateWxkfRequestSignature(
    signature: string,
    timestamp: string,
    nonce: string,
    echostr: string,
  ): boolean {
    const { corpId, token, aesKey } = this.credentials;
    const crypto = new WxkfMsgCrypto(corpId, token, aesKey);
    const sign = crypto.getSignature(timestamp, nonce, echostr);
    return sign === signature;
  }

  public decryptXmlMessage(encryptedXml: string): any {
    const parser = new XMLParser();
    return parser.parse(this.decryptMessage(encryptedXml)).xml;
  }

  public decryptMessage(encrypted: string): string {
    const { corpId, token, aesKey } = this.credentials;
    const crypto = new WxkfMsgCrypto(corpId, token, aesKey);
    const { message, corpId: decryptedCorpId } = crypto.decrypt(encrypted);

    if (decryptedCorpId !== corpId) {
      throw new BadRequestException('invalid receiveID');
    }

    return message;
  }

  public async sendMessage(payload: WxkfMessagePayload): Promise<void> {
    const access_token = await this.getAccessToken();

    if (payload.code) {
      const response = await fetch(
        `${WXKF_API_ROOT}/cgi-bin/kf/send_msg_on_event?access_token=${access_token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );

      return response.json();
    }

    const response = await fetch(
      `${WXKF_API_ROOT}/cgi-bin/kf/send_msg?access_token=${access_token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );

    return response.json();
  }

  public async syncMessage(
    token?: string,
    limit = 1000,
  ): Promise<WxkfSyncMsgResponse> {
    const access_token = await this.getAccessToken();
    const cursor = await this.getLatestCursor();
    let doneFetching = false;

    let result: WxkfSyncMsgResponse;

    while (!doneFetching) {
      const response = await fetch(
        `${WXKF_API_ROOT}/cgi-bin/kf/sync_msg?access_token=${access_token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            cursor,
            limit,
          }),
        },
      );

      const resultJson = await response.json();
      this.logger.debug(JSON.stringify(resultJson));
      result = plainToInstance(WxkfSyncMsgResponse, resultJson);

      if (result.next_cursor) {
        await this.setLatestCursor(result.next_cursor);
      }

      if (result.has_more === 0) {
        doneFetching = true;
      }
    }

    return result;
  }

  private async getLatestCursor(): Promise<string | null> {
    const key = `${WXKF_LATEST_CURSOR}`;
    const cursorData = await this.kvStorage.get(key);
    return cursorData;
  }

  private async setLatestCursor(cursor: string): Promise<void> {
    const key = `${WXKF_LATEST_CURSOR}`;
    await this.kvStorage.set(key, cursor);
  }

  public async getAccessToken(): Promise<string> {
    const key = `${WXKF_ACCESS_TOKEN}`;

    const tokenData = await this.kvStorage.get(key);

    if (!tokenData) {
      this.logger.debug('no wxkf access token cached, fetching');

      const { corpId, secret } = this.credentials;

      // 请求token
      const accessTokenResponse = await this.fetchAccessToken(corpId, secret);
      const { access_token } = accessTokenResponse;
      this.logger.debug(`fetched wxkf access token ${access_token}`);

      await this.kvStorage.set(key, access_token, 7100);

      return access_token;
    }

    return tokenData;
  }

  private async fetchAccessToken(
    corpid: string,
    corpsecret: string,
  ): Promise<WxkfAccessToken> {
    return (await this.getRequest(`${WXKF_API_ROOT}/cgi-bin/gettoken`, {
      corpid,
      corpsecret,
    })) as WxkfAccessToken;
  }

  private async getRequest(url: string, params: any): Promise<any> {
    const response = await fetch(`${url}?${qs.stringify(params)}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  }

  // private async clearAccessTokens(): Promise<any> {
  //   const keys = await this.redisClient.keys(`${WXKF_ACCESS_TOKEN}`);

  //   if (keys.length <= 0) {
  //     return;
  //   }

  //   const pipeline = this.redisClient.pipeline();
  //   keys.forEach((key: string) => pipeline.del(key));

  //   return pipeline.exec();
  // }
}
