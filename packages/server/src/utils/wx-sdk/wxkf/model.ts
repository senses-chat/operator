import { Type } from 'src/utils/transformer';
import { Readable } from 'stream';

import { WxResponse } from '../model';

export enum WxkfMediaType {
  Image = 'image',
  Voice = 'voice',
  Video = 'video',
  File = 'file',
}

export class WxkfMedia {
  media_id: string;
}

export enum WxkfIncomingMessageOrigin {
  FromUser = 3,
  FromSystem = 4,
}

export enum WxkfIncomingMessageType {
  Text = 'text',
  Image = 'image',
  Voice = 'voice',
  Video = 'video',
  File = 'file',
  Location = 'location',
  Event = 'event',
}

export enum WxkfIncomingEventType {
  EnterSession = 'enter_session',
  MsgSendFail = 'msg_send_fail',
}

export class WxkfIncomingEvent {
  event_type: WxkfIncomingEventType;
  open_kfid: string;
  external_userid: string;
}

export class WxkfEnterSessionEvent extends WxkfIncomingEvent {
  event_type: WxkfIncomingEventType.EnterSession;
  scene: string;
  scene_param?: string;
  welcome_code?: string;
}

export class WxkfMsgSendFailEvent extends WxkfIncomingEvent {
  event_type: WxkfIncomingEventType.MsgSendFail;
  fail_msgid: string;
  fail_type: number; // TODO: enum?
}

export class WxkfIncomingMessage {
  corpid: string;
  msgid: string;
  open_kfid: string;
  external_userid: string;
  send_time: number;
  origin: WxkfIncomingMessageOrigin;
  msgtype: WxkfIncomingMessageType;
}

export class WxkfIncomingEventMessage extends WxkfIncomingMessage {
  msgtype: WxkfIncomingMessageType.Event;

  @Type(() => WxkfIncomingEvent, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'event_type',
      subTypes: [
        {
          value: WxkfEnterSessionEvent,
          name: WxkfIncomingEventType.EnterSession,
        },
        {
          value: WxkfMsgSendFailEvent,
          name: WxkfIncomingEventType.MsgSendFail,
        },
      ],
    },
  })
  event: WxkfIncomingEvent;
}

export class WxkfIncomingTextMessage extends WxkfIncomingMessage {
  msgtype: WxkfIncomingMessageType.Text;
  text: {
    content: string;
    menu_id?: string;
  };
}

export class WxkfIncomingImageMessage extends WxkfIncomingMessage {
  msgtype: WxkfIncomingMessageType.Image;
  image: WxkfMedia;
}

export class WxkfIncomingVoiceMessage extends WxkfIncomingMessage {
  msgtype: WxkfIncomingMessageType.Voice;
  voice: WxkfMedia;
}

export class WxkfIncomingVideoMessage extends WxkfIncomingMessage {
  msgtype: WxkfIncomingMessageType.Video;
  video: WxkfMedia;
}

export class WxkfIncomingFileMessage extends WxkfIncomingMessage {
  msgtype: WxkfIncomingMessageType.File;
  file: WxkfMedia;
}

export class WxkfIncomingLocationMessage extends WxkfIncomingMessage {
  msgtype: WxkfIncomingMessageType.Location;
  location: {
    latitude: number;
    longitude: number;
    name: string;
    address: string;
  };
}

export class WxkfSyncMsgResponse extends WxResponse {
  next_cursor?: string;
  has_more?: 0 | 1;

  @Type(() => WxkfIncomingMessage, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'msgtype',
      subTypes: [
        { value: WxkfIncomingTextMessage, name: WxkfIncomingMessageType.Text },
        {
          value: WxkfIncomingImageMessage,
          name: WxkfIncomingMessageType.Image,
        },
        {
          value: WxkfIncomingVoiceMessage,
          name: WxkfIncomingMessageType.Voice,
        },
        {
          value: WxkfIncomingVideoMessage,
          name: WxkfIncomingMessageType.Video,
        },
        { value: WxkfIncomingFileMessage, name: WxkfIncomingMessageType.File },
        {
          value: WxkfIncomingLocationMessage,
          name: WxkfIncomingMessageType.Location,
        },
        {
          value: WxkfIncomingEventMessage,
          name: WxkfIncomingMessageType.Event,
        },
      ],
    },
  })
  msg_list?: WxkfIncomingMessage[];
}

export class WxkfMessagePayload {
  touser?: string;
  open_kfid?: string;
  code?: string;
  msgid?: string;
  msgtype: string;
}

export enum WxkfMessageType {
  Text = 'text',
  Image = 'image',
  Voice = 'voice',
  Video = 'video',
  File = 'file',
  Link = 'link',
  Miniprogram = 'miniprogram',
  Menu = 'msgmenu',
  Location = 'location',
}

