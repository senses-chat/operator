export class ListSessionsQuery {
  constructor(public readonly orderBy?: { [key: string]: 'asc' | 'desc' }) {}
}
