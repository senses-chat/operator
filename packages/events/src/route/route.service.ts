import { Injectable } from '@nestjs/common';

import { PrismaService, RouteType } from '@senses-chat/operator-database';

import { Route } from './models';

const DELIMITER = ':';

@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  public async getActiveRouteForSource(
    sourceType: RouteType,
    sourceNamespaces: string[],
  ): Promise<Route | undefined> {
    return this.prisma.route.findFirst({
      where: {
        isActive: true,
        sourceType,
        sourceName: sourceNamespaces.join(DELIMITER),
      },
    });
  }
}
