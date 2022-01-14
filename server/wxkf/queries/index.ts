export * from './get-msg-log.query';

import { GetWxkfMessageLogQueryHandler } from './handlers/get-msg-log.handler';

export const QueryHandlers = [GetWxkfMessageLogQueryHandler];
