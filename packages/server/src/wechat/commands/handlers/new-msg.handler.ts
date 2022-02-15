import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { EventStoreService } from 'src/event-store';

import { NewWechatMessageCommand } from '../new-msg.command';
import { WechatMessageLog } from '../../models';

@CommandHandler(NewWechatMessageCommand)
export class NewWechatMessageCommandHandler
  implements ICommandHandler<NewWechatMessageCommand, void>
{
  constructor(private readonly eventStore: EventStoreService) {}

  public async execute(command: NewWechatMessageCommand): Promise<void> {
    const id = `${command.appNamespace}-${command.FromUserName}`;

    const log = await this.eventStore.getAggregate<WechatMessageLog>(
      WechatMessageLog.name,
      id,
    );

    log.newMessage(command);
    log.commit();
  }
}
