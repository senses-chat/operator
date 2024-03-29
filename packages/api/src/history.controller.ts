import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { SessionDefinition } from '@senses-chat/operator-database';
import {
  GetSessionQuery,
  ListSessionsQuery,
} from '@senses-chat/operator-events';
import {
  GetWxkfMessageLogQuery,
  ListWxkfMessageLogsQuery,
} from '@senses-chat/operator-wxkf';

@Controller('/api/history')
export class HistoryController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/wxkf_msg_logs/:id')
  async getWxkfMessageLog(@Param('id') id: string) {
    return this.queryBus.execute(new GetWxkfMessageLogQuery(id));
  }

  @Get('/wxkf_msg_logs')
  async listWxkfMessageLogs() {
    return this.queryBus.execute(new ListWxkfMessageLogsQuery({
      updatedAt: 'desc',
    }));
  }

  @Get('/sessions/:id')
  async getSessionHistory(@Param('id') id: string) {
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
    return this.queryBus.execute(new ListSessionsQuery({
      updatedAt: 'desc',
    }));
  }
}
