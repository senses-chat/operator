import { AggregateRoot } from '@nestjs/cqrs';
import { plainToClass, classToPlain } from 'class-transformer';

import { Rasa } from '../rasa.instance';
import { SendRasaMessageCommand, NewRasaMessageCommand } from '../commands';
import { SendRasaMessageEvent, NewRasaMessageEvent } from '../events';

export class RasaMessageLog extends AggregateRoot {
  constructor(private readonly rasa: Rasa) {
    super();
  }

  public sendMessage(command: SendRasaMessageCommand): void {
    this.apply(plainToClass(SendRasaMessageEvent, classToPlain(command)));
  }

  public newMessage(command: NewRasaMessageCommand): void {
    this.apply(plainToClass(NewRasaMessageEvent, classToPlain(command)));
  }

  public async onSendRasaMessageEvent(event: SendRasaMessageEvent): Promise<void> {
    // sending the message into rasa instance
    delete event.namespace;
    this.rasa.messageSubject.next(event);
  }
}
