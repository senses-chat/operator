export * from './get-session.query';
export * from './list-sessions.query';

import { GetSessionQueryHandler } from './handlers/get-session.handler';
import { ListSessionsQueryHandler } from './handlers/list-sessions.handler';

export const QueryHandlers = [GetSessionQueryHandler, ListSessionsQueryHandler];
