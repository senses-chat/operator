import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getBufferFromStream } from '@senses-chat/operator-common';
import {
  getS3BucketName,
  getS3FileName,
  getS3ObjectName,
  plainToInstance,
} from '@senses-chat/operator-common';
import {
  KeyValueStorageBase,
  MinioService,
} from '@senses-chat/operator-database';
import {
  WechatClient,
  WechatMediaType,
  WechatMediaUploadInput,
  WechatMessageInput,
} from '@senses-chat/wx-sdk';

import { WechatCredentials } from './models';

const WECHAT_ACCESS_TOKEN = 'accessToken';
const DELIMITER = ':';

export class WechatService {
  private logger: Logger;
  private wechatClient: WechatClient;
  protected readonly appId: string;

  constructor(
    private readonly credentials: WechatCredentials,
    private readonly assetsBucket: string,
    private readonly minio: MinioService,
    private readonly kvStorage: KeyValueStorageBase,
  ) {
    const { appId } = this.credentials;
    this.appId = appId;
    this.logger = new Logger(`${WechatService.name}-${appId}`);
    this.wechatClient = new WechatClient({
      ...this.credentials,
      getAccessTokenFromCache: () => this.getAccessToken(),
      storeAccessTokenToCache: (_, accessToken, expiresIn) =>
        this.storeAccessToken(accessToken, expiresIn),
    });
  }

  public async sendMessage(input: WechatMessageInput): Promise<void> {
    await this.wechatClient.messageCustomSend(input);
  }

  public async uploadImage(imagePath: string): Promise<string> {
    const bucket = getS3BucketName(imagePath) || this.assetsBucket;
    const objectName = getS3ObjectName(imagePath);
    const objectStat = await this.minio.statObject(bucket, objectName);
    const objectStream = await this.minio.getObject(bucket, objectName);
    const objectBuffer = await getBufferFromStream(objectStream);

    const response = await this.wechatClient.uploadMedia(
      plainToInstance(WechatMediaUploadInput, {
        type: WechatMediaType.Image,
        media: objectBuffer,
        filename: getS3FileName(imagePath),
        contentType: objectStat?.metaData?.mimetype || undefined,
        knownLength: objectStat.size,
      }),
    );

    return response.media_id;
  }

  public validateWechatRequestSignature(
    signature: string,
    timestamp: string,
    nonce: string,
    echostr: string,
  ): boolean {
    return this.wechatClient.validateRequestSignature(
      signature,
      timestamp,
      nonce,
      echostr,
    );
  }

  public decryptXmlMessage(encryptedXml: string): any {
    return this.wechatClient.decryptXmlMessage(encryptedXml);
  }

  public decryptMessage(encrypted: string): string {
    return this.wechatClient.decryptMessage(encrypted);
  }

  protected async getAccessToken(): Promise<string | undefined> {
    const key = `${WECHAT_ACCESS_TOKEN}${DELIMITER}${this.appId}`;
    return this.kvStorage.get(key);
  }

  protected async storeAccessToken(
    accessToken: string,
    expiresIn: number,
  ): Promise<void> {
    const key = `${WECHAT_ACCESS_TOKEN}${DELIMITER}${this.appId}`;
    return this.kvStorage.set(key, accessToken, expiresIn);
  }
}

export function wechatServiceFactory(
  credentials: WechatCredentials,
  config: ConfigService,
  minio: MinioService,
  kvStorage: KeyValueStorageBase,
): WechatService {
  const assetsBucket = config.get<string>('wechat.assetsBucket');
  return new WechatService(
    credentials,
    assetsBucket,
    minio,
    kvStorage,
  );
}
