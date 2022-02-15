import { RouteType } from '@prisma/client';
import { SessionDefinition } from 'src/route';

export interface ISessionStorage {
  refresh(id: string): Promise<void>;
  getSessionDefinition(
    type: RouteType,
    namespaces: string[],
  ): Promise<SessionDefinition | undefined>;
  getSessionDefinitionById(id: string): Promise<SessionDefinition | undefined>;
  storeSessionDefinition(definition: SessionDefinition): Promise<void>;
}
