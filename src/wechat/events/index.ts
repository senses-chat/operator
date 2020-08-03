import { NewWechatMessageEvent } from './new-msg.event';
import { SendWechatMessageEvent } from './send-msg.event';
import { NewWechatMessageEventHandler } from './handlers/new-msg.handler';
import { SendWechatMessageEventHandler } from './handlers/send-msg.handler';

export { NewWechatMessageEvent, SendWechatMessageEvent, NewWechatMessageEventHandler, SendWechatMessageEventHandler };

export const EventHandlers = [NewWechatMessageEventHandler, SendWechatMessageEventHandler];
