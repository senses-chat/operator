import { Logger } from '@nestjs/common';
import { plainToInstance, instanceToPlain } from 'class-transformer';

import { Aggregate, AggregateRootWithId } from 'server/event-store';

import { NewWxkfMessageCommand, SendWxkfMessageCommand } from '../commands';
import { NewWxkfMessageEvent, SendWxkfMessageEvent } from '../events';

@Aggregate()
export class WxkfMessageLog extends AggregateRootWithId {
  private logger = new Logger(WxkfMessageLog.name);

  public newMessage(command: NewWxkfMessageCommand): void {
    this.apply(plainToInstance(NewWxkfMessageEvent, instanceToPlain(command)));
  }

  public sendMessage(command: SendWxkfMessageCommand): void {
    this.apply(plainToInstance(SendWxkfMessageEvent, instanceToPlain(command)));
  }
}
