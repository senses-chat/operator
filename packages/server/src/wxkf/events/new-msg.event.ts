import { IEventWithMetadata, EventMetadata } from '@senses-chat/operator-common';
import { Event } from '@senses-chat/operator-common';
import { WxkfIncomingMessage } from 'src/utils/wx-sdk';

@Event()
export class NewWxkfMessageEvent
  extends WxkfIncomingMessage
  implements IEventWithMetadata
{
  metadata?: EventMetadata;
}
