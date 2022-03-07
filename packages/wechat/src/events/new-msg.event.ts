import { IEventWithMetadata, EventMetadata } from '@senses-chat/operator-common';
import { Event } from '@senses-chat/operator-common';
import { WechatIncomingMessage } from '@senses-chat/wx-sdk';

@Event()
export class NewWechatMessageEvent
  extends WechatIncomingMessage
  implements IEventWithMetadata
{
  appNamespace: string;
  metadata?: EventMetadata;
}
