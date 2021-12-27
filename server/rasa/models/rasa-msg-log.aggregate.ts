import { AggregateRoot } from '@nestjs/cqrs';
import { plainToClass, instanceToPlain } from 'class-transformer';

import { SendRasaMessageCommand, NewRasaMessageCommand } from '../commands';
import { SendRasaMessageEvent, NewRasaMessageEvent } from '../events';

export class RasaMessageLog extends AggregateRoot {
  public sendMessage(command: SendRasaMessageCommand): void {
    this.apply(plainToClass(SendRasaMessageEvent, instanceToPlain(command)));
  }

  public newMessage(command: NewRasaMessageCommand): void {
    this.apply(plainToClass(NewRasaMessageEvent, instanceToPlain(command)));
  }
}
