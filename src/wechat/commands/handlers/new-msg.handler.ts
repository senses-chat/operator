import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';

import { NewWechatMessageCommand } from '../new-msg.command';
import { WechatMessageLog } from '../../models';

@CommandHandler(NewWechatMessageCommand)
export class NewWechatMessageCommandHandler implements ICommandHandler<NewWechatMessageCommand, void> {
  constructor(private readonly publisher: EventPublisher) {}

  public async execute(command: NewWechatMessageCommand): Promise<void> {
    const MessageLog = this.publisher.mergeClassContext(WechatMessageLog);
    const log = new MessageLog();
    log.newMessage(command);
    log.commit();
  }
}
