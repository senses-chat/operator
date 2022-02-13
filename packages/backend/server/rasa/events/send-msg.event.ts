import { EventMetadata, IEventWithMetadata } from 'server/common';
import { RasaWebhookPayload } from '../models';

export class SendRasaMessageEvent
  implements RasaWebhookPayload, IEventWithMetadata
{
  namespace: string;
  sender: string;
  message: string;
  metadata?: EventMetadata;
}
