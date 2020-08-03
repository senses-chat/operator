import { ICommand } from '@nestjs/cqrs';
import { RasaWebhookPayload } from '../models';

export class SendRasaMessageEvent implements RasaWebhookPayload, ICommand {
  namespace: string;
  sender: string;
  message: string;
}
