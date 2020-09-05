import { AggregateRoot } from '@nestjs/cqrs';
import { plainToClass, classToPlain } from 'class-transformer';

import { NewWechatyMessageCommand, SendWechatyMessageCommand } from '../commands';
import { NewWechatyMessageEvent, SendWechatyMessageEvent } from '../events';

export class WechatyMessageLog extends AggregateRoot {
  public newMessage(command: NewWechatyMessageCommand): void {
    this.apply(plainToClass(NewWechatyMessageEvent, classToPlain(command)));
  }

  public sendMessage(command: SendWechatyMessageCommand): void {
    this.apply(plainToClass(SendWechatyMessageEvent, classToPlain(command)));
  }
}
