import { ICommand } from '@nestjs/cqrs';

import { WxkfIncomingMessage } from 'src/utils/wx-sdk';

export class NewWxkfMessageCommand
  extends WxkfIncomingMessage
  implements ICommand {}
