import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { of, from, zip, interval } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';
import { PerformanceObserver, PerformanceEntry } from 'perf_hooks';
import fetch from 'node-fetch';

import { plainToInstance } from '@senses-chat/operator-common';
import {
  KeyValueStorageBase,
  PrismaService,
  PING_TIME_KV_STORAGE,
} from '@senses-chat/operator-database';

import { RasaResponsePayload, RasaWebhookPayload } from './models';
import { SendRasaMessageEvent } from './events';
import { NewRasaMessageCommand } from './commands';

const PING_RASA_SERVERS = 'pingRasaServers';
const PING_TIME = 'pingTime';
const DELIMITER = ':';
@Injectable()
export class RasaService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RasaService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
    @Inject(PING_TIME_KV_STORAGE)
    private readonly kvStorage: KeyValueStorageBase,
    private readonly prisma: PrismaService,
    private readonly commandBus: CommandBus,
  ) {}

  onApplicationBootstrap() {
    this.logger.debug('setting up rasa server ping task');

    const interval = setInterval(
      this.pingRasaServers.bind(this),
      this.configService.get<number>('rasa.pingInterval'),
    );
    this.schedulerRegistry.addInterval(PING_RASA_SERVERS, interval);

    const obs = new PerformanceObserver(async (list) => {
      const entry: PerformanceEntry = list.getEntries()[0];
      this.logger.verbose(
        `${entry.name}: ${Math.round(entry.duration * 100) / 100}ms`,
      );

      if (!entry.name.startsWith(PING_TIME)) {
        return;
      }

      try {
        const latenciesJson: string = await this.kvStorage.get(entry.name);
        const latencies: number[] = JSON.parse(latenciesJson);
        latencies.push(entry.duration);
        if (latencies.length > this.configService.get<number>('rasa.maxLatenciesHistory')) {
          latencies.shift();
        }
        await this.kvStorage.set(entry.name, JSON.stringify(latencies));
      } catch (err) {
        this.logger.warn(`could not get ${entry.name} from kv storage, creating`);
        const latencies: number[] = [entry.duration];
        await this.kvStorage.set(entry.name, JSON.stringify(latencies));
      }
    });

    obs.observe({ entryTypes: ['measure'] });
  }

  public async pingRasaServers() {
    const rasaServers = await this.prisma.rasaServer.findMany({
      where: {
        isActive: true,
      },
    });

    this.logger.verbose('pinging rasa servers');
    performance.mark(PING_RASA_SERVERS);

    await Promise.all(
      rasaServers.map(async (rasaServer) => {
        let pingUrl = rasaServer.pingUrl;
        if (!pingUrl) {
          const url = new URL(rasaServer.url);
          pingUrl = `${url.protocol}//${url.host}/`;
        }

        this.logger.verbose(`pinging ${pingUrl}`);

        await fetch(pingUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        performance.measure(`${PING_TIME}${DELIMITER}${rasaServer.name}`, PING_RASA_SERVERS);
      }),
    );

    this.logger.verbose('ping rasa servers done');
    performance.clearMarks();
  }

  public async sendMessage(event: SendRasaMessageEvent): Promise<void> {
    const rasaServer = await this.prisma.rasaServer.findFirst({
      where: {
        name: event.namespace,
        isActive: true,
      },
    });

    if (!rasaServer) {
      const message = `rasa server ${event.namespace} not found or inactive or invalid configuration`;
      this.logger.error(message);
      throw new Error(message);
    }

    const payload: RasaWebhookPayload = {
      sender: event.sender,
      message: event.message,
    };

    this.logger.debug(
      `send rasa message ${JSON.stringify(payload)} to ${JSON.stringify(
        rasaServer,
      )}`,
    );

    return new Promise((resolve, reject) => {
      of(rasaServer)
        .pipe(
          tap((rasaServer) => this.logger.verbose(JSON.stringify(rasaServer))),
          concatMap((rasaServer) =>
            from(
              fetch(rasaServer.url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
              }),
            ),
          ),
          concatMap((response) => response.json()),
          tap((responseJson) =>
            this.logger.verbose(JSON.stringify(responseJson)),
          ),
          concatMap((messages: RasaResponsePayload[]) => {
            return zip(
              from(messages),
              interval(this.configService.get('rasa.messageDelay')),
              (payload: RasaResponsePayload, _) => {
                return payload;
              },
            );
          }),
        )
        .subscribe({
          next: (response: RasaResponsePayload) => {
            const command = plainToInstance(
              NewRasaMessageCommand,
              Object.assign(response, { namespace: rasaServer.name }),
            );
            this.logger.debug(JSON.stringify(command));
            this.commandBus.execute(command);
          },
          error: (error: Error) => {
            this.logger.error(error);
            reject(error);
          },
          complete: () => {
            resolve();
          },
        });
    });
  }
}
