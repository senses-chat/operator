import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { NewWechatMessageEvent } from '../new-msg.event';

@EventsHandler(NewWechatMessageEvent)
export class NewWechatMessageEventHandler implements IEventHandler<NewWechatMessageEvent> {
  private readonly logger = new Logger(NewWechatMessageEventHandler.name);

  public async handle(event: NewWechatMessageEvent): Promise<void> {
    this.logger.verbose(`new wechat message event: ${JSON.stringify(event)}`);
  }
}
