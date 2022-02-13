import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { EventStoreService } from 'server/event-store';

import { SendWxkfMessageCommand } from '../send-msg.command';
import { WxkfMessageLog } from '../../models';

@CommandHandler(SendWxkfMessageCommand)
export class SendWxkfMessageCommandHandler
  implements ICommandHandler<SendWxkfMessageCommand, void>
{
  constructor(private readonly eventStore: EventStoreService) {}

  public async execute(command: SendWxkfMessageCommand): Promise<void> {
    const log = await this.eventStore.getAggregate<WxkfMessageLog>(
      WxkfMessageLog.name,
      command.message.namespaces.join('-'),
    );
    log.sendMessage(command);
    log.commit();
  }
}
