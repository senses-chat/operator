import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';

import { NewRasaMessageCommand } from '../new-msg.command';
import { RasaMessageLog } from '../../models';

@CommandHandler(NewRasaMessageCommand)
export class NewRasaMessageCommandHandler
  implements ICommandHandler<NewRasaMessageCommand, void>
{
  constructor(private readonly publisher: EventPublisher) {}

  public async execute(command: NewRasaMessageCommand): Promise<void> {
    const MessageLog = this.publisher.mergeClassContext(RasaMessageLog);
    const log = new MessageLog();
    log.newMessage(command);
    log.commit();
  }
}
