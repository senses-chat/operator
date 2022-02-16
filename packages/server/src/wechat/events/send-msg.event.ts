import { Type } from '@senses-chat/operator-common';
import { IEventWithMetadata, EventMetadata } from '@senses-chat/operator-common';
import { Event } from '@senses-chat/operator-common';
import { RouteMessage } from 'src/route';

@Event()
export class SendWechatMessageEvent implements IEventWithMetadata {
  @Type(() => RouteMessage)
  message: RouteMessage;
  metadata?: EventMetadata;
}
