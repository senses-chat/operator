import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';

import { NewRouteMessageCommand } from '../new-msg.command';
import { Logger } from '@nestjs/common';
import { SessionRepository } from '../../repositories';

@CommandHandler(NewRouteMessageCommand)
export class NewRouteMessageCommandHandler implements ICommandHandler<NewRouteMessageCommand, void> {
  private readonly logger = new Logger(NewRouteMessageCommandHandler.name);

  constructor(private readonly sessionRepository: SessionRepository, private readonly publisher: EventPublisher) {}

  public async execute(command: NewRouteMessageCommand): Promise<void> {
    const session = this.publisher.mergeObjectContext(
      await this.sessionRepository.getSessionForIncomingRoute(command.message.type, command.message.namespaces),
    );

    session.newRouteMessage(command);
    session.commit();
  }
}
