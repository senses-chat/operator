import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';

import { NewWechatyMessageCommand } from '../new-msg.command';
import { WechatyMessageLog } from '../../models';

@CommandHandler(NewWechatyMessageCommand)
export class NewWechatyMessageCommandHandler implements ICommandHandler<NewWechatyMessageCommand, void> {
  constructor(private readonly publisher: EventPublisher) {}

  public async execute(command: NewWechatyMessageCommand): Promise<void> {
    const MessageLog = this.publisher.mergeClassContext(WechatyMessageLog);
    const log = new MessageLog();
    log.newMessage(command);
    log.commit();
  }
}
