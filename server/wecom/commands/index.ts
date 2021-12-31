import { NewWecomMessageCommand } from './new-msg.command';
import { SendWecomMessageCommand } from './send-msg.command';
import { NewWecomMessageCommandHandler } from './handlers/new-msg.handler';
import { SendWecomMessageCommandHandler } from './handlers/send-msg.handler';

export { NewWecomMessageCommand, SendWecomMessageCommand, NewWecomMessageCommandHandler, SendWecomMessageCommandHandler };

export const CommandHandlers = [NewWecomMessageCommandHandler, SendWecomMessageCommandHandler];
