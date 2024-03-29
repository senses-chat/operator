import { forwardRef, Inject, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { SessionRepository } from '../../repositories';
import { NewSessionMessageEvent } from '../new-session-msg.event';

@EventsHandler(NewSessionMessageEvent)
export class NewSessionMessageEventHandler
  implements IEventHandler<NewSessionMessageEvent>
{
  private readonly logger = new Logger(NewSessionMessageEventHandler.name);
  constructor(
    @Inject(forwardRef(() => SessionRepository))
    private readonly sessionRepository: SessionRepository,
  ) {}

  public async handle(event: NewSessionMessageEvent): Promise<void> {
    this.logger.verbose(`new session message event: ${JSON.stringify(event)}`);
    if (!event.isMessageFromDestination()) {
      // only refresh when the session has incoming messages
      await this.sessionRepository.refreshSession(event.session.id);
    }
  }
}
