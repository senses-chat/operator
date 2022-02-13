import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { EventStoreService } from 'server/event-store';

import { SendWechatMessageCommand } from '../send-msg.command';
import { WechatMessageLog } from '../../models';

@CommandHandler(SendWechatMessageCommand)
export class SendWechatMessageCommandHandler
  implements ICommandHandler<SendWechatMessageCommand, void>
{
  constructor(private readonly eventStore: EventStoreService) {}

  public async execute(command: SendWechatMessageCommand): Promise<void> {
    const id = `${command.message.namespaces[0]}-${command.message.namespaces[1]}`;

    const log = await this.eventStore.getAggregate<WechatMessageLog>(
      WechatMessageLog.name,
      id,
    );

    log.sendMessage(command);
    log.commit();
  }
}
