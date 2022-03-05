import { Body, Controller, Logger, Param, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { plainToInstance } from '@senses-chat/operator-common';
import { PrismaService } from '@senses-chat/operator-database';

import { NewRasaMessageCommand } from './commands';
import { RasaResponsePayload } from './models';

@Controller('rasa')
export class RasaController {
  private logger = new Logger(RasaController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly prisma: PrismaService,
  ) {}

  @Post('/:botNamespace')
  async webhook(
    @Param('botNamespace') botNamespace: string,
    @Body() message: RasaResponsePayload,
  ) {
    const rasaServer = await this.prisma.rasaServer.findFirst({
      where: {
        name: botNamespace,
        isActive: true,
      },
    });

    if (!rasaServer) {
      this.logger.warn(`Rasa server with name ${botNamespace} not found or not active`);
      return;
    }

    const command = plainToInstance(
      NewRasaMessageCommand,
      Object.assign(message, { namespace: rasaServer.name }),
    );

    this.logger.debug(JSON.stringify(command));
    this.commandBus.execute(command);
  }
}
