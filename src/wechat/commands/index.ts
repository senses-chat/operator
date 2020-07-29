import { NewWechatMessageCommand } from './new-msg.command';
import { NewWechatMessageCommandHandler } from './handlers/new-msg.handler';

export { NewWechatMessageCommand, NewWechatMessageCommandHandler };

export const CommandHandlers = [NewWechatMessageCommandHandler];
