import { IEvent } from '@nestjs/cqrs';

import { Event } from 'server/event-store';

import { WecomIncomingMessage } from '../models';

@Event()
export class NewWecomMessageEvent extends WecomIncomingMessage implements IEvent {}
