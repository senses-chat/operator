import { RouteType } from '@prisma/client';
import { SessionDefinition } from 'server/route';

export interface ISessionStorage {
  getSessionDefinition(
    type: RouteType,
    namespaces: string[],
  ): Promise<SessionDefinition | undefined>;
  getSessionDefinitionById(id: string): Promise<SessionDefinition | undefined>;
  storeSessionDefinition(definition: SessionDefinition): Promise<void>;
}
