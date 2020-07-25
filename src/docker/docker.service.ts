import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';
import Docker from 'dockerode';

@Injectable()
export class DockerService {
  private readonly logger = new Logger(DockerService.name);

  private dockerApi: Docker;

  constructor(private readonly configService: ConfigService) {}

  public get instance(): Docker {
    if (!this.dockerApi) {
      this.dockerApi = new Docker(this.configService.get('docker.config'));
    }

    return this.dockerApi;
  }

  public async cleanUpContainer(containerId: string): Promise<void> {
    try {
      // await this.containerApi.containerStop(containerId);
      const container = await this.instance.getContainer(containerId);
      await container.remove({
        id: containerId,
        v: true,
        force: true,
        link: false,
      });
    } catch (error) {
      this.logger.error(error);
      console.error(error.response.data);
      throw error;
    }
  }
}
