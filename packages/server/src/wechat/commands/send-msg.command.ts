import { ICommand } from '@nestjs/cqrs';

import { Type } from 'src/utils/transformer';
import { RouteMessage } from 'src/route';

export class SendWechatMessageCommand implements ICommand {
  @Type(() => RouteMessage)
  message: RouteMessage;
}
