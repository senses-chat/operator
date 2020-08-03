import { IEvent } from '@nestjs/cqrs';

import { RouteMessage } from 'src/route';

export class SendWechatMessageEvent implements IEvent {
  message: RouteMessage;
}
