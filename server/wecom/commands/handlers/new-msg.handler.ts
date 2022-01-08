import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { EventStoreService } from 'server/event-store';

import { NewWecomMessageCommand } from '../new-msg.command';
import { WecomMessageLog, WecomIncomingMessageType, WecomIncomingEventMessage } from '../../models';

@CommandHandler(NewWecomMessageCommand)
export class NewWecomMessageCommandHandler implements ICommandHandler<NewWecomMessageCommand, void> {
  constructor(private readonly eventStore: EventStoreService) {}

  public async execute(command: NewWecomMessageCommand): Promise<void> {
    let id = `${command.open_kfid}-${command.external_userid}`;

    if (command.msgtype === WecomIncomingMessageType.Event) {
      const event = (command as WecomIncomingEventMessage).event;
      id = `${event.open_kfid}-${event.external_userid}`;
    }

    const log = await this.eventStore.getAggregate<WecomMessageLog>(WecomMessageLog.name, id);
    log.newMessage(command);
    log.commit();
  }
}
