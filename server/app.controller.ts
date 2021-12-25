import { Controller, Get } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';

@Controller('/')
export class AppController {
  constructor(private readonly configService: ConfigService) {}
  @Get('/')
  public async getRoot(): Promise<string> {
    return this.configService.get('wx3p.validationString');
  }
}
