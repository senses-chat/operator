import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { EventStoreService } from '@senses-chat/operator-events';

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
