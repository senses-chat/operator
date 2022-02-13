import { EventMetadata, IEventWithMetadata } from 'server/common';
import { RasaResponsePayload } from '../models';

export class NewRasaMessageEvent
  implements RasaResponsePayload, IEventWithMetadata
{
  namespace: string;
  recipient_id: string;
  text: string;
  buttons?: any[]; // TODO: rasa buttons payload
  image?: string;
  custom?: any;
  metadata?: EventMetadata;
}
