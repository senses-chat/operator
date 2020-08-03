import { ICommand } from '@nestjs/cqrs';
import { RasaWebhookPayload } from '../models';

export class SendRasaMessageCommand implements RasaWebhookPayload, ICommand {
  namespace: string;
  sender: string;
  message: string;
}
