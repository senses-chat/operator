import { WxResponse } from "../model";

export class WxAuthorizationCodeResponse extends WxResponse {
  openid: string;
  unionid?: string;
  session_key?: string;
}
