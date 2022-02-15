import { Type } from 'src/utils/transformer';
import { IEventWithMetadata, EventMetadata } from 'src/common';
import { Event } from 'src/event-store';
import { RouteMessage } from 'src/route';

@Event()
export class SendWxkfMessageEvent implements IEventWithMetadata {
  @Type(() => RouteMessage)
  message: RouteMessage;
  metadata?: EventMetadata;
}
