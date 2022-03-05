import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { of, from, zip, interval } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';
import fetch from 'node-fetch';

import { plainToInstance } from '@senses-chat/operator-common';
import { PrismaService } from '@senses-chat/operator-database';

import { RasaResponsePayload, RasaWebhookPayload } from './models';
import { SendRasaMessageEvent } from './events';
import { NewRasaMessageCommand } from './commands';

const PING_RASA_SERVERS = 'pingRasaServers';

@Injectable()
export class RasaService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RasaService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
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
  }

  public async pingRasaServers() {
    const rasaServers = await this.prisma.rasaServer.findMany({
      where: {
        isActive: true,
      },
    });

    return Promise.all(
      rasaServers.map((rasaServer) => {
        let pingUrl = rasaServer.pingUrl;
        if (!pingUrl) {
          const url = new URL(rasaServer.url);
          pingUrl = `${url.protocol}//${url.host}/`;
        }

        this.logger.verbose(`pinging ${pingUrl}`);

        return fetch(pingUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }).catch((error) => {
          this.logger.error(error);
        });
      }),
    );
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
