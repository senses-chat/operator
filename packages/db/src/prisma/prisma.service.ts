import {
  INestApplication,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private logger = new Logger(PrismaService.name);

  constructor(
    configService: ConfigService,
  ) {
    super(configService.get<Prisma.PrismaClientOptions>('prisma'));
  }

  async onModuleInit() {
    this.logger.debug('connecting to database');
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      this.logger.debug('disconnecting from database');
      await this.$disconnect();
      await app.close();
    });
  }
}
