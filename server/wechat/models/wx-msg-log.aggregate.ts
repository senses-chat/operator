import { AggregateRoot } from '@nestjs/cqrs';
import { plainToClass, instanceToPlain } from 'class-transformer';

import { NewWechatMessageCommand, SendWechatMessageCommand } from '../commands';
import { NewWechatMessageEvent, SendWechatMessageEvent } from '../events';

export class WechatMessageLog extends AggregateRoot {
  public newMessage(command: NewWechatMessageCommand): void {
    this.apply(plainToClass(NewWechatMessageEvent, instanceToPlain(command)));
  }

  public sendMessage(command: SendWechatMessageCommand): void {
    this.apply(plainToClass(SendWechatMessageEvent, instanceToPlain(command)));
  }
}
