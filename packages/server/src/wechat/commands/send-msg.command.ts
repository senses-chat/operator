import { ICommand } from '@nestjs/cqrs';

import { Type } from '@senses-chat/operator-common';
import { RouteMessage } from '@senses-chat/operator-events';

export class SendWechatMessageCommand implements ICommand {
  @Type(() => RouteMessage)
  message: RouteMessage;
}
