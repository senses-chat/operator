import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { addSeconds } from 'date-fns';

import { ISessionStorage, SESSION_STORAGE, SessionDefinition } from '@senses-chat/operator-database';

import { EventStoreService } from '../../../event-sourcing';
import { Session } from '../../models';
import { ListSessionsQuery } from '../list-sessions.query';

@QueryHandler(ListSessionsQuery)
export class ListSessionsQueryHandler
  implements IQueryHandler<ListSessionsQuery>
{
  private sessionExpirationSeconds: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventStore: EventStoreService,
    @Inject(SESSION_STORAGE)
    private readonly sessionStorage: ISessionStorage,
  ) {
    this.sessionExpirationSeconds = this.configService.get<number>(
      'storage.sessionExpiration',
    );
  }

  public async execute(query: ListSessionsQuery): Promise<
    Array<
      SessionDefinition & {
        count: number;
        expiredAt: Date;
      }
    >
  > {
    // only returning session definitions
    const aggregations = await this.eventStore.listAggregates(Session.name, query.orderBy);

    return Promise.all(
      aggregations.map(async (aggregation) => {
        const sessionDefinition =
          await this.sessionStorage.getSessionDefinitionById(
            aggregation.aggregateId,
          );
        return {
          ...sessionDefinition,
          count: aggregation.count,
          createdAt: sessionDefinition.createdAt || aggregation.createdAt,
          updatedAt: aggregation.updatedAt,
          expiredAt: sessionDefinition.updatedAt
            ? addSeconds(
                sessionDefinition.updatedAt,
                this.sessionExpirationSeconds,
              )
            : addSeconds(aggregation.updatedAt, this.sessionExpirationSeconds),
        };
      }),
    );
  }
}
