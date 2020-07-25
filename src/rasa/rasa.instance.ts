import { HttpService, Logger } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';
import { Observable, from, zip, interval } from 'rxjs';
import { Container } from 'dockerode';
import { Subject } from 'rxjs';
import * as Ops from 'rxjs/operators';

import { RasaBot, RasaActionServer, Prisma } from 'src/prisma/client';
import { DockerService } from 'src/docker';

import { RasaWebhookPayload, RasaResponsePayload, RequestAccept } from './rasa.dto';
import { DomainApi, Domain } from './client';

export class Rasa {
  private logger: Logger;
  // private domainApi: DomainApi;
  public messageSubject: Subject<RasaWebhookPayload>;

  constructor(
    private readonly configService: ConfigService,
    private readonly dockerService: DockerService,
    private readonly botManagerPrisma: Prisma,
    public readonly rasaBot: RasaBot,
  ) {
    this.logger = new Logger(`${Rasa.name}-${this.rasaBot.name}`);
    // TODO: hostname
    // this.domainApi = new DomainApi({}, `http://localhost:${this.rasaBot.port}`, this.httpService.axiosRef);
    this.messageSubject = new Subject();
  }

  public async launch(): Promise<string[]> {
    this.logger.debug(`launching rasa bot ${this.rasaBot.name}`);

    const containerIds = [];
    const rasaBotContainer = await this.createRasaBotContainer(this.rasaBot);
    this.logger.debug(`Rasa Bot ${this.rasaBot.name} container created as ${rasaBotContainer.id.substr(0, 8)}`);
    containerIds.push(rasaBotContainer.id);

    await rasaBotContainer.start();
    this.logger.debug(`Rasa Bot ${this.rasaBot.name} container started`);

    // start action servers
    const actionServers = await this.botManagerPrisma.rasaBot({ name: this.rasaBot.name }).actions();
    for (const actionServer of actionServers) {
      const actionServerContainer = await this.createRasaActionServerContainer(actionServer);
      this.logger.debug(`Action Server ${actionServer.name} container created as ${actionServerContainer.id.substr(0, 8)}`);
      containerIds.push(actionServerContainer.id);
      await actionServerContainer.start();
      this.logger.debug(`Action Server ${actionServer.name} container started`);
    }

    return containerIds;
  }

  public responseObservable(): Observable<RasaResponsePayload> {
    return this.messageSubject.pipe(
      Ops.concatMap((payload: RasaWebhookPayload) => {
        // TODO: hostname
        return this.httpService.post<RasaResponsePayload[]>(`http://localhost:${this.rasaBot.port}/webhooks/rest/webhook`, payload).pipe(
          Ops.concatMap((response) => {
            this.logger.debug(response.data);
            return zip(from(response.data), interval(this.configService.get('rasa.messageDelay')), (payload, _) => {
              return payload;
            });
          }),
        );
      }),
    );
  }

  // public async getDomain(accept: RequestAccept): Promise<Domain> {
  //   const { data } = await this.domainApi.getDomain({ headers: { accept } });
  //   return data;
  // }

  private async createRasaActionServerContainer(rasaActionServer: RasaActionServer): Promise<Container> {
    return this.dockerService.instance.createContainer({
      name: `rasa-action-${rasaActionServer.name}`,
      Image: rasaActionServer.dockerImage,
      Hostname: `rasa-action-${rasaActionServer.name}`,
      Cmd: rasaActionServer.command.split(' '),
      ExposedPorts: {
        [`5055/tcp`]: {},
      },
      HostConfig: {
        NetworkMode: 'chat-operator',
        PortBindings: {
          [`5055/tcp`]: [{ HostPort: `${rasaActionServer.port}` }],
        },
      },
    });
  }

  private async createRasaBotContainer(rasaBot: RasaBot): Promise<Container> {
    this.logger.debug('creating container');
    return this.dockerService.instance.createContainer({
      name: `rasa-${rasaBot.name}`,
      Image: rasaBot.dockerImage,
      Hostname: `rasa-${rasaBot.name}`,
      Cmd: ['run', '-m', rasaBot.modelName, '--endpoints', 'endpoints.yml', '--remote-storage', 'aws', '--enable-api', '--debug'],
      Env: [
        'AWS_ACCESS_KEY_ID=minio',
        'AWS_SECRET_ACCESS_KEY=minio123',
        'AWS_DEFAULT_REGION=minio-default',
        'AWS_ENDPOINT_URL=http://minio:9000',
        'TRACKER_STORE_HOST=postgres',
        'TRACKER_STORE_PORT=5432',
        'TRACKER_STORE_DB=visa-bot',
        'TRACKER_STORE_USERNAME=chatop',
        'TRACKER_STORE_PASSWORD=chatOperator',
        'BUCKET_NAME=models',
        ...rasaBot.extraEnv,
      ],
      HostConfig: {
        NetworkMode: 'chat-operator',
        PortBindings: {
          [`5005/tcp`]: [{ HostPort: `${rasaBot.port}` }],
        },
      },
    });
  }
}
