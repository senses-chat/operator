import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ConfigModule, StorageModule } from 'server/modules';

import { CommandHandlers } from './commands';
import { EventHandlers } from './events';
import { RasaSagas } from './sagas';
import { RasaService } from './rasa.service';

@Module({
  imports: [CqrsModule, ConfigModule, StorageModule.register()],
  providers: [RasaService, RasaSagas, ...CommandHandlers, ...EventHandlers],
})
export class RasaModule {}
