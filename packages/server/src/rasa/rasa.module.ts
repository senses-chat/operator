import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { StorageModule } from '@senses-chat/operator-database';
import { EventSourcingModule } from '@senses-chat/operator-events';

import { ConfigModule } from 'src/modules';

import { CommandHandlers } from './commands';
import { EventHandlers } from './events';
import { RasaSagas } from './sagas';
import { RasaService } from './rasa.service';

@Module({
  imports: [CqrsModule, EventSourcingModule, ConfigModule, StorageModule.register()],
  providers: [RasaService, RasaSagas, ...CommandHandlers, ...EventHandlers],
})
export class RasaModule {}
