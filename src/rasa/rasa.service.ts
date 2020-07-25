import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from 'nestjs-config';
import { RedisService } from 'nestjs-redis';
import { Redis } from 'ioredis';

import { DockerService } from 'src/docker';
import { Rasa } from './rasa.instance';
import { RasaServer } from './rasa.entity';

const RASA_BOTS = 'bots:rasa';

@Injectable()
export class RasaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RasaService.name);
  private redisClient: Redis;
  private rasaInstances: {
    [key: string]: Rasa;
  };

  public isReady: Promise<void>;
  private isReadyResolve: () => void;
  // private isReadyReject: (error: Error) => void;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly dockerService: DockerService,
    @InjectRepository(RasaServer)
    private readonly rasaServerRepo: Repository<RasaServer>,
  ) {
    this.redisClient = this.redisService.getClient('bots');
    this.rasaInstances = {};
    this.isReady = new Promise((resolve, reject) => {
      this.isReadyResolve = resolve;
      // this.isReadyReject = reject;
    });
  }

  public async onModuleInit(): Promise<void> {
    return this.launchRasaBots();
  }

  async cleanUpContainers(): Promise<void> {
    this.logger.log(`cleaning up running containers`);

    const rasaBots = await this.redisClient.keys(`${RASA_BOTS}:*`);

    for (const key of rasaBots) {
      this.logger.debug(`cleaning up containers in ${key}`);
      const containerIds = await this.redisClient.lrange(key, 0, -1);
      for (const containerId of containerIds) {
        this.logger.debug(`removing container ${containerId.substr(0, 8)}`);
        await this.dockerService.cleanUpContainer(containerId);
      }
      await this.redisClient.del(key);
    }
  }

  public getInstance(botName: string): Rasa {
    if (!this.rasaInstances[botName]) {
      throw new Error('Rasa Instance not active');
    }

    return this.rasaInstances[botName];
  }

  private async launchRasaBots(): Promise<void> {
    await this.cleanUpContainers();

    const rasaBots = await this.rasaServerRepo.find({
      isActive: true,
    });

    for (const rasaBot of rasaBots) {
      const keys = await this.redisClient.keys(`${RASA_BOTS}:${rasaBot.name}`);

      if (keys.length > 0) {
        this.logger.debug(`Rasa Bot ${rasaBot.name} has running containers, skipping`);

        this.rasaInstances[rasaBot.name] = new Rasa(this.configService, this.dockerService, rasaBot);

        continue;
      }

      this.logger.debug(`launching ${rasaBot.name}`);

      const rasa = new Rasa(this.configService, this.dockerService, rasaBot);

      const containerIds = await rasa.launch();

      this.redisClient.rpush(`${RASA_BOTS}:${rasaBot.name}`, containerIds);

      this.rasaInstances[rasaBot.name] = rasa;
    }

    this.isReadyResolve();
    this.logger.log('Rasa Service finished initializing');
  }

  public async onModuleDestroy(): Promise<void> {
    return this.cleanUpContainers();
  }
}
