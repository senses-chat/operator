import { IEventWithMetadata, EventMetadata } from '@senses-chat/operator-common';
import { Event } from '@senses-chat/operator-common';

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
