import { createDecipheriv } from 'crypto';
import fetch from 'node-fetch';
import { plainToInstance } from 'class-transformer';

import { WechatClient } from '../wechat';
import { WechatMiniCode2SessionResponse, WechatMiniGetWxaCodeUnlimitInput } from './model';
import { WxResponse } from '../model';

export class WechatMiniClient extends WechatClient {
  // FIXME: see if there is better way to handle error
  public async getWxaCodeUnlimit(input: WechatMiniGetWxaCodeUnlimitInput): Promise<Buffer | WxResponse> {
    const access_token = await this.fetchAccessToken();
    const url = this.url('/wxa/getwxacodeunlimit', {
      access_token,
    });

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(input),
    });

    const buffer = await response.buffer();
    const checkBuffer = Buffer.from(buffer);

    try {
      // this is the error case actually
      const obj = JSON.parse(checkBuffer.toString());
      return plainToInstance(WxResponse, obj);
    } catch (err) {
      // this is the success case actually
      return buffer;
    }
  }

  public async code2Session(code: string): Promise<WechatMiniCode2SessionResponse> {
    const url = this.url('/sns/jscode2session', {
      appid: this.appId,
      secret: this.appSecret,
      js_code: code,
      grant_type: 'authorization_code',
    });

    return this.request(WechatMiniCode2SessionResponse, url);
  }

  public decodeMiniAppEncryptedData(
    appid: string,
    sessionKey: string,
    encryptedData: string,
    iv: string,
  ): any {
    // base64 decode
    const sessionKeyBuffer = Buffer.from(sessionKey, 'base64');
    const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
    const ivBuffer = Buffer.from(iv, 'base64');

    // 解密
    const decipher = createDecipheriv(
      'aes-128-cbc',
      sessionKeyBuffer,
      ivBuffer,
    );
    // 设置自动 padding 为 true，删除填充补位
    decipher.setAutoPadding(true);
    const decodedString =
      decipher.update(encryptedDataBuffer, null, 'utf8') +
      decipher.final('utf8');

    // this.logger.debug(`decoded:\n${decodedString}`);

    const decodedObject = JSON.parse(decodedString);

    if (decodedObject.watermark.appid !== appid) {
      throw new Error('appid not match');
    }

    return decodedObject;
  }
}
