import { ICommand } from '@nestjs/cqrs';

import { WxkfIncomingMessage } from '@senses-chat/wx-sdk';

export class NewWxkfMessageCommand
  extends WxkfIncomingMessage
  implements ICommand {}
