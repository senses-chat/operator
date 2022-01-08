import { Injectable, NotFoundException } from '@nestjs/common';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';
import uniqid from 'uniqid';

import { EventStoreService } from 'server/event-store';

import { RouteService } from '../route.service';
import { Route, RouteType, SessionDefinition, Session } from '../models';

@Injectable()
export class SessionRepository {
  private readonly redisClient: Redis;

  constructor(
    private readonly eventStore: EventStoreService,
    private readonly routeService: RouteService,
    private readonly redisService: RedisService,
  ) {
    this.redisClient = this.redisService.getClient('session');
  }

  public async getSessionForIncomingRoute(sourceType: RouteType, namespaces: string[]): Promise<Session> {
    const session = await this.getSessionFromSessionStorage(sourceType, namespaces);

    if (session) {
      return session;
    }

    const route = await this.routeService.getActiveRouteForSource(sourceType, namespaces[0]);

    if (!route) {
      throw new NotFoundException('no active route found');
    }

    return this.createSession(sourceType, namespaces, route);
  }

  private async getSessionFromSessionStorage(type: RouteType, namespaces: string[]): Promise<Session | undefined> {
    const key = this.getSessionKey(type, namespaces);
    const sessionDefinitionJson: string = await this.redisClient.get(key);

    if (!sessionDefinitionJson) {
      return undefined;
    }

    try {
      const definition: SessionDefinition = JSON.parse(sessionDefinitionJson);
      return this.eventStore.getAggregate<Session>(Session.name, definition.id, definition);
    } catch (error) {
      return undefined;
    }
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

    const srcKey = this.getSessionKey(definition.source.type, definition.source.namespaces);
    const destKey = this.getSessionKey(definition.destination.type, definition.destination.namespaces);
    const pipeline = this.redisClient.pipeline();
    // expire session in 1 hour
    pipeline.set(srcKey, JSON.stringify(Object.assign({}, definition, { isDestination: false })), 'ex', 3600);
    pipeline.set(destKey, JSON.stringify(Object.assign({}, definition, { isDestination: true })), 'ex', 3600);
    await pipeline.exec();

    return this.eventStore.getAggregate<Session>(Session.name, definition.id, definition);
  }

  private getSessionKey(type: RouteType, namespaces: string[]): string {
    return `session:${type}:${namespaces.join(':')}`;
  }
}
