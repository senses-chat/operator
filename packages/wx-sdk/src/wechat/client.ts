import { XMLParser } from 'fast-xml-parser';
import { WxBaseClient } from '../client';
import { WxMsgCrypto } from '../crypto';
import { WxAccessTokenResponse } from '../model';

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

  private readonly appId: string;
  private readonly appSecret?: string;
  private readonly token?: string;
  private readonly aesKey?: string;
  private readonly getAccessTokenFromCache?: (
    appId: string,
  ) => Promise<string | undefined>;
  private readonly storeAccessTokenToCache?: (
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

  public validateRequestSignature(
    signature: string,
    timestamp: string,
    nonce: string,
    echostr: string,
  ): boolean {
    const crypto = new WxMsgCrypto(this.appId, this.token, this.aesKey);
    const sign = crypto.getSignature(timestamp, nonce, echostr);
    return sign === signature;
  }

  public decryptXmlMessage(encryptedXml: string): any {
    const parser = new XMLParser();
    return parser.parse(this.decryptMessage(encryptedXml)).xml;
  }

  public decryptMessage(encrypted: string): string {
    const crypto = new WxMsgCrypto(this.appId, this.token, this.aesKey);
    const { message, id: decryptedAppId } = crypto.decrypt(encrypted);

    if (decryptedAppId !== this.appId) {
      throw new Error('invalid receiveId');
    }

    return message;
  }
}
