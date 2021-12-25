import { IEvent } from '@nestjs/cqrs';
import { Type } from 'class-transformer';

import { RouteMessage } from 'server/route';

export class SendWechatMessageEvent implements IEvent {
  @Type(() => RouteMessage)
  message: RouteMessage;
}
