export * from './get-msg-log.query';
export * from './list-msg-logs.query';

import { GetWxkfMessageLogQueryHandler } from './handlers/get-msg-log.handler';
import { ListWxkfMessageLogsQueryHandler } from './handlers/list-msg-logs.handler';

export const QueryHandlers = [
  GetWxkfMessageLogQueryHandler,
  ListWxkfMessageLogsQueryHandler,
];
