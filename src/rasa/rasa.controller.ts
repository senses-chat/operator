import { Controller, Get } from '@nestjs/common';

import { RasaService } from './rasa.service';
import { RequestAccept } from './rasa.dto';

@Controller('rasa')
export class RasaController {
  constructor(private readonly rasaService: RasaService) {}

  @Get('domain')
  async getDomain() {
    // return this.rasaService.getDomain(RequestAccept.JSON);
  }
}
