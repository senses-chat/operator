import { NewWxkfMessageCommand } from './new-msg.command';
import { SendWxkfMessageCommand } from './send-msg.command';
import { NewWxkfMessageCommandHandler } from './handlers/new-msg.handler';
import { SendWxkfMessageCommandHandler } from './handlers/send-msg.handler';

export { NewWxkfMessageCommand, SendWxkfMessageCommand };

export const CommandHandlers = [NewWxkfMessageCommandHandler, SendWxkfMessageCommandHandler];
