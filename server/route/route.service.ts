import { Injectable } from '@nestjs/common';
import { PrismaService } from 'server/prisma';

import { Route, RouteType } from './models';

@Injectable()
export class RouteService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  public async getActiveRouteForSource(sourceType: RouteType, sourceName: string): Promise<Route | undefined> {
    return this.prisma.route.findFirst({
      where: {
        isActive: true,
        sourceType,
        sourceName,
      },
    });
  }
}
