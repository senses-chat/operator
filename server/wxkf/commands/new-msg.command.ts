import { ICommand } from '@nestjs/cqrs';
import { WxkfIncomingMessage } from '../models';

export class NewWxkfMessageCommand extends WxkfIncomingMessage implements ICommand {}
