import { AggregateRoot } from '@nestjs/cqrs';
import { plainToInstance, instanceToPlain } from 'class-transformer';

import { NewWechatMessageCommand, SendWechatMessageCommand } from '../commands';
import { NewWechatMessageEvent, SendWechatMessageEvent } from '../events';

export class WechatMessageLog extends AggregateRoot {
  public newMessage(command: NewWechatMessageCommand): void {
    this.apply(plainToInstance(NewWechatMessageEvent, instanceToPlain(command)));
  }

  public sendMessage(command: SendWechatMessageCommand): void {
    this.apply(plainToInstance(SendWechatMessageEvent, instanceToPlain(command)));
  }
}
