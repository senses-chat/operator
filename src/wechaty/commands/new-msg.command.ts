import { ICommand } from '@nestjs/cqrs';

export class NewWechatyMessageCommand implements ICommand {
  namespace: string;

  // TODO: model the payload types
  message: any;
}
