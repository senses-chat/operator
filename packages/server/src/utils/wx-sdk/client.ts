import fetch, { RequestInfo, RequestInit } from 'node-fetch';
import qs from 'query-string';

import { plainToInstance } from '@senses-chat/operator-common';
import { Constructor, WxResponse } from './model';

export abstract class WxBaseClient {
  constructor(protected readonly urlPrefix: string) {}

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

    const json = await response.json();

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
