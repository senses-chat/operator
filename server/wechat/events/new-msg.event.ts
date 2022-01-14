import { IEvent } from '@nestjs/cqrs';

import { Event } from 'server/event-store';

import { WxIncomingMessage } from '../models';

@Event()
export class NewWechatMessageEvent implements WxIncomingMessage, IEvent {
  appNamespace: string;
  ToUserName: string;
  FromUserName: string;
  CreateTime: number;
  MsgType: string;
  Event?: string;
  Content?: string;
  SessionFrom?: string;
}
