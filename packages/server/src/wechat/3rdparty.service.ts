import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { XMLParser } from 'fast-xml-parser';

import { KeyValueStorageBase, WECHAT_KV_STORAGE } from '@senses-chat/operator-database';

import { WXMsgCrypto } from './wechat.crypto';
import { Wechat3rdPartyCredentials } from './models';

const COMPONENT_VERIFY_TICKET = 'wechat:component:verify_ticket';

@Injectable()
export class Wechat3rdPartyService {
  private logger = new Logger(Wechat3rdPartyService.name);

  private credentials: Wechat3rdPartyCredentials;

  constructor(
    private readonly configService: ConfigService,
    @Inject(WECHAT_KV_STORAGE)
    private readonly kvStorage: KeyValueStorageBase,
  ) {
    this.credentials = this.configService.get(
      'wx3p',
    ) as Wechat3rdPartyCredentials;
  }

  public async decodeEncryptedXmlMessage(encrypted: string): Promise<any> {
    const { appId, token, aesKey } = this.credentials;
    const crypto = new WXMsgCrypto(appId, token, aesKey);
    const parser = new XMLParser();
    return parser.parse(crypto.decrypt(encrypted).message).xml;
  }

  public async storeComponentVerifyTicket(ticket?: string): Promise<void> {
    if (!ticket) {
      this.logger.warn('no ticket');
      return;
    }

    // setting it to 30 mins for now
    await this.kvStorage.set(COMPONENT_VERIFY_TICKET, ticket, 1800);
  }

  // private async clearAccessTokens(): Promise<any> {
  //   return this.redisClient.del(COMPONENT_VERIFY_TICKET);
  // }
}
