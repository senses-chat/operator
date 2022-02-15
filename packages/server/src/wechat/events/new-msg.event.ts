import { IEventWithMetadata, EventMetadata } from 'src/common';
import { Event } from 'src/event-store';

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
