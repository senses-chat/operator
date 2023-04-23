import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiModule } from '@senses-chat/operator-api';
import { RouteModule } from '@senses-chat/operator-events';
import { RasaModule } from '@senses-chat/operator-rasa';
import { WechatModule } from '@senses-chat/operator-wechat';
import { WxkfModule } from '@senses-chat/operator-wxkf';

import serverConfig from './config';
import { AppController } from './app.controller';
import { RavenInterceptor, RavenModule } from 'nest-raven';
import { APP_INTERCEPTOR } from '@nestjs/core';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      // mimic behaviors from nextjs
      envFilePath: [`.env.${ENV}.local`, `.env.${ENV}`, `.env.local`, '.env'],
      load: [serverConfig],
    }),
    RouteModule,
    WechatModule,
    WxkfModule,
    RasaModule,
    ApiModule,
    RavenModule
  ],
  controllers: [AppController],
  providers: [{
    provide: APP_INTERCEPTOR,
    useValue: new RavenInterceptor(),
  }],
})
export class AppModule {}
