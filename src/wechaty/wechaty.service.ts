import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';

import { Wechaty } from 'wechaty';
import { PuppetMacpro } from 'wechaty-puppet-macpro';

@Injectable()
export class WechatyService {
  private readonly logger = new Logger(WechatyService.name);

  private bot: Wechaty;

  constructor(private readonly configService: ConfigService) {
    this.logger.log('initializing wechaty');

    const puppet = new PuppetMacpro({
      token: this.configService.get('wechaty.token'),
    });

    this.bot = new Wechaty({
      puppet,
      name: 'visa-bot',
    });

    this.bot.on('scan', (qrcode, status) => {
      this.logger.debug(`scan - ${JSON.stringify({ qrcode, status }, null, 2)}`);
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrcode)}&size=220x220&margin=20`;
      this.logger.log(`Please scan QR code to start wechaty: ${qrUrl}`);
    });

    this.bot.on('login', (user) => {
      this.logger.debug(`User ${user} logged in`);
    });

    this.bot.on('logout', (user) => {
      this.logger.debug(`User ${user} logged out`);
    });

    this.bot.on('heartbeat', (data) => {
      this.logger.debug(`Wechaty Heartbeat: ${JSON.stringify(data, null, 2)}`);
    });
  }

  public get instance(): Wechaty {
    return this.bot;
  }
}
