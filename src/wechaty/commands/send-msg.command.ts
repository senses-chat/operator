import { ICommand } from '@nestjs/cqrs';
import { Type } from 'class-transformer';

import { RouteMessage } from 'src/route';

export class SendWechatyMessageCommand implements ICommand {
  @Type(() => RouteMessage)
  message: RouteMessage;
}
