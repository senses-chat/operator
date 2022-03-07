import { Type } from 'class-transformer';
import { Readable } from 'stream';

import { WxResponse } from '../model';

export class WxAuthorizationCodeResponse extends WxResponse {
  openid: string;
  unionid?: string;
  session_key?: string;
}

export class WechatMedia {
  media_id: string;
}

export enum WechatMediaType {
  Image = 'image',
  Voice = 'voice',
  Video = 'video',
  Thumb = 'thumb',
}

export class WechatMediaUploadInput {
  type: WechatMediaType;
  media: Buffer | Readable;
  filename?: string;
  filepath?: string;
  contentType?: string;
  knownLength?: number;
}

export class WechatMediaUploadResponse extends WxResponse {
  type: WechatMediaType;
  media_id: string;
  created_at: number;
}

export class WechatMediaGetResponse {
  media: Buffer | Readable;
  filename: string;
  contentType: string;
}

export class WechatVideoUrlResponse extends WxResponse {
  video_url: string;
}

export class WechatMessageInput {
  touser: string;
  msgtype: string;
}

export enum WechatMessageType {
  Text = 'text',
  Image = 'image',
  Link = 'link',
  MiniprogramPage = 'miniprogrampage',
}

export class WechatTextMessagePayload extends WechatMessageInput {
  text: {
    content: string;
  };
}

export class WechatImageMessagePayload extends WechatMessageInput {
  image: WechatMedia;
}

export class WechatLinkMessagePayload extends WechatMessageInput {
  link: {
    title: string;
    description: string;
    url: string;
    thumb_url: string;
  };
}

export class WechatMiniProgramPageMessagePayload extends WechatMessageInput {
  miniprogrampage: {
    title: string;
    pathpath: string;
    thumb_media_id: string;
  };
}

export class WechatMessageContainer {
  @Type(() => WechatMessageInput, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'msgtype',
      subTypes: [
        { value: WechatTextMessagePayload, name: WechatMessageType.Text },
        { value: WechatImageMessagePayload, name: WechatMessageType.Image },
        { value: WechatLinkMessagePayload, name: WechatMessageType.Link },
        {
          value: WechatMiniProgramPageMessagePayload,
          name: WechatMessageType.MiniprogramPage,
        },
      ],
    },
  })
  message: WechatMessageInput;
}
