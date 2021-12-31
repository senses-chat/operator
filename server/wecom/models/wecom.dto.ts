import { Type } from 'class-transformer';

export interface WecomCredentials {
  corpId: string;
  secret: string;
  token: string;
  aesKey: string;
}

export interface WecomAccessToken {
  access_token?: string;
  expires_in?: number;
}

export class WecomMedia {
  media_id: string;
}

export enum WecomIncomingMessageOrigin {
  FromUser = 3,
  FromSystem = 4,
}

export enum WecomIncomingMessageType {
  Text = 'text',
  Image = 'image',
  Voice = 'voice',
  Video = 'video',
  File = 'file',
  Location = 'location',
  Event = 'event',
}

export enum WecomIncomingEventType {
  EnterSession = 'enter_session',
  MsgSendFail = 'msg_send_fail',
}

export class WecomIncomingEvent {
  event_type: WecomIncomingEventType;
  open_kfid: string;
  external_userid: string;
}

export class WecomEnterSessionEvent extends WecomIncomingEvent {
  event_type: WecomIncomingEventType.EnterSession;
  scene: string;
  scene_param?: string;
  welcome_code?: string;
}

export class WecomMsgSendFailEvent extends WecomIncomingEvent {
  event_type: WecomIncomingEventType.MsgSendFail;
  fail_msgid: string;
  fail_type: number; // TODO: enum?
}

export class WecomIncomingMessage {
  msgid: string;
  open_kfid: string;
  external_userid: string;
  send_time: number;
  origin: WecomIncomingMessageOrigin;
  msgtype: WecomIncomingMessageType;
}

export class WecomIncomingEventMessage extends WecomIncomingMessage {
  msgtype: WecomIncomingMessageType.Event;

  @Type(() => WecomIncomingEvent, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'event_type',
      subTypes: [
        { value: WecomEnterSessionEvent, name: WecomIncomingEventType.EnterSession },
        { value: WecomMsgSendFailEvent, name: WecomIncomingEventType.MsgSendFail },
      ],
    },
  })
  event: WecomIncomingEvent;
}

export class WecomIncomingTextMessage extends WecomIncomingMessage {
  msgtype: WecomIncomingMessageType.Text;
  text: {
    content: string;
    menu_id?: string;
  };
}

export class WecomIncomingImageMessage extends WecomIncomingMessage {
  msgtype: WecomIncomingMessageType.Image;
  image: WecomMedia;
}

export class WecomIncomingVoiceMessage extends WecomIncomingMessage {
  msgtype: WecomIncomingMessageType.Voice;
  voice: WecomMedia;
}

export class WecomIncomingVideoMessage extends WecomIncomingMessage {
  msgtype: WecomIncomingMessageType.Video;
  video: WecomMedia;
}

export class WecomIncomingFileMessage extends WecomIncomingMessage {
  msgtype: WecomIncomingMessageType.File;
  file: WecomMedia;
}

export class WecomIncomingLocationMessage extends WecomIncomingMessage {
  msgtype: WecomIncomingMessageType.Location;
  location: {
    latitude: number;
    longitude: number;
    name: string;
    address: string;
  };
}

export class WecomSyncMsgResponse {
  errcode: number;
  errmsg: string;
  next_cursor?: string;
  has_more?: 0 | 1;

  @Type(() => WecomIncomingMessage, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'msgtype',
      subTypes: [
        { value: WecomIncomingTextMessage, name: WecomIncomingMessageType.Text },
        { value: WecomIncomingImageMessage, name: WecomIncomingMessageType.Image },
        { value: WecomIncomingVoiceMessage, name: WecomIncomingMessageType.Voice },
        { value: WecomIncomingVideoMessage, name: WecomIncomingMessageType.Video },
        { value: WecomIncomingFileMessage, name: WecomIncomingMessageType.File },
        { value: WecomIncomingLocationMessage, name: WecomIncomingMessageType.Location },
        { value: WecomIncomingEventMessage, name: WecomIncomingMessageType.Event },
      ],
    },
  })
  msg_list?: WecomIncomingMessage[];
}

export class WecomMessagePayload {
  touser?: string;
  open_kfid?: string;
  code?: string;
  msgid?: string;
  msgtype: string;
}

export enum WecomMessageType {
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

export class WecomTextMessagePaylaod extends WecomMessagePayload {
  text: {
    content: string;
  };
}

export class WecomImageMessagePayload extends WecomMessagePayload {
  image: WecomMedia;
}

export class WecomVoiceMessagePayload extends WecomMessagePayload {
  voice: WecomMedia;
}

export class WecomVideoMessagePayload extends WecomMessagePayload {
  video: WecomMedia;
}

export class WecomFileMessagePayload extends WecomMessagePayload {
  file: WecomMedia;
}

export class WecomLinkMessagePayload extends WecomMessagePayload {
  link: {
    title: string;
    desc: string;
    url: string;
    thumb_media_id: string;
  };
}

export class WecomMiniprogramMessagePayload extends WecomMessagePayload {
  miniprogram: {
    appid: string;
    title: string;
    pagepath: string;
    thumb_media_id: string;
  };
}

export class WecomLocationMessagePayload extends WecomMessagePayload {
  location: {
    latitude: number;
    longitude: number;
    name: string;
    address: string;
  };
}

export enum WecomMenuType {
  Click = 'click',
  View = 'view',
  Miniprogram = 'miniprogram',
}

export class WecomMenuItem {
  type: WecomMenuType;
}

export class WecomClickMenuItem extends WecomMenuItem {
  type: WecomMenuType.Click;
  click: {
    id: string;
    content: string;
  };
}

export class WecomLinkMenuItem extends WecomMenuItem {
  type: WecomMenuType.View;
  view: {
    url: string;
    content: string;
  };
}

export class WecomMiniprogramMenuItem extends WecomMenuItem {
  type: WecomMenuType.Miniprogram;
  miniprogram: {
    appid: string;
    pagepath: string;
    content: string;
  };
}

export class WecomMsgMenu {
  head_content: string;
  tail_content: string;

  @Type(() => WecomMenuItem, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'type',
      subTypes: [
        { value: WecomClickMenuItem, name: WecomMenuType.Click },
        { value: WecomLinkMenuItem, name: WecomMenuType.View },
        { value: WecomMiniprogramMenuItem, name: WecomMenuType.Miniprogram },
      ],
    },
  })
  list: WecomMenuItem[];
}

export class WecomMenuMessagePayload extends WecomMessagePayload {
  msgmenu: WecomMsgMenu;
}

export class WecomMessageContainer {
  @Type(() => WecomMessagePayload, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'msgtype',
      subTypes: [
        { value: WecomTextMessagePaylaod, name: WecomMessageType.Text },
        { value: WecomImageMessagePayload, name: WecomMessageType.Image },
        { value: WecomVoiceMessagePayload, name: WecomMessageType.Voice },
        { value: WecomVideoMessagePayload, name: WecomMessageType.Video },
        { value: WecomFileMessagePayload, name: WecomMessageType.File },
        { value: WecomLinkMessagePayload, name: WecomMessageType.Link },
        { value: WecomMiniprogramMessagePayload, name: WecomMessageType.Miniprogram },
        { value: WecomMenuMessagePayload, name: WecomMessageType.Menu },
        { value: WecomLocationMessagePayload, name: WecomMessageType.Location },
      ],
    },
  })
  message: WecomMessagePayload;
}
