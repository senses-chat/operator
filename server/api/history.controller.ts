import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import {
  WxkfMessageLog,
  GetWxkfMessageLogQuery,
  ListWxkfMessageLogsQuery,
} from 'server/wxkf';
import {
  Session,
  GetSessionQuery,
  SessionDefinition,
  ListSessionsQuery,
} from 'server/route';

@Controller('/api/history')
export class HistoryController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/wxkf_msg_logs/:id')
  async getWxkfMessageLog(@Param('id') id: string): Promise<WxkfMessageLog> {
    return this.queryBus.execute(new GetWxkfMessageLogQuery(id));
  }

  @Get('/wxkf_msg_logs')
  async listWxkfMessageLogs(): Promise<any[]> {
    return this.queryBus.execute(new ListWxkfMessageLogsQuery());
  }

  @Get('/sessions/:id')
  async getSessionHistory(@Param('id') id: string): Promise<Session> {
    return this.queryBus.execute(new GetSessionQuery(id));
  }

  @Get('/sessions')
  async listAllSessions(): Promise<
    Array<
      SessionDefinition & {
        count: number;
        expiredAt: Date;
      }
    >
  > {
    return this.queryBus.execute(new ListSessionsQuery());
  }
}
