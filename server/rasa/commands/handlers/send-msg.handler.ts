import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';

import { SendRasaMessageCommand } from '../send-msg.command';
import { RasaMessageLog } from '../../models';

@CommandHandler(SendRasaMessageCommand)
export class SendRasaMessageCommandHandler implements ICommandHandler<SendRasaMessageCommand, void> {
  constructor(private readonly publisher: EventPublisher) {}

  public async execute(command: SendRasaMessageCommand): Promise<void> {
    const MessageLog = this.publisher.mergeClassContext(RasaMessageLog);
    const log = new MessageLog();
    log.sendMessage(command);
    log.commit();
  }
}
