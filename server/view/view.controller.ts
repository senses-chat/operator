import { Logger, Controller, All, Get, Res, Req } from '@nestjs/common';
import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';

import { ViewService } from './view.service';

@Controller('/')
export class ViewController {
  private logger = new Logger(ViewController.name);

  constructor(private viewService: ViewService) {}

  async handler(req: IncomingMessage, res: ServerResponse) {
    const parsedUrl = parse(req.url, true);
    this.logger.verbose(JSON.stringify(parsedUrl));
    await this.viewService.getNextServer().render(req, res, parsedUrl.pathname, parsedUrl.query);
  }

  @All('_next*')
  public async assets(@Req() req: IncomingMessage, @Res() res: ServerResponse) {
    return this.viewService.getNextServer().getRequestHandler()(req, res);
  }

  @Get('/ui*')
  public async showHome(@Req() req: IncomingMessage, @Res() res: ServerResponse) {
    return this.handler(req, res);
  }
}
