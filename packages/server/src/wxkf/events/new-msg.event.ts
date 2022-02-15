import { IEventWithMetadata, EventMetadata } from 'src/common';
import { Event } from 'src/event-store';
import { WxkfIncomingMessage } from 'src/utils/wx-sdk';

@Event()
export class NewWxkfMessageEvent
  extends WxkfIncomingMessage
  implements IEventWithMetadata
{
  metadata?: EventMetadata;
}
