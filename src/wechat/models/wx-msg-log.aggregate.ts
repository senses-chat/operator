import { AggregateRoot } from '@nestjs/cqrs';
import { plainToClass, classToPlain } from 'class-transformer';

import { NewWechatMessageCommand } from '../commands';
import { NewWechatMessageEvent } from '../events';

export class WechatMessageLog extends AggregateRoot {
  public newMessage(command: NewWechatMessageCommand): void {
    this.apply(plainToClass(NewWechatMessageEvent, classToPlain(command)));
  }
}
