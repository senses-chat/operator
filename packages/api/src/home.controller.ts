import { Controller, Get, Logger, Query, Post, Body } from '@nestjs/common';
import { Prisma, PrismaService, RasaServer, Route, RouteType } from '@senses-chat/operator-database';

@Controller('/api/home')
export class HomeApiController {
  private readonly logger = new Logger(HomeApiController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Get('/dashboard')
  async getDashboardData(): Promise<{
    visitor: number;
    visitorBot: number;
    visitorKf: number;
    visitorRate: number;
  }> {
    const today = new Date();
    const yesterday = new Date(+new Date() - 1000 * 60 * 60 * 24); 
    const todayEvents = await this.prisma.eventStorage.findMany({
      where: {
        createdAt: {
          gte: new Date(`${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()} 00:00:00`),
          lte: new Date(`${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()} 23:59:59`),
        },
      },
      distinct: ['aggregateId'],
    });
    const yesterdayEvents = await this.prisma.eventStorage.findMany({
      where: {
        createdAt: {
          gte: new Date(`${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()} 00:00:00`),
          lte: new Date(`${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()} 23:59:59`),
        },
      },
      distinct: ['aggregateId'],
    });
    const redirectKfEventsCount = await this.prisma.$queryRaw(
      Prisma.sql`
        SELECT count(distinct "aggregateId") FROM "EventStorage"
          WHERE "eventData"::json->'message'->'content'->'metadata'->'servicer_userid' is not null
            AND "createdAt" BETWEEN CURRENT_DATE AND CURRENT_DATE + interval '1 day';
      `
    );
    const todayCount = todayEvents.length;
    const yesterdayCount = yesterdayEvents.length;
    let rate = 0;
    if (todayCount !== yesterdayCount) {
      if (todayCount === 0) {
        rate = -100;
      } else if (yesterdayCount === 0) {
        rate = 100;
      } else {
        rate = todayCount > yesterdayCount ? Math.floor((todayCount / yesterdayCount - 1) * 100) : -Math.floor((1 - todayCount / yesterdayCount) * 100);
      }
    }
    return {
      visitor: todayCount,
      visitorBot: todayCount,
      visitorKf: redirectKfEventsCount?.[0]?.count || 0,
      visitorRate: rate,
    };
  }
}
