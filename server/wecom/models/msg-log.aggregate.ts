import { Logger } from '@nestjs/common';
import { plainToInstance, instanceToPlain } from 'class-transformer';

import { Aggregate, AggregateRootWithId } from 'server/event-store';

import { NewWecomMessageCommand, SendWecomMessageCommand } from '../commands';
import { NewWecomMessageEvent, SendWecomMessageEvent } from '../events';

@Aggregate()
export class WecomMessageLog extends AggregateRootWithId {
  private logger = new Logger(WecomMessageLog.name);

  public newMessage(command: NewWecomMessageCommand): void {
    this.apply(plainToInstance(NewWecomMessageEvent, instanceToPlain(command)));
  }

  public sendMessage(command: SendWecomMessageCommand): void {
    this.apply(plainToInstance(SendWecomMessageEvent, instanceToPlain(command)));
  }
}
