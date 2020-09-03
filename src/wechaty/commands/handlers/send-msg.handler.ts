import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';

import { SendWechatyMessageCommand } from '../send-msg.command';
import { WechatyMessageLog } from '../../models';

@CommandHandler(SendWechatyMessageCommand)
export class SendWechatyMessageCommandHandler implements ICommandHandler<SendWechatyMessageCommand, void> {
  constructor(private readonly publisher: EventPublisher) {}

  public async execute(command: SendWechatyMessageCommand): Promise<void> {
    const MessageLog = this.publisher.mergeClassContext(WechatyMessageLog);
    const log = new MessageLog();
    log.sendMessage(command);
    log.commit();
  }
}
