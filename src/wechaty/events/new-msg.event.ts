import { IEvent } from '@nestjs/cqrs';

export class NewWechatyMessageEvent implements IEvent {
  namespace: string;

  // TODO: model the payload types
  message: any;
}
