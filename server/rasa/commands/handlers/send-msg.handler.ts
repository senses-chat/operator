import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';

import { SendRasaMessageCommand } from '../send-msg.command';
import { RasaMessageLog } from '../../models';
import { RasaService } from '../../rasa.service';

@CommandHandler(SendRasaMessageCommand)
export class SendRasaMessageCommandHandler implements ICommandHandler<SendRasaMessageCommand, void> {
  constructor(private readonly rasaService: RasaService, private readonly publisher: EventPublisher) {}

  public async execute(command: SendRasaMessageCommand): Promise<void> {
    const rasa = this.rasaService.getInstance(command.namespace);
    const MessageLog = this.publisher.mergeClassContext(RasaMessageLog);
    const log = new MessageLog(rasa);
    log.sendMessage(command);
    log.commit();
  }
}
