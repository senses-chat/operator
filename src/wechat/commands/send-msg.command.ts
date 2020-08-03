import { ICommand } from '@nestjs/cqrs';

import { RouteMessage } from 'src/route';

export class SendWechatMessageCommand implements ICommand {
  message: RouteMessage;
}
