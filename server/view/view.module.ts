import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { resolve } from 'path';

import { ViewController } from './view.controller';
import { ViewService } from './view.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      serveRoot: '/static',
      rootPath: resolve(process.cwd(), 'public'),
    }),
  ],
  providers: [ViewService],
  controllers: [ViewController],
})
export class ViewModule {}
