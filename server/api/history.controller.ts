import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { WxkfMessageLog, GetWxkfMessageLogQuery } from 'server/wxkf';
import { Session, GetSessionQuery } from 'server/route';

@Controller('/api/history')
export class HistoryController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/wxkf/:id')
  async getMessageHistory(@Param('id') id: string): Promise<WxkfMessageLog> {
    return this.queryBus.execute(new GetWxkfMessageLogQuery(id));
  }

  @Get('/session/:id')
  async getSessionHistory(@Param('id') id: string): Promise<Session> {
    return this.queryBus.execute(new GetSessionQuery(id));
  }
}
