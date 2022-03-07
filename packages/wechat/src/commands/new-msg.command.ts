import { ICommand } from '@nestjs/cqrs';
import { WechatIncomingMessage } from '@senses-chat/wx-sdk';

export class NewWechatMessageCommand
  extends WechatIncomingMessage
  implements ICommand
{
  appNamespace: string;
}
