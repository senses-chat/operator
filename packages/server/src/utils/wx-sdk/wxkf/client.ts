import fetch from 'node-fetch';
import FormData from 'form-data';
import contentDisposition from 'content-disposition';
import { lookup as lookupMimeType } from 'mime-types';
import { XMLParser } from 'fast-xml-parser';

import { plainToInstance } from 'src/utils/transformer';

import {
  WxkfMessagePayload,
  WxkfSyncMsgInput,
  WxkfSyncMsgResponse,
  WxkfSendMsgResponse,
  WxkfMediaUploadInput,
  WxkfMediaUploadResponse,
  WxkfMediaGetResponse,
  WxkfAddContactWayInput,
  WxkfAccountUpdateInput,
  WxkfAccountAddInput,
  WxkfAccountAddResponse,
  WxkfAccountListResponse,
  WxkfAccountDeleteInput,
  WxkfAddContactWayResponse,
} from './model';
import { WxBaseClient } from '../client';
import { WxResponse, WxAccessTokenResponse } from '../model';
import { WxMsgCrypto } from '../crypto';

export interface WxkfClientOptions {
  corpId: string;
  secret?: string;
  token?: string;
  aesKey?: string;
  getAccessTokenFromCache?: (corpId: string) => Promise<string | undefined>;
  storeAccessTokenToCache?: (
    corpId: string,
    accessToken: string,
    expiresIn: number,
  ) => Promise<void>;
}

export class WxkfClient extends WxBaseClient {
  private static URL_PREFIX = 'https://qyapi.weixin.qq.com/cgi-bin';

  private readonly corpId: string;
  private readonly corpSecret: string | undefined;
  private readonly token?: string;
  private readonly aesKey?: string;
  private readonly getAccessTokenFromCache?: (
    corpId: string,
  ) => Promise<string | undefined>;
  private readonly storeAccessTokenToCache?: (
    corpId: string,
    accessToken: string,
    expiresIn: number,
  ) => Promise<void>;

  constructor(options: WxkfClientOptions) {
    super(WxkfClient.URL_PREFIX);

    this.corpId = options.corpId;
    this.corpSecret = options.secret;
    this.token = options.token;
    this.aesKey = options.aesKey;
    this.getAccessTokenFromCache = options.getAccessTokenFromCache;
    this.storeAccessTokenToCache = options.storeAccessTokenToCache;
  }

  public async listAccounts(): Promise<WxkfAccountListResponse> {
    const access_token = await this.fetchAccessToken();
    const url = this.url('/kf/account/list', { access_token });
    return this.request(WxkfAccountListResponse, url);
  }

