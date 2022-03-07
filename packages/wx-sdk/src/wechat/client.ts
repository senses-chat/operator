import fetch from 'node-fetch';
import FormData from 'form-data';
import contentDisposition from 'content-disposition';
import { lookup as lookupMimeType } from 'mime-types';
import { plainToInstance } from 'class-transformer';

import { WxBaseClient } from '../client';
import { WxMsgCrypto } from '../crypto';
import { WxAccessTokenResponse, WxResponse } from '../model';
import {
  WechatMediaGetResponse,
  WechatMediaUploadInput,
  WechatMediaUploadResponse,
  WechatMessageInput,
  WechatVideoUrlResponse,
} from './model';

export interface WechatClientOptions {
  appId: string;
  secret?: string;
  token?: string;
  aesKey?: string;
  getAccessTokenFromCache?: (appId: string) => Promise<string | undefined>;
  storeAccessTokenToCache?: (
    appId: string,
    accessToken: string,
    expiresIn: number,
  ) => Promise<void>;
}

export class WechatClient extends WxBaseClient {
  private static URL_PREFIX = 'https://api.weixin.qq.com/cgi-bin';

  protected readonly appId: string;
  protected readonly appSecret?: string;
  protected readonly token?: string;
  protected readonly aesKey?: string;
  protected readonly getAccessTokenFromCache?: (
    appId: string,
  ) => Promise<string | undefined>;
  protected readonly storeAccessTokenToCache?: (
    appId: string,
    accessToken: string,
    expiresIn: number,
  ) => Promise<void>;

  constructor(options: WechatClientOptions) {
    super(WechatClient.URL_PREFIX);

    this.appId = options.appId;
    this.appSecret = options.secret;
    this.token = options.token;
    this.aesKey = options.aesKey;
    this.getAccessTokenFromCache = options.getAccessTokenFromCache;
    this.storeAccessTokenToCache = options.storeAccessTokenToCache;
  }

  public async uploadMedia(
    input: WechatMediaUploadInput,
  ): Promise<WechatMediaUploadResponse> {
    const access_token = await this.fetchAccessToken();

    const { type, media, filename, filepath, contentType, knownLength } = input;

    const form = new FormData();
    form.append('media', media, {
      filename,
      filepath,
      contentType,
      knownLength,
    });

    const url = this.url('/media/upload', { access_token, type });

    return this.request(WechatMediaUploadResponse, url, {
      method: 'POST',
      headers: form.getHeaders(),
      body: form,
    });
  }

  public async getMedia(
    media_id: string,
    isFromJsSDK?: boolean,
  ): Promise<WechatMediaGetResponse | WechatVideoUrlResponse | WxResponse> {
    const access_token = await this.fetchAccessToken();

    const url = this.url(isFromJsSDK ? '/media/get/jssdk' : '/media/get', {
      access_token,
      media_id,
    });
    const response = await fetch(url);
    const contentType = response.headers.get('Content-Type');
    const cdHeaderValue = response.headers.get('Content-Disposition');

    if (contentType === 'application/json' || !cdHeaderValue) {
      const json: any = await response.json();

      if (!json.video_url) {
        throw new Error(
          `Wxkf Media Get Error code ${json.errcode}: ${json.errmsg}`,
        );
      }

      return plainToInstance(WechatVideoUrlResponse, json);
    }

    const { filename } = contentDisposition.parse(cdHeaderValue).parameters;
    const media = await response.buffer();

    return plainToInstance(WechatMediaGetResponse, {
      media,
      filename,
      // content-type header doesn't seem to be accurate, use it as fallback
      contentType: lookupMimeType(filename) || contentType,
    });
  }

  public async messageCustomSend(
    input: WechatMessageInput,
  ): Promise<WxResponse> {
    const access_token = await this.fetchAccessToken();
    const url = this.url('/message/custom/send', { access_token });
    return this.request(WxResponse, url, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  public async fetchAccessToken(): Promise<string> {
    if (this.getAccessTokenFromCache) {
      const cachedAccessToken = await this.getAccessTokenFromCache(this.appId);
      if (cachedAccessToken) {
        return cachedAccessToken;
      }
    }

    if (!this.appSecret) {
      throw new Error('cannot get access token without app secret');
    }

    const url = this.url('/token', {
      grant_type: 'client_credential',
      appid: this.appId,
      secret: this.appSecret,
    });

    const response = await this.request(WxAccessTokenResponse, url);

    if (this.storeAccessTokenToCache) {
      await this.storeAccessTokenToCache(
        this.appId,
        response.access_token,
        response.expires_in,
      );
    }

    return response.access_token;
  }

  protected getCrypto(): WxMsgCrypto {
    return new WxMsgCrypto(this.appId, this.token, this.aesKey);
  }
}
