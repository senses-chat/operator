import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { EventStoreService } from 'server/event-store';

import { NewWxkfMessageCommand } from '../new-msg.command';
import { WxkfMessageLog, WxkfIncomingMessageType, WxkfIncomingEventMessage } from '../../models';

@CommandHandler(NewWxkfMessageCommand)
export class NewWxkfMessageCommandHandler implements ICommandHandler<NewWxkfMessageCommand, void> {
  constructor(private readonly eventStore: EventStoreService) {}

  public async execute(command: NewWxkfMessageCommand): Promise<void> {
    let id = `${command.open_kfid}-${command.external_userid}`;

    if (command.msgtype === WxkfIncomingMessageType.Event) {
      const event = (command as WxkfIncomingEventMessage).event;
      id = `${event.open_kfid}-${event.external_userid}`;
    }

    const log = await this.eventStore.getAggregate<WxkfMessageLog>(WxkfMessageLog.name, id);
    log.newMessage(command);
    log.commit();
  }
}
