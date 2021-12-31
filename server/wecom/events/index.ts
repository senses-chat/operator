import { NewWecomMessageEvent } from './new-msg.event';
import { SendWecomMessageEvent } from './send-msg.event';
import { NewWecomMessageEventHandler } from './handlers/new-msg.handler';
import { SendWecomMessageEventHandler } from './handlers/send-msg.handler';

export { NewWecomMessageEvent, SendWecomMessageEvent, NewWecomMessageEventHandler, SendWecomMessageEventHandler };

export const EventHandlers = [NewWecomMessageEventHandler, SendWecomMessageEventHandler];
