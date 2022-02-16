import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RouteType } from '@prisma/client';
import { addSeconds } from 'date-fns';

import { PrismaService } from '../prisma';
import { SessionDefinition } from './session-definition.interface';
import { ISessionStorage } from './session-storage.interface';

export class PrismaSessionStorage implements ISessionStorage {
  private logger = new Logger(PrismaSessionStorage.name);
  private sessionExpirationSeconds: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.sessionExpirationSeconds = this.configService.get<number>(
      'storage.sessionExpiration',
    );
  }

  async refresh(id: string): Promise<void> {
    const sessionStorage = await this.prisma.sessionStorage.findFirst({
      where: {
        id,
      },
    });

    if (!sessionStorage) {
      return;
    }

    await this.prisma.sessionStorage.update({
      where: {
        id,
      },
      data: {
        updatedAt: new Date(),
      },
    });
  }

  async getSessionDefinitionById(
    id: string,
  ): Promise<SessionDefinition | undefined> {
    const sessionStorage = await this.prisma.sessionStorage.findFirst({
      where: {
        id,
      },
    });

    if (!sessionStorage) {
      return undefined;
    }

    return {
      id: sessionStorage.id,
      source: {
        type: sessionStorage.sourceType,
        namespaces: sessionStorage.sourceNamespaces.split(':'),
      },
      destination: {
        type: sessionStorage.destinationType,
        namespaces: sessionStorage.destinationNamespaces.split(':'),
      },
      createdAt: sessionStorage.createdAt,
      updatedAt: sessionStorage.updatedAt,
    };
  }

  async getSessionDefinition(
    type: RouteType,
    namespaces: string[],
  ): Promise<SessionDefinition | undefined> {
    const sessionStorage = await this.prisma.sessionStorage.findFirst({
      where: {
        sourceType: type,
        sourceNamespaces: namespaces.join(':'),
      },
    });

    if (sessionStorage) {
      const { updatedAt } = sessionStorage;
      if (addSeconds(updatedAt, this.sessionExpirationSeconds) < new Date()) {
        this.logger.verbose('source session expired');
        return undefined;
      }

      return {
        id: sessionStorage.id,
        source: {
          type: sessionStorage.sourceType,
          namespaces: sessionStorage.sourceNamespaces.split(':'),
        },
        destination: {
          type: sessionStorage.destinationType,
          namespaces: sessionStorage.destinationNamespaces.split(':'),
        },
        isDestination: false,
        createdAt: sessionStorage.createdAt,
        updatedAt: sessionStorage.updatedAt,
      };
    }

    const destSessionStorage = await this.prisma.sessionStorage.findFirst({
      where: {
        destinationType: type,
        destinationNamespaces: namespaces.join(':'),
      },
    });

    if (destSessionStorage) {
      const { updatedAt: destUpdatedAt } = destSessionStorage;
      if (
        addSeconds(destUpdatedAt, this.sessionExpirationSeconds) < new Date()
      ) {
        this.logger.verbose('destination session expired');
        return undefined;
      }

      return {
        id: destSessionStorage.id,
        source: {
          type: destSessionStorage.sourceType,
          namespaces: destSessionStorage.sourceNamespaces.split(':'),
        },
        destination: {
          type: destSessionStorage.destinationType,
          namespaces: destSessionStorage.destinationNamespaces.split(':'),
        },
        isDestination: true,
        createdAt: destSessionStorage.createdAt,
        updatedAt: destSessionStorage.updatedAt,
      };
    }

    this.logger.verbose('no matching session found');
    return undefined;
  }

  async storeSessionDefinition(definition: SessionDefinition): Promise<void> {
    await this.prisma.sessionStorage.create({
      data: {
        id: definition.id,
        sourceType: definition.source.type,
        sourceNamespaces: definition.source.namespaces.join(':'),
        destinationType: definition.destination.type,
        destinationNamespaces: definition.destination.namespaces.join(':'),
      },
    });
  }
}
