import { XMLParser } from 'fast-xml-parser';
import fetch, { RequestInfo, RequestInit } from 'node-fetch';
import qs from 'query-string';
import { plainToInstance } from 'class-transformer';

import { Constructor, WxResponse } from './model';
import { WxMsgCrypto } from './crypto';

export abstract class WxBaseClient {
  constructor(protected readonly urlPrefix: string) {}

  public validateRequestSignature(
    signature: string,
    timestamp: string,
    nonce: string,
    echostr: string,
  ): boolean {
    const sign = this.getCrypto().getSignature(timestamp, nonce, echostr);
    return sign === signature;
  }

  public decryptXmlMessage(encryptedXml: string): any {
    const parser = new XMLParser();
    return parser.parse(this.decryptMessage(encryptedXml)).xml;
  }

  protected decryptMessage(encrypted: string, id?: string): string {
    const { message, id: decryptedId } = this.getCrypto().decrypt(encrypted);

    // if id not provided, skip the check
    if (id && id !== decryptedId) {
      throw new Error('invalid receiveId');
    }

    return message;
  }

  protected abstract getCrypto(): WxMsgCrypto;

  protected url(path: string, params?: Record<string, any>): string {
    return `${this.urlPrefix}${path}${
      params ? `?${qs.stringify(params)}` : ''
    }`;
  }

  protected async request<T extends WxResponse>(
    clazz: Constructor<T>,
    path: RequestInfo,
    init?: RequestInit,
  ): Promise<T> {
    if (!init) {
      init = { headers: this.headers() };
    } else {
      init = { ...init, headers: init.headers ? init.headers : this.headers() };
    }

    const response = await fetch(path, init);

    const json: any = await response.json();

    if (json.errcode > 0) {
      throw new Error(`Wx Error code ${json.errcode}: ${json.errmsg}`);
    }

    return plainToInstance(clazz, json);
  }

  protected headers(): { [key: string]: string } {
    return {
      'Content-Type': 'application/json',
    };
  }
}
