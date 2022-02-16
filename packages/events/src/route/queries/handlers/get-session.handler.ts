import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ISessionStorage, SESSION_STORAGE } from '@senses-chat/operator-database';
import { instanceToPlain } from '@senses-chat/operator-common';

import { EventStoreService } from '../../../event-sourcing';
import { Session } from '../../models';
import { GetSessionQuery } from '../get-session.query';

@QueryHandler(GetSessionQuery)
export class GetSessionQueryHandler implements IQueryHandler<GetSessionQuery> {
  constructor(
    @Inject(SESSION_STORAGE)
    private readonly sessionStorage: ISessionStorage,
    private readonly eventStore: EventStoreService,
  ) {}

  public async execute(query: GetSessionQuery): Promise<any> {
    const definition = await this.sessionStorage.getSessionDefinitionById(
      query.id,
    );
    const session = await this.eventStore.getAggregate<Session>(
      Session.name,
      query.id,
      definition,
    );
    return instanceToPlain(session);
  }
}
