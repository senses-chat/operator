import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';

import { NewRasaMessageCommand } from '../new-msg.command';
import { RasaMessageLog } from '../../models';
import { RasaService } from '../../rasa.service';

@CommandHandler(NewRasaMessageCommand)
export class NewRasaMessageCommandHandler implements ICommandHandler<NewRasaMessageCommand, void> {
  constructor(private readonly rasaService: RasaService, private readonly publisher: EventPublisher) {}

  public async execute(command: NewRasaMessageCommand): Promise<void> {
    const rasa = this.rasaService.getInstance(command.namespace);
    const MessageLog = this.publisher.mergeClassContext(RasaMessageLog);
    const log = new MessageLog(rasa);
    log.newMessage(command);
    log.commit();
  }
}
