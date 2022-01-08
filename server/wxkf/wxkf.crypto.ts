// https://juejin.im/post/5df9e721f265da33c42812df

import * as crypto from 'crypto';

class PKCS7 {
  /**
   * 删除补位
   * @param {String} buf 解密后的明文
   */
  static decode(buf: Buffer): Buffer {
    let pad = buf[buf.length - 1];
    if (pad < 1 || pad > 32) {
      pad = 0;
    }
    return buf.slice(0, buf.length - pad);
  }
  /**
   * 填充补位
   * @param {String} buf 需要进行填充补位的明文
   */
  static encode(buf: Buffer): Buffer {
    const blockSize = 32;
    const textLength = buf.length;
    // 计算需要填充的位数
    const amountToPad = blockSize - (textLength % blockSize);
    const result = Buffer.alloc(amountToPad);
    result.fill(amountToPad);
    return Buffer.concat([buf, result]);
  }
}

/**
 * 微信公众号消息加解密
 * 官方文档(写的非常之烂)：https://work.weixin.qq.com/api/doc/90000/90139/90968
 */
export class WxkfMsgCrypto {
  private key: Buffer;
  private iv: Buffer;

  /**
   * 以下信息在公众号 - 开发 - 基本配置
   * @param {String} token          令牌(Token)
   * @param {String} encodingAESKey 消息加解密密钥
   * @param {String} corpId          企业微信的corpId
   */

  constructor(private readonly corpId: string, private readonly token: string, encodingAESKey: string) {
    if (!token || !encodingAESKey || !corpId) {
      throw new Error('please check arguments');
    }

    const AESKey = Buffer.from(encodingAESKey + '=', 'base64');
    if (AESKey.length !== 32) {
      throw new Error('encodingAESKey invalid');
    }
    this.key = AESKey;
    this.iv = AESKey.slice(0, 16);
  }

  /**
   * 获取签名
   * @param {String} timestamp    时间戳
   * @param {String} nonce        随机数
   * @param {String} encrypted    加密后的文本
   */
  getSignature(timestamp: string, nonce: string, encrypted: string): string {
    const sha = crypto.createHash('sha1');
    const arr = [this.token, timestamp, nonce, encrypted].sort();
    sha.update(arr.join(''));
    return sha.digest('hex');
  }

  /**
   * 对密文进行解密
   * @param {String} text    待解密的密文
   */
  decrypt(text: string): { message: string; corpId: string } {
    // 创建解密对象，AES采用CBC模式，数据采用PKCS#7填充；IV初始向量大小为16字节，取AESKey前16字节
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, this.iv);
    decipher.setAutoPadding(false);

    let deciphered = Buffer.concat([decipher.update(text, 'base64'), decipher.final()]);

    deciphered = PKCS7.decode(deciphered);
    // 算法：AES_Encrypt[random(16B) + msg_len(4B) + msg + $CorpID]
    // 去除16位随机数
    const content = deciphered.slice(16);
    const length = content.slice(0, 4).readUInt32BE(0);

    return {
      message: content.slice(4, length + 4).toString(),
      corpId: content.slice(length + 4).toString(),
    };
  }
  /**
   * 对明文进行加密
   * 算法：Base64_Encode(AES_Encrypt[random(16B) + msg_len(4B) + msg + $corpId])
   * @param {String} text    待加密明文文本
   */
  encrypt(text: string): string {
    // 16B 随机字符串
    const randomString = crypto.pseudoRandomBytes(16);

    const msg = Buffer.from(text);
    // 获取4B的内容长度的网络字节序
    const msgLength = Buffer.alloc(4);
    msgLength.writeUInt32BE(msg.length, 0);

    const id = Buffer.from(this.corpId);

    const bufMsg = Buffer.concat([randomString, msgLength, msg, id]);

    // 对明文进行补位操作
    const encoded = PKCS7.encode(bufMsg);

    // 创建加密对象，AES采用CBC模式，数据采用PKCS#7填充；IV初始向量大小为16字节，取AESKey前16字节
    const cipher = crypto.createCipheriv('aes-256-cbc', this.key, this.iv);
    cipher.setAutoPadding(false);

    const cipheredMsg = Buffer.concat([cipher.update(encoded), cipher.final()]);

    return cipheredMsg.toString('base64');
  }
}
