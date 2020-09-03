import { NewWechatyMessageEvent } from './new-msg.event';
import { SendWechatyMessageEvent } from './send-msg.event';
import { NewWechatyMessageEventHandler } from './handlers/new-msg.handler';
import { SendWechatyMessageEventHandler } from './handlers/send-msg.handler';

export { NewWechatyMessageEvent, SendWechatyMessageEvent, NewWechatyMessageEventHandler, SendWechatyMessageEventHandler };

export const EventHandlers = [NewWechatyMessageEventHandler, SendWechatyMessageEventHandler];
