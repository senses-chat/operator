import { IEventWithMetadata, EventMetadata } from '@senses-chat/operator-common';
import { Event } from '@senses-chat/operator-common';
import { WxkfIncomingMessage } from '@senses-chat/wx-sdk';

@Event()
export class NewWxkfMessageEvent
  extends WxkfIncomingMessage
  implements IEventWithMetadata
{
  metadata?: EventMetadata;
}
