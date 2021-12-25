import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';

import { SendWechatMessageCommand } from '../send-msg.command';
import { WechatMessageLog } from '../../models';

@CommandHandler(SendWechatMessageCommand)
export class SendWechatMessageCommandHandler implements ICommandHandler<SendWechatMessageCommand, void> {
  constructor(private readonly publisher: EventPublisher) {}

  public async execute(command: SendWechatMessageCommand): Promise<void> {
    const MessageLog = this.publisher.mergeClassContext(WechatMessageLog);
    const log = new MessageLog();
    log.sendMessage(command);
    log.commit();
  }
}
