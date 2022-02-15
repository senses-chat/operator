import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { EventStoreService } from 'src/event-store';
import { ISessionStorage, SESSION_STORAGE } from 'src/modules/storage';
import { instanceToPlain } from 'src/utils/transformer';

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
