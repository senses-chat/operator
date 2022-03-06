import { WxAccessTokenResponse } from "../model";

export class WxOpenAccessTokenResponse extends WxAccessTokenResponse {
  refresh_token: string;
  openid: string;
  scope: string;
  unionid?: string;
}
