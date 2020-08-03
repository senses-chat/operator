import { NewRouteMessageCommand } from './new-msg.command';
import { NewRouteMessageCommandHandler } from './handlers/new-msg.handler';

export { NewRouteMessageCommand, NewRouteMessageCommandHandler };

export const CommandHandlers = [NewRouteMessageCommandHandler];
