import { WxResponse } from "../model";

export class WechatMiniCode2SessionResponse extends WxResponse {
  openid: string;
  session_key: string;
  unionid?: string;
}

export class WechatMiniGetWxaCodeUnlimitInput {
  scene: string;
  page?: string;
  width?: number;
  auto_color?: boolean;
  line_color?: {
    r: number;
    g: number;
    b: number;
  };
  is_hyaline?: boolean;
}
