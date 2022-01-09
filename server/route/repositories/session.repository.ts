import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import uniqid from 'uniqid';

import { EventStoreService } from 'server/event-store';
import { SESSION_STORAGE, ISessionStorage } from 'server/modules/storage';

import { RouteService } from '../route.service';
import { Route, RouteType, SessionDefinition, Session } from '../models';

@Injectable()
export class SessionRepository {
  constructor(
    private readonly eventStore: EventStoreService,
    private readonly routeService: RouteService,
    @Inject(SESSION_STORAGE)
    private readonly sessionStorage: ISessionStorage,
  ) {}

  public async getSessionForIncomingRoute(sourceType: RouteType, namespaces: string[]): Promise<Session> {
    const session = await this.getSession(sourceType, namespaces);

    if (session) {
      return session;
    }

    const route = await this.routeService.getActiveRouteForSource(sourceType, namespaces[0]);

    if (!route) {
      throw new NotFoundException('no active route found');
    }

    return this.createSession(sourceType, namespaces, route);
  }

  private async getSession(type: RouteType, namespaces: string[]): Promise<Session | undefined> {
    const definition: SessionDefinition = await this.sessionStorage.getSessionDefinition(type, namespaces);

    if (!definition) {
      return undefined;
    }

    return this.eventStore.getAggregate<Session>(Session.name, definition.id, definition);
  }

  private async createSession(sourceType: RouteType, namespaces: string[], route: Route): Promise<Session> {
    const sessionId = uniqid('sesh-');

    const definition: SessionDefinition = {
      id: sessionId,
      source: {
        type: sourceType,
        namespaces,
      },
      destination: {
        type: route.destinationType,
        namespaces: [route.destinationName, sessionId],
      },
    };

    await this.sessionStorage.storeSessionDefinition(definition);
    return this.eventStore.getAggregate<Session>(Session.name, definition.id, definition);
  }
}
