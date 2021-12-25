import { ICommand } from '@nestjs/cqrs';
import { Type } from 'class-transformer';

import { RouteMessage } from 'server/route';

export class SendWechatMessageCommand implements ICommand {
  @Type(() => RouteMessage)
  message: RouteMessage;
}
