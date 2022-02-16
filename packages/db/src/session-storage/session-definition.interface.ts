import { RouteType } from '@prisma/client';

export interface SessionDefinitionComponent {
  type: RouteType;
  namespaces: string[];
}

export interface SessionDefinition {
  id: string;
  source: SessionDefinitionComponent;
  destination: SessionDefinitionComponent;
  createdAt?: Date;
  updatedAt?: Date;
  isDestination?: boolean;
}
