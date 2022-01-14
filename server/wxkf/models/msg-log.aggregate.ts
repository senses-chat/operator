import { Logger } from '@nestjs/common';
import { plainToInstance, instanceToPlain } from 'class-transformer';

import { Aggregate, AggregateRootWithId } from 'server/event-store';

import { NewWxkfMessageCommand, SendWxkfMessageCommand } from '../commands';
import { NewWxkfMessageEvent, SendWxkfMessageEvent } from '../events';

@Aggregate()
export class WxkfMessageLog extends AggregateRootWithId {
  private logger = new Logger(WxkfMessageLog.name);

  public messages: Array<NewWxkfMessageEvent | SendWxkfMessageEvent> = [];

  public newMessage(command: NewWxkfMessageCommand): void {
    this.apply(plainToInstance(NewWxkfMessageEvent, instanceToPlain(command)));
  }

  public sendMessage(command: SendWxkfMessageCommand): void {
    this.apply(plainToInstance(SendWxkfMessageEvent, instanceToPlain(command)));
  }

  onNewWxkfMessageEvent(event: NewWxkfMessageEvent): void {
    this.logger.verbose(`onNewWxkfMessageEvent: ${JSON.stringify(event)}`);
    this.messages.push(event);
  }

  onSendWxkfMessageEvent(event: SendWxkfMessageEvent): void {
    this.logger.verbose(`onSendWxkfMessageEvent: ${JSON.stringify(event)}`);
    this.messages.push(event);
  }
}
