import { IEventWithMetadata, EventMetadata } from 'server/common';
import { Event } from 'server/event-store';

import { WxIncomingMessage } from '../models';

@Event()
export class NewWechatMessageEvent
  implements WxIncomingMessage, IEventWithMetadata
{
  appNamespace: string;
  ToUserName: string;
  FromUserName: string;
  CreateTime: number;
  MsgType: string;
  Event?: string;
  Content?: string;
  SessionFrom?: string;
  metadata?: EventMetadata;
}
