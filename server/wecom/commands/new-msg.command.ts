import { ICommand } from '@nestjs/cqrs';
import { WecomIncomingMessage } from '../models';

export class NewWecomMessageCommand extends WecomIncomingMessage implements ICommand {}
