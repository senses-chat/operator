import { Logger, Type } from '@nestjs/common';
import { IEvent } from '@nestjs/cqrs';
import { EventStorage } from '@prisma/client';
import { instanceToPlain, plainToInstance } from 'class-transformer';

import { PrismaService } from 'server/modules/storage';

import { IEventStorage } from './event-storage.interface';
import { EventMetadataStore } from 'server/event-store/event.decorator';

export class PrismaEventStorage<EventBase extends IEvent = IEvent>
  implements IEventStorage<EventBase>
{
  private logger = new Logger(PrismaEventStorage.name);

  constructor (private readonly prisma: PrismaService) {}

  get defaultInitialVersion(): string | number {
    return 0;
  }

  async publishEvent(aggregateType: string, aggregateId: string, event: EventBase): Promise<string | number> {
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

    const version = latestEvent ? latestEvent.version + 1 : this.defaultInitialVersion as number;

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

  async getAggregateEventHistory<T extends EventBase>(aggregateType: string, aggregateId: string): Promise<{ history: T[]; latestVersion: string | number; }> {
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
      const history = events.map((event) => this.convertPrismaEventToEvent<T>(event));

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

  private convertPrismaEventToEvent<T extends EventBase>(eventStorage: EventStorage): T {
    const { eventType, eventData } = eventStorage;
    const clazz = EventMetadataStore.get(eventType) as Type<T>;
    const event = plainToInstance(clazz, eventData);
    return event;
  }
}
