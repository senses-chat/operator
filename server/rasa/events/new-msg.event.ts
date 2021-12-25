import { ICommand } from '@nestjs/cqrs';
import { RasaResponsePayload } from '../models';

export class NewRasaMessageEvent implements RasaResponsePayload, ICommand {
  namespace: string;
  recipient_id: string;
  text: string;
  buttons?: any[]; // TODO: rasa buttons payload
  image?: string;
  custom?: any;
}
