import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class AppController {
  @Get('/')
  public async getRoot(): Promise<string> {
    return 'OK';
  }
}
