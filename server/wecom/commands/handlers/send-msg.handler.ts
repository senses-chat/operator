import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { EventStoreService } from 'server/event-store';

import { SendWecomMessageCommand } from '../send-msg.command';
import { WecomMessageLog } from '../../models';

@CommandHandler(SendWecomMessageCommand)
export class SendWecomMessageCommandHandler implements ICommandHandler<SendWecomMessageCommand, void> {
  constructor(private readonly eventStore: EventStoreService) {}

  public async execute(command: SendWecomMessageCommand): Promise<void> {
    const log = await this.eventStore.getAggregate<WecomMessageLog>(
      WecomMessageLog.name,
      command.message.namespaces.join('-'),
    );
    log.sendMessage(command);
    log.commit();
  }
}
