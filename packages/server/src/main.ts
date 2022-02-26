import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Main');

  const fastify = new FastifyAdapter();
  fastify.register(import('fastify-xml-body-parser'));

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, fastify, {
    cors: {
      allowedHeaders: '*',
      origin: '*',
    },
  });

  app.enableShutdownHooks(['SIGINT', 'SIGTERM']);

  const configService: ConfigService = app.get(ConfigService);

  const port = configService.get('server.port');
  await app.listen(port, '0.0.0.0');
  logger.log(`server started listening at 0.0.0.0:${port}`);
}

bootstrap();
