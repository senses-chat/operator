import { Controller, Get, Logger, Query, Post, Body } from '@nestjs/common';
import { PrismaService, RasaServer, Route, RouteType } from '@senses-chat/operator-database';
import { RasaService } from '@senses-chat/operator-rasa';

@Controller('/api/bot/config')
export class BotConfigApiController {
  private readonly logger = new Logger(BotConfigApiController.name);

  constructor(private readonly prisma: PrismaService, private readonly rasaService: RasaService) {}

  // TODO: move rasa server method to rasa service
  @Get('/rasa-server')
  async getRasaServerList(
    @Query('skip') skip: number,
    @Query('size') size: number,
  ): Promise<RasaServer[]> {
    const rasaServers = await this.prisma.rasaServer.findMany({
      skip: +skip || 0,
      take: +size || 10,
    });
    return rasaServers;
  }

  @Get('/rasa-server/latency')
  async getRasaServerLatency(
    @Query('name') name: string,
  ): Promise<number> {
    const latencies = await this.rasaService.getRasaServerLatencies(name);
    return latencies.reduce((prev, curr) => (prev + curr), 0) / latencies.length;
  }

  @Get('/rasa-server/count')
  async getRasaServerCount(): Promise<number> {
    const count = await this.prisma.rasaServer.count();
    return count;
  }

  @Get('/rasa-server/:id')
  async getRasaServer(@Query('id') id: number): Promise<RasaServer> {
    const rasaServer = await this.prisma.rasaServer.findFirst({
      where: {
        id,
      },
    });
    return rasaServer;
  }

  @Post('/rasa-server/create')
  async createRasaServer(
    @Body('name') name: string,
    @Body('url') url: string,
    @Body('pingUrl') pingUrl: string,
    @Body('isActive') isActive: boolean,
  ): Promise<RasaServer> {
    const rasaServer = await this.prisma.rasaServer.create({
      data: {
        name,
        url,
        pingUrl,
        isActive,
      },
    });
    return rasaServer;
  }

  @Post('/rasa-server/update')
  async updateRasaServer(
    @Body('id') id: number,
    @Body('name') name: string,
    @Body('url') url: string,
    @Body('pingUrl') pingUrl: string,
    @Body('isActive') isActive: boolean,
  ): Promise<RasaServer> {
    const rasaServer = await this.prisma.rasaServer.update({
      where: {
        id,
      },
      data: {
        name: name || undefined,
        url: url || undefined,
        pingUrl: pingUrl || undefined,
        isActive: typeof isActive === 'boolean' ? isActive : undefined,
        updatedAt: new Date(),
      },
    });
    return rasaServer;
  }

  @Post('/rasa-server/remove')
  async removeRasaServer(@Body('id') id: number): Promise<RasaServer> {
    const rasaServer = await this.prisma.rasaServer.delete({
      where: {
        id,
      },
    });
    return rasaServer;
  }

  @Get('/route')
  async getRouteList(
    @Query('skip') skip: number,
    @Query('size') size: number,
  ): Promise<Route[]> {
    const routes = await this.prisma.route.findMany({
      skip: +skip || 0,
      take: +size || 10,
    });
    return routes;
  }

  @Get('/route/count')
  async getRouteCount(): Promise<number> {
    const count = await this.prisma.route.count();
    return count;
  }

  @Post('/route/create')
  async createRoute(
    @Body('sourceType') sourceType: RouteType,
    @Body('sourceName') sourceName: string,
    @Body('destinationType') destinationType: RouteType,
    @Body('destinationName') destinationName: string,
    @Body('isActive') isActive: boolean,
  ): Promise<Route> {
    const route = await this.prisma.route.create({
      data: {
        sourceType,
        sourceName,
        destinationType,
        destinationName,
        isActive,
      },
    });
    return route;
  }

  @Post('/route/update')
  async updateRoute(
    @Body('id') id: number,
    @Body('sourceType') sourceType: RouteType,
    @Body('sourceName') sourceName: string,
    @Body('destinationType') destinationType: RouteType,
    @Body('destinationName') destinationName: string,
    @Body('isActive') isActive: boolean,
  ): Promise<Route> {
    const route = await this.prisma.route.update({
      where: {
        id,
      },
      data: {
        sourceType: sourceType || undefined,
        sourceName: sourceName || undefined,
        destinationType: destinationType || undefined,
        destinationName: destinationName || undefined,
        isActive: typeof isActive === 'boolean' ? isActive : undefined,
        updatedAt: new Date(),
      },
    });
    return route;
  }

  @Post('/route/remove')
  async removeRoute(@Body('id') id: number): Promise<Route> {
    const route = await this.prisma.route.delete({
      where: {
        id,
      },
    });
    return route;
  }
}
