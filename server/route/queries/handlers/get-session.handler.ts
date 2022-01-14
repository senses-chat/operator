import { Inject } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

import { EventStoreService } from "server/event-store";
import { ISessionStorage, SESSION_STORAGE } from "server/modules/storage";

import { Session } from "../../models";
import { GetSessionQuery } from "../get-session.query";

@QueryHandler(GetSessionQuery)
export class GetSessionQueryHandler implements IQueryHandler<GetSessionQuery> {
  constructor(
    @Inject(SESSION_STORAGE)
    private readonly sessionStorage: ISessionStorage,
    private readonly eventStore: EventStoreService,
  ) {}

  public async execute(query: GetSessionQuery): Promise<Session> {
    const definition = await this.sessionStorage.getSessionDefinitionById(query.id);
    return this.eventStore.getAggregate<Session>(Session.name, query.id, definition);
  }
}
