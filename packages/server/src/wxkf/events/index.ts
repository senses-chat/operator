import { NewWxkfMessageEvent } from './new-msg.event';
import { SendWxkfMessageEvent } from './send-msg.event';
import { NewWxkfMessageEventHandler } from './handlers/new-msg.handler';
import { SendWxkfMessageEventHandler } from './handlers/send-msg.handler';

export { NewWxkfMessageEvent, SendWxkfMessageEvent };

export const EventHandlers = [
  NewWxkfMessageEventHandler,
  SendWxkfMessageEventHandler,
];
