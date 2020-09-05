import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { map, tap } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';

import { WechatyBot } from './models';
import { WechatyInstance } from './wechaty.instance';
import { NewWechatyMessageCommand } from './commands';

@Injectable()
export class WechatyService implements OnModuleInit {
  private readonly logger = new Logger(WechatyService.name);
  public instances: { [key: string]: WechatyInstance } = {};

  constructor(
    @InjectRepository(WechatyBot)
    private readonly botRepo: Repository<WechatyBot>,
    private readonly commandBus: CommandBus,
  ) {}

  public async onModuleInit(): Promise<void> {
    this.logger.debug('spawning wechaty thread');
    const bots = await this.botRepo.find({ isActive: true });

    for (const bot of bots) {
      this.instances[bot.name] = this.setUpWechatyBot(bot);
    }
  }

  private setUpWechatyBot(bot: WechatyBot): WechatyInstance {
    const instance = new WechatyInstance(bot);
    instance.subscription = instance.msgSubject
      .pipe(map((message) => plainToClass(NewWechatyMessageCommand, { namespace: bot.name, message })))
      .subscribe((command) => {
        this.logger.debug(command);
        this.commandBus.execute(command);
      });
    // instance.subscription = merge(instance.msgSubject.pipe(), instance.evtSubject.pipe()).subscribe((command) => {

    // });
    instance.start();
    return instance;
  }
}
