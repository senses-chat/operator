import { NewSessionMessageEvent } from './new-session-msg.event';
import { NewSessionMessageEventHandler } from './handlers/new-session-msg.handler';

export { NewSessionMessageEvent, NewSessionMessageEventHandler };

export const EventHandlers = [NewSessionMessageEventHandler];
