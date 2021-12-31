import { ICommand } from '@nestjs/cqrs';
import { Type } from 'class-transformer';

import { RouteMessage } from 'server/route';

export class SendWecomMessageCommand implements ICommand {
  @Type(() => RouteMessage)
  message: RouteMessage;
}
