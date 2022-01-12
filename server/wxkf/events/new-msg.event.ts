import { IEvent } from '@nestjs/cqrs';

import { Event } from 'server/event-store';

import { WxkfIncomingMessage } from '../models';

@Event()
export class NewWxkfMessageEvent extends WxkfIncomingMessage implements IEvent {}