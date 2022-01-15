export interface Constructor<T = any> extends Function {
  new (...args: any[]): T;
}

export class WxResponse {
  errcode: number;
  errmsg: string;
}

export class WxAccessTokenResponse extends WxResponse {
  access_token: string;
  expires_in: number; // seconds
}
