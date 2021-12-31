import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { EventStoreService } from 'server/event-store';

import { NewWecomMessageCommand } from '../new-msg.command';
import { WecomMessageLog } from '../../models';

@CommandHandler(NewWecomMessageCommand)
export class NewWecomMessageCommandHandler implements ICommandHandler<NewWecomMessageCommand, void> {
  constructor(private readonly eventStore: EventStoreService) {}

  public async execute(command: NewWecomMessageCommand): Promise<void> {
    const id = `${command.open_kfid}-${command.external_userid}`;
    const log = await this.eventStore.getAggregate<WecomMessageLog>(WecomMessageLog.name, id);
    log.newMessage(command);
    log.commit();
  }
}
