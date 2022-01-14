import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

import { EventStoreService } from "server/event-store";

import { WxkfMessageLog } from "../../models";
import { GetWxkfMessageLogQuery } from "../get-msg-log.query";

@QueryHandler(GetWxkfMessageLogQuery)
export class GetWxkfMessageLogQueryHandler implements IQueryHandler<GetWxkfMessageLogQuery> {
  constructor(private readonly eventStore: EventStoreService) {}

  execute(query: GetWxkfMessageLogQuery): Promise<WxkfMessageLog> {
    return this.eventStore.getAggregate<WxkfMessageLog>(WxkfMessageLog.name, query.id);
  }
}
