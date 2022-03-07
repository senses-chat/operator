import { WxBaseClient } from '../client';
import { WxMsgCrypto } from '../crypto';
import { WxOpenAccessTokenResponse } from './model';

export interface WechatOpenClientOptions {
  appId: string;
  secret?: string;
  token?: string;
  aesKey?: string;
  getAccessTokenFromCache?: (appId: string) => Promise<string | undefined>;
  storeAccessTokenToCache?: (
    appId: string,
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
  ) => Promise<void>;
}

export class WechatOpenClient extends WxBaseClient {
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
    refreshToken: string,
    expiresIn: number,
  ) => Promise<void>;

  constructor(options: WechatOpenClientOptions) {
    super(WechatOpenClient.URL_PREFIX);

    this.appId = options.appId;
    this.appSecret = options.secret;
    this.token = options.token;
    this.aesKey = options.aesKey;
    this.getAccessTokenFromCache = options.getAccessTokenFromCache;
    this.storeAccessTokenToCache = options.storeAccessTokenToCache;
  }

  public async refreshAccessToken(refresh_token: string): Promise<string> {
    const url = this.url('/sns/oauth2/refresh_token', {
      grant_type: 'refresh_token',
      appid: this.appId,
      refresh_token,
    });

    const response = await this.request(WxOpenAccessTokenResponse, url);

    if (this.storeAccessTokenToCache) {
      await this.storeAccessTokenToCache(
        this.appId,
        response.access_token,
        response.refresh_token,
        response.expires_in,
      );
    }

    return response.access_token;
  }

  public async fetchAccessToken(code?: string): Promise<string> {
    if (this.getAccessTokenFromCache) {
      const cachedAccessToken = await this.getAccessTokenFromCache(this.appId);
      if (cachedAccessToken) {
        return cachedAccessToken;
      }
    }

    if (!this.appSecret || !code) {
      throw new Error('cannot get access token without app secret or code');
    }

    const url = this.url('/sns/oauth2/access_token', {
      grant_type: 'authorization_code',
      appid: this.appId,
      secret: this.appSecret,
      code,
    });

    const response = await this.request(WxOpenAccessTokenResponse, url);

    if (this.storeAccessTokenToCache) {
      await this.storeAccessTokenToCache(
        this.appId,
        response.access_token,
        response.refresh_token,
        response.expires_in,
      );
    }

    return response.access_token;
  }

  protected getCrypto(): WxMsgCrypto {
    return new WxMsgCrypto(this.appId, this.token, this.aesKey);
  }
}
