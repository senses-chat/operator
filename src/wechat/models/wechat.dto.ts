import { Type } from 'class-transformer';

export interface Wechat3rdPartyCredentials {
  appId: string;
  appSecret: string;
  aesKey: string;
  token: string;
}

export interface WxAuthorizationCode {
  openid: string;
  unionid?: string;
  session_key?: string;
}

export interface WxAccessToken {
  access_token?: string;
}

export interface WxACodeUnlimitedDto {
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

// TODO: make this into classes using class-transformer
export interface WxIncomingMessage {
  appNamespace: string;
  ToUserName: string;
  FromUserName: string;
  CreateTime: number;
  MsgType: string;
  Event?: string;
  Content?: string;
  SessionFrom?: string;
}

export class WxMessagePayload {
  touser: string;
  msgtype: string;
}

export enum WxMessageType {
  Text = 'text',
  Image = 'image',
  Link = 'link',
  MiniprogramPage = 'miniprogrampage',
}

export class WxTextMessagePayload extends WxMessagePayload {
  text: {
    content: string;
  };
}

export class WxImageMessagePayload extends WxMessagePayload {
  image: {
    media_id: string;
  };
}

export class WxLinkMessagePayload extends WxMessagePayload {
  link: {
    title: string;
    description: string;
    url: string;
    thumb_url: string;
  };
}

export class WxMiniprogramPageMessagePayload extends WxMessagePayload {
  miniprogrampage: {
    title: string;
    pathpath: string;
    thumb_media_id: string;
  };
}

export class WxMessageContainer {
  @Type(() => WxMessagePayload, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'msgtype',
      subTypes: [
        { value: WxTextMessagePayload, name: WxMessageType.Text },
        { value: WxImageMessagePayload, name: WxMessageType.Image },
        { value: WxLinkMessagePayload, name: WxMessageType.Link },
        { value: WxMiniprogramPageMessagePayload, name: WxMessageType.MiniprogramPage },
      ],
    },
  })
  message: WxMessagePayload;
}
