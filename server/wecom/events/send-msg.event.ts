import { IEvent } from '@nestjs/cqrs';
import { Type } from 'class-transformer';

import { Event } from 'server/event-store';
import { RouteMessage } from 'server/route';

@Event()
export class SendWecomMessageEvent implements IEvent {
  @Type(() => RouteMessage)
  message: RouteMessage;
}
