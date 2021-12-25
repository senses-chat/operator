import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import createServer from 'next';
import { NextServer } from 'next/dist/server/next';

@Injectable()
export class ViewService implements OnModuleInit {
  private logger = new Logger(ViewService.name);

  private server: NextServer;

  async onModuleInit(): Promise<void> {
    this.logger.verbose(process.env.NODE_ENV);
    try {
      this.server = createServer({
        dev: process.env.NODE_ENV !== 'production',
      });
      await this.server.prepare();
      this.logger.debug('nextjs server prepared');
    } catch (error) {
      console.error(error);
    }
  }

  getNextServer(): NextServer {
    return this.server;
  }
}
