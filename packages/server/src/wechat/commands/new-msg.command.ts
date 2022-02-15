import { ICommand } from '@nestjs/cqrs';
import { WxIncomingMessage } from '../models';

export class NewWechatMessageCommand implements WxIncomingMessage, ICommand {
  appNamespace: string;
  ToUserName: string;
  FromUserName: string;
  CreateTime: number;
  MsgType: string;
  Event?: string;
  Content?: string;
  SessionFrom?: string;
}