  public async addAccount(
    input: WxkfAccountAddInput,
  ): Promise<WxkfAccountAddResponse> {
    const access_token = await this.fetchAccessToken();
    const url = this.url('/kf/account/add', { access_token });
    return this.request(WxkfAccountAddResponse, url, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  public async deleteAccount(
    input: WxkfAccountDeleteInput,
  ): Promise<WxResponse> {
    const access_token = await this.fetchAccessToken();
    const url = this.url('/kf/account/del', { access_token });
    return this.request(WxResponse, url, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  public async updateAccount(
    input: WxkfAccountUpdateInput,
  ): Promise<WxResponse> {
    const access_token = await this.fetchAccessToken();
    const url = this.url('/kf/account/update', { access_token });
    return this.request(WxkfAddContactWayResponse, url, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  public async addContactWay(
    input: WxkfAddContactWayInput,
  ): Promise<WxkfAddContactWayResponse> {
    const access_token = await this.fetchAccessToken();
    const url = this.url('/kf/add_contact_way', { access_token });
    return this.request(WxkfAddContactWayResponse, url, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  public async getMedia(media_id: string): Promise<WxkfMediaGetResponse> {
    const access_token = await this.fetchAccessToken();

    const url = this.url('/media/get', { access_token, media_id });
    const response = await fetch(url);
    const contentType = response.headers.get('Content-Type');
    const cdHeaderValue = response.headers.get('Content-Disposition');

    if (contentType === 'application/json' || !cdHeaderValue) {
      // should be error response
      const json = await response.json();
      throw new Error(
        `Wxkf Media Get Error code ${json.errcode}: ${json.errmsg}`,
      );
    }

    const { filename } = contentDisposition.parse(cdHeaderValue).parameters;
    const media = await response.buffer();

    return plainToInstance(WxkfMediaGetResponse, {
      media,
      filename,
      // content-type header doesn't seem to be accurate, use it as fallback
      contentType: lookupMimeType(filename) || contentType,
    });
  }

  public async uploadMedia(
    input: WxkfMediaUploadInput,
  ): Promise<WxkfMediaUploadResponse> {
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

    return this.request(WxkfMediaUploadResponse, url, {
      method: 'POST',
      headers: form.getHeaders(),
      body: form,
    });
  }

  public async sendMessage(
    payload: WxkfMessagePayload,
  ): Promise<WxkfSendMsgResponse> {
    const access_token = await this.fetchAccessToken();

    if (payload.code) {
      return this.request(
        WxkfSendMsgResponse,
        this.url('/kf/send_msg_on_event', { access_token }),
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );
    }

    return this.request(
      WxkfSendMsgResponse,
      this.url('/kf/send_msg', { access_token }),
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  }

  public async syncMessage(
    input: WxkfSyncMsgInput,
    recursive = false,
  ): Promise<WxkfSyncMsgResponse> {
    const access_token = await this.fetchAccessToken();

    const url = this.url('/kf/sync_msg', { access_token });

    const response = await this.request(WxkfSyncMsgResponse, url, {
      method: 'POST',
      body: JSON.stringify(input),
    });

    while (recursive && response.has_more > 0) {
      input = {
        ...input,
        cursor: response.next_cursor,
      };

      const nextResponse = await this.request(WxkfSyncMsgResponse, url, {
        method: 'POST',
        body: JSON.stringify(input),
      });

      response.msg_list = response.msg_list.concat(nextResponse.msg_list);
      response.next_cursor = nextResponse.next_cursor;
      response.has_more = nextResponse.has_more;
    }

    return response;
  }

  public async fetchAccessToken(): Promise<string> {
    if (this.getAccessTokenFromCache) {
      const cachedAccessToken = await this.getAccessTokenFromCache(this.corpId);
      if (cachedAccessToken) {
        return cachedAccessToken;
      }
    }

    if (!this.corpSecret) {
      throw new Error('cannot get access token without corp secret');
    }

    const url = this.url('/gettoken', {
      corpid: this.corpId,
      corpsecret: this.corpSecret,
    });
    const response = await this.request(WxAccessTokenResponse, url);

    if (this.storeAccessTokenToCache) {
      await this.storeAccessTokenToCache(
        this.corpId,
        response.access_token,
        response.expires_in,
      );
    }

    return response.access_token;
  }

  public validateWxkfRequestSignature(
    signature: string,
    timestamp: string,
    nonce: string,
    echostr: string,
  ): boolean {
    const crypto = new WxMsgCrypto(this.corpId, this.token, this.aesKey);
    const sign = crypto.getSignature(timestamp, nonce, echostr);
    return sign === signature;
  }

  public decryptXmlMessage(encryptedXml: string): any {
    const parser = new XMLParser();
    return parser.parse(this.decryptMessage(encryptedXml)).xml;
  }

  public decryptMessage(encrypted: string): string {
    const crypto = new WxMsgCrypto(this.corpId, this.token, this.aesKey);
    const { message, id: decryptedCorpId } = crypto.decrypt(encrypted);

    if (decryptedCorpId !== this.corpId) {
      throw new Error('invalid receiveId');
    }

    return message;
  }
}
