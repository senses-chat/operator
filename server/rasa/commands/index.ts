import { SendRasaMessageCommand } from './send-msg.command';
import { NewRasaMessageCommand } from './new-msg.command';
import { SendRasaMessageCommandHandler } from './handlers/send-msg.handler';
import { NewRasaMessageCommandHandler } from './handlers/new-msg.handler';

export { SendRasaMessageCommand, NewRasaMessageCommand, SendRasaMessageCommandHandler, NewRasaMessageCommandHandler };

export const CommandHandlers = [SendRasaMessageCommandHandler, NewRasaMessageCommandHandler];
