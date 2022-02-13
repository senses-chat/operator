import { ICommand } from '@nestjs/cqrs';

import { WxkfIncomingMessage } from 'server/utils/wx-sdk';

export class NewWxkfMessageCommand
  extends WxkfIncomingMessage
  implements ICommand {}
