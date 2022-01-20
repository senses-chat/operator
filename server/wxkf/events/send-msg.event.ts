import { Type } from 'class-transformer';

import { IEventWithMetadata, EventMetadata } from 'server/common';
import { Event } from 'server/event-store';
import { RouteMessage } from 'server/route';

@Event()
export class SendWxkfMessageEvent implements IEventWithMetadata {
  @Type(() => RouteMessage)
  message: RouteMessage;
  metadata?: EventMetadata;
}
