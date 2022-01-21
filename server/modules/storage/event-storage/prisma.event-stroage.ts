import { Logger, Type } from '@nestjs/common';
import { EventStorage } from '@prisma/client';

import { instanceToPlain, plainToInstance } from 'server/utils/transformer';
import { IEventWithMetadata } from 'server/common';
import { EventMetadataStore } from 'server/event-store';
import { PrismaService } from 'server/modules/storage';

import { IEventStorage } from './event-storage.interface';

export class PrismaEventStorage<
  EventBase extends IEventWithMetadata = IEventWithMetadata,
> implements IEventStorage<EventBase>
{
  private logger = new Logger(PrismaEventStorage.name);

  constructor(private readonly prisma: PrismaService) {}
  get defaultInitialVersion(): string | number {
    return 0;
  }

  async getByType(aggregateType: string): Promise<
    Array<{
      aggregateId: string;
      count: number;
      createdAt: Date;
      updatedAt: Date;
    }>
  > {
    const aggregations = await this.prisma.eventStorage.groupBy({
      by: ['aggregateId'],
      _count: {
        aggregateId: true,
      },
      _min: {
        createdAt: true,
      },
      _max: {
        createdAt: true,
      },
      where: {
        aggregateType,
      },
    });

    return aggregations.map((aggregation) => ({
      aggregateId: aggregation.aggregateId,
      count: aggregation._count.aggregateId,
      createdAt: aggregation._min.createdAt,
      updatedAt: aggregation._max.createdAt,
    }));
  }

  async publishEvent(
    aggregateType: string,
    aggregateId: string,
    event: EventBase,
  ): Promise<string | number> {
    // find latest version then push new event

    const latestEvent = await this.prisma.eventStorage.findFirst({
      where: {
        aggregateType,
        aggregateId,
      },
      orderBy: {
        version: 'desc',
      },
    });

    const version = latestEvent
      ? latestEvent.version + 1
      : (this.defaultInitialVersion as number);

    const newEvent = await this.prisma.eventStorage.create({
      data: {
        aggregateType,
        aggregateId,
        version,
        eventType: event.constructor.name,
        eventData: instanceToPlain(event),
      },
    });

    return newEvent.version;
  }

  async getAggregateEventHistory<T extends EventBase>(
    aggregateType: string,
    aggregateId: string,
  ): Promise<{ history: T[]; latestVersion: string | number }> {
    const events = await this.prisma.eventStorage.findMany({
      where: {
        aggregateType,
        aggregateId,
      },
      orderBy: {
        version: 'asc',
      },
    });

    if (events.length > 0) {
      const latestVersion = events.slice(-1)[0].version;
      const history = events.map((event) =>
        this.convertPrismaEventToEvent<T>(event),
      );

      return {
        history,
        latestVersion,
      };
    } else {
      return {
        history: [],
        latestVersion: this.defaultInitialVersion,
      };
    }
  }

  private convertPrismaEventToEvent<T extends EventBase>(
    eventStorage: EventStorage,
  ): T {
    const { eventType, eventData } = eventStorage;
    const clazz = EventMetadataStore.get(eventType) as Type<T>;
    const event = plainToInstance(
      clazz,
      Object.assign(eventData, {
        metadata: {
          timestamp: eventStorage.createdAt,
          version: eventStorage.version,
        },
      }),
    );
    return event;
  }
}
