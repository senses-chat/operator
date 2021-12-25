import { Controller, Get } from '@nestjs/common';

import { DockerService } from './docker.service';

@Controller('docker')
export class DockerController {
  constructor(private readonly dockerService: DockerService) {}

  @Get('containers')
  async listContainers() {
    return this.dockerService.instance.listContainers();
  }
}
