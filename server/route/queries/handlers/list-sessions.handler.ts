import { Inject } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

import { ISessionStorage, SESSION_STORAGE } from "server/modules/storage";

import { SessionDefinition } from "../../models";
import { ListSessionsQuery } from "../list-sessions.query";

@QueryHandler(ListSessionsQuery)
export class ListSessionsQueryHandler implements IQueryHandler<ListSessionsQuery> {
  constructor(
    @Inject(SESSION_STORAGE)
    private readonly sessionStorage: ISessionStorage,
  ) {}

  public async execute(query: ListSessionsQuery): Promise<SessionDefinition[]> {
    // only returning session definitions
    return this.sessionStorage.getAllSessionDefinitions();
  }
}