export class WxkfTextMessagePaylaod extends WxkfMessagePayload {
  text: {
    content: string;
  };
}

export class WxkfImageMessagePayload extends WxkfMessagePayload {
  image: WxkfMedia;
}

export class WxkfVoiceMessagePayload extends WxkfMessagePayload {
  voice: WxkfMedia;
}

export class WxkfVideoMessagePayload extends WxkfMessagePayload {
  video: WxkfMedia;
}

export class WxkfFileMessagePayload extends WxkfMessagePayload {
  file: WxkfMedia;
}

export class WxkfLinkMessagePayload extends WxkfMessagePayload {
  link: {
    title: string;
    desc: string;
    url: string;
    thumb_media_id: string;
  };
}

export class WxkfMiniprogramMessagePayload extends WxkfMessagePayload {
  miniprogram: {
    appid: string;
    title: string;
    pagepath: string;
    thumb_media_id: string;
  };
}

export class WxkfLocationMessagePayload extends WxkfMessagePayload {
  location: {
    latitude: number;
    longitude: number;
    name: string;
    address: string;
  };
}

export enum WxkfMenuType {
  Click = 'click',
  View = 'view',
  Miniprogram = 'miniprogram',
}

export class WxkfMenuItem {
  type: WxkfMenuType;
}

export class WxkfClickMenuItem extends WxkfMenuItem {
  type: WxkfMenuType.Click;
  click: {
    id: string;
    content: string;
  };
}

export class WxkfLinkMenuItem extends WxkfMenuItem {
  type: WxkfMenuType.View;
  view: {
    url: string;
    content: string;
  };
}

export class WxkfMiniprogramMenuItem extends WxkfMenuItem {
  type: WxkfMenuType.Miniprogram;
  miniprogram: {
    appid: string;
    pagepath: string;
    content: string;
  };
}

export class WxkfMsgMenu {
  head_content: string;
  tail_content: string;

  @Type(() => WxkfMenuItem, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'type',
      subTypes: [
        { value: WxkfClickMenuItem, name: WxkfMenuType.Click },
        { value: WxkfLinkMenuItem, name: WxkfMenuType.View },
        { value: WxkfMiniprogramMenuItem, name: WxkfMenuType.Miniprogram },
      ],
    },
  })
  list: WxkfMenuItem[];
}

export class WxkfMenuMessagePayload extends WxkfMessagePayload {
  msgmenu: WxkfMsgMenu;
}

export class WxkfMessageContainer {
  @Type(() => WxkfMessagePayload, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'msgtype',
      subTypes: [
        { value: WxkfTextMessagePaylaod, name: WxkfMessageType.Text },
        { value: WxkfImageMessagePayload, name: WxkfMessageType.Image },
        { value: WxkfVoiceMessagePayload, name: WxkfMessageType.Voice },
        { value: WxkfVideoMessagePayload, name: WxkfMessageType.Video },
        { value: WxkfFileMessagePayload, name: WxkfMessageType.File },
        { value: WxkfLinkMessagePayload, name: WxkfMessageType.Link },
        {
          value: WxkfMiniprogramMessagePayload,
          name: WxkfMessageType.Miniprogram,
        },
        { value: WxkfMenuMessagePayload, name: WxkfMessageType.Menu },
        { value: WxkfLocationMessagePayload, name: WxkfMessageType.Location },
      ],
    },
  })
  message: WxkfMessagePayload;
}

// TODO: add validation
export class WxkfSyncMsgInput {
  cursor?: string;
  token?: string;
  limit?: number;
}

export class WxkfSendMsgResponse extends WxResponse {
  msgid: string;
}

export class WxkfMediaUploadInput {
  type: WxkfMediaType;
  media: Buffer | Readable;
  filename?: string;
  filepath?: string;
  contentType?: string;
  knownLength?: number;
}

export class WxkfMediaUploadResponse extends WxResponse {
  type: WxkfMediaType;
  media_id: string;
  created_at: number;
}

export class WxkfMediaGetResponse {
  media: Buffer | Readable;
  filename: string;
  contentType: string;
}

export class WxkfAddContactWayInput {
  open_kfid: string;
  scene?: string;
}

export class WxkfAddContactWayResponse extends WxResponse {
  url: string;
}

export class WxkfAccountUpdateInput {
  open_kfid: string;
  name?: string;
  media_id?: string;
}

export class WxkfAccountDeleteInput {
  open_kfid: string;
}

export class WxkfAccountAddInput {
  open_kfid: string;
  name: string;
  media_id: string;
}

export class WxkfAccountAddResponse extends WxResponse {
  open_kfid: string;
}

export class WxkfAccount {
  open_kfid: string;
  name: string;
  avatar: string;
}

export class WxkfAccountListResponse extends WxResponse {
  @Type(() => WxkfAccount)
  account_list: WxkfAccount[];
}
