import { ICommand } from '@nestjs/cqrs';

import { RasaResponsePayload } from '../models';

export class NewRasaMessageCommand
  extends RasaResponsePayload
  implements ICommand
{
  namespace: string;
}
