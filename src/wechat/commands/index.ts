import { NewWechatMessageCommand } from './new-msg.command';
import { SendWechatMessageCommand } from './send-msg.command';
import { NewWechatMessageCommandHandler } from './handlers/new-msg.handler';
import { SendWechatMessageCommandHandler } from './handlers/send-msg.handler';

export { NewWechatMessageCommand, SendWechatMessageCommand, NewWechatMessageCommandHandler, SendWechatMessageCommandHandler };

export const CommandHandlers = [NewWechatMessageCommandHandler, SendWechatMessageCommandHandler];
