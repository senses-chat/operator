import { getSignature, decrypt, encrypt } from '@wecom/crypto';

export class WxMsgCrypto {
  constructor(
    private readonly id: string,
    private readonly token: string,
    private readonly encodingAESKey: string,
  ) {}

  getSignature(
    timestamp: string | number,
    nonce: string | number,
    encrypt: string,
  ): string {
    return getSignature(this.token, timestamp, nonce, encrypt);
  }

  decrypt(text: string): { message: string; id: string } {
    return decrypt(this.encodingAESKey, text);
  }

  encrypt(text: string): string {
    return encrypt(this.encodingAESKey, text, this.id);
  }
}
