export interface WechatCredentials {
  appId: string;
  secret?: string;
  token?: string;
  aesKey?: string;
}

export interface Wechat3rdPartyCredentials {
  appId: string;
  appSecret: string;
  aesKey: string;
  token: string;
}
