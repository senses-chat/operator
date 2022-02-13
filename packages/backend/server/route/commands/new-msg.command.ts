import { ICommand } from '@nestjs/cqrs';
import { RouteMessage } from '../models';

export class NewRouteMessageCommand implements ICommand {
  constructor(public readonly message: RouteMessage) {}
}
