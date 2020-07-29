import { NewWechatMessageEvent } from './new-msg.event';
import { NewWechatMessageEventHandler } from './handlers/new-msg.handler';

export { NewWechatMessageEvent, NewWechatMessageEventHandler };

export const EventHandlers = [NewWechatMessageEventHandler];
