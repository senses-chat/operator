import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { EventStoreService } from 'server/event-store';
import { instanceToPlain } from 'server/utils/transformer';

import { WxkfMessageLog } from '../../models';
import { GetWxkfMessageLogQuery } from '../get-msg-log.query';

@QueryHandler(GetWxkfMessageLogQuery)
export class GetWxkfMessageLogQueryHandler
  implements IQueryHandler<GetWxkfMessageLogQuery>
{
  constructor(private readonly eventStore: EventStoreService) {}

  async execute(query: GetWxkfMessageLogQuery): Promise<any> {
    const log = await this.eventStore.getAggregate<WxkfMessageLog>(
      WxkfMessageLog.name,
      query.id,
    );
    return instanceToPlain(log);
  }
}
