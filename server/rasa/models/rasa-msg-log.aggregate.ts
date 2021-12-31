import { AggregateRoot } from '@nestjs/cqrs';
import { plainToInstance, instanceToPlain } from 'class-transformer';

import { SendRasaMessageCommand, NewRasaMessageCommand } from '../commands';
import { SendRasaMessageEvent, NewRasaMessageEvent } from '../events';

export class RasaMessageLog extends AggregateRoot {
  public sendMessage(command: SendRasaMessageCommand): void {
    this.apply(plainToInstance(SendRasaMessageEvent, instanceToPlain(command)));
  }

  public newMessage(command: NewRasaMessageCommand): void {
    this.apply(plainToInstance(NewRasaMessageEvent, instanceToPlain(command)));
  }
}
