import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { EventStoreService } from 'server/event-store';

import { WxkfMessageLog } from '../../models';
import { ListWxkfMessageLogsQuery } from '../list-msg-logs.query';

@QueryHandler(ListWxkfMessageLogsQuery)
export class ListWxkfMessageLogsQueryHandler
  implements IQueryHandler<ListWxkfMessageLogsQuery>
{
  constructor(private readonly eventStore: EventStoreService) {}

  execute(query: ListWxkfMessageLogsQuery): Promise<any[]> {
    return this.eventStore.listAggregates(WxkfMessageLog.name);
  }
}
