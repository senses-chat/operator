import { IEvent } from '@nestjs/cqrs';
import { WxIncomingMessage } from '../models';

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
