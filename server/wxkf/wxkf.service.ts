import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { Client as Minio } from 'minio';
import qs from 'query-string';

import {
  KeyValueStorageBase,
  MinioService,
  PrismaService,
} from 'server/modules/storage';
import {
  WxkfAccount,
  WxkfAccountAddInput,
  WxkfAccountDeleteInput,
  WxkfAddContactWayInput,
  WxkfClient,
  WxkfMediaType,
  WxkfMediaUploadInput,
  WxkfMessagePayload,
  WxkfSendMsgResponse,
  WxkfSyncMsgInput,
  WxkfSyncMsgResponse,
} from 'server/utils/wx-sdk';

import { WxkfCredentials, WxkfAccountLink } from './models';

const WXKF_ACCESS_TOKEN = 'wxkf:accessToken';
const WXKF_LATEST_CURSOR = 'wxkf:latestCursor';

export class WxkfService {
  private logger: Logger;
  private wxkfClient: WxkfClient;
  private readonly corpId: string;

  constructor(
    private readonly credentials: WxkfCredentials,
    private readonly assetsBucket: string,
    private readonly minioClient: Minio,
    private readonly prisma: PrismaService,
    private readonly kvStorage: KeyValueStorageBase,
  ) {
    const { corpId } = this.credentials;
    this.corpId = corpId;
    this.logger = new Logger(`${WxkfService.name}-${corpId}`);
    this.wxkfClient = new WxkfClient({
      ...this.credentials,
      getAccessTokenFromCache: () => this.getAccessToken(),
      storeAccessTokenToCache: (_, accessToken, expiresIn) =>
        this.storeAccessToken(accessToken, expiresIn),
    });
  }

  public async downloadMedia(mediaId: string): Promise<string> {
    const { media, filename, contentType } = await this.wxkfClient.getMedia(
      mediaId,
    );
    await this.minioClient.putObject(this.assetsBucket, `${this.corpId}/${filename}`, media, {
      'Content-Type': contentType,
    });
    return `s3://${this.assetsBucket}/${this.corpId}/${filename}`;
  }

  public async fetchAccountList(): Promise<WxkfAccount[]> {
    const response = await this.wxkfClient.listAccounts();
    return response.account_list;
  }

  public async createAccount(name: string, media_id: string): Promise<string> {
    const response = await this.wxkfClient.addAccount(
      plainToInstance(WxkfAccountAddInput, {
        name,
        media_id,
      }),
    );

    return response.open_kfid;
  }

  public async deleteAccount(open_kfid: string): Promise<boolean> {
    try {
      await this.wxkfClient.deleteAccount(
        plainToInstance(WxkfAccountDeleteInput, {
          open_kfid,
        }),
      );
      return true;
    } catch (err) {
      this.logger.error(err);
      return false;
    }
  }

  public async updateAccount(
    open_kfid: string,
    name?: string,
    media_id?: string,
  ): Promise<boolean> {
    try {
      await this.wxkfClient.updateAccount(
        plainToInstance(WxkfAddContactWayInput, {
          open_kfid,
          name,
          media_id,
        }),
      );
      return true;
    } catch (err) {
      this.logger.error(err);
      return false;
    }
  }

  public async getAccountLinks(id: string): Promise<WxkfAccountLink[]> {
    return await this.prisma.wxkfAccountLink.findMany({
      where: {
        openKfId: id,
      },
    });
  }

  public async addAccountLink(
    id: string,
    scene: string,
    sceneParam: any,
  ): Promise<WxkfAccountLink> {
    let link = await this.prisma.wxkfAccountLink.findFirst({
      where: {
        openKfId: id,
        scene,
        scene_param: {
          equals: sceneParam,
        },
      },
    });
    if (link) {
      return null;
    }

    const accountLink = await this.fetchAccountLink(id, scene);
    if (!accountLink) {
      return null;
    }
    const urlWithParam =
      accountLink +
      (Object.keys(sceneParam).length > 0
        ? `${scene ? '&' : '?'}scene_param=${encodeURIComponent(
            qs.stringify(sceneParam),
          )}`
        : '');
    link = await this.prisma.wxkfAccountLink.create({
      data: {
        openKfId: id,
        scene,
        scene_param: sceneParam,
        url: urlWithParam,
      },
    });
    return link;
  }

  public async deleteAccountLink(id: number): Promise<WxkfAccountLink> {
    return await this.prisma.wxkfAccountLink.delete({
      where: {
        id,
      },
    });
  }

  public async fetchAccountLink(
    open_kfid: string,
    scene?: string,
  ): Promise<string> {
    const response = await this.wxkfClient.addContactWay(
      plainToInstance(WxkfAddContactWayInput, {
        open_kfid,
        scene,
      }),
    );

    return response.url;
  }

  public async sendMessage(
    payload: WxkfMessagePayload,
  ): Promise<WxkfSendMsgResponse> {
    return this.wxkfClient.sendMessage(payload);
  }

  public async syncMessage(
    token?: string,
    limit = 1000,
    recursive = true,
  ): Promise<WxkfSyncMsgResponse> {
    const cursor = await this.getLatestCursor();
    const response = await this.wxkfClient.syncMessage(
      plainToInstance(WxkfSyncMsgInput, {
        cursor,
        token,
        limit,
      }),
      recursive,
    );
    await this.setLatestCursor(response.next_cursor);
    return response;
  }

  private async getLatestCursor(): Promise<string | null> {
    const key = `${WXKF_LATEST_CURSOR}`;
    const cursorData = await this.kvStorage.get(key);
    return cursorData;
  }

  private async setLatestCursor(cursor: string): Promise<void> {
    const key = `${WXKF_LATEST_CURSOR}`;
    await this.kvStorage.set(key, cursor);
  }

  public async uploadAvatar(avatar: Express.Multer.File): Promise<string> {
    const response = await this.wxkfClient.uploadMedia(
      plainToInstance(WxkfMediaUploadInput, {
        type: WxkfMediaType.Image,
        media: avatar.buffer,
        filename: avatar.originalname,
        contentType: avatar.mimetype,
        knownLength: avatar.size,
      }),
    );

    await this.minioClient.putObject(
      this.assetsBucket,
      `${this.corpId}/${response.media_id}`,
      avatar.buffer,
      {
        'Content-Type': avatar.mimetype,
      },
    );

    return response.media_id;
  }

  public validateWxkfRequestSignature(
    signature: string,
    timestamp: string,
    nonce: string,
    echostr: string,
  ): boolean {
    return this.wxkfClient.validateWxkfRequestSignature(signature, timestamp, nonce, echostr);
  }

  public decryptXmlMessage(encryptedXml: string): any {
    return this.wxkfClient.decryptXmlMessage(encryptedXml);
  }

  public decryptMessage(encrypted: string): string {
    return this.wxkfClient.decryptMessage(encrypted);
  }

  private async getAccessToken(): Promise<string> {
    return this.kvStorage.get(WXKF_ACCESS_TOKEN);
  }

  private async storeAccessToken(
    accessToken: string,
    expiresIn: number,
  ): Promise<void> {
    await this.kvStorage.set(WXKF_ACCESS_TOKEN, accessToken, expiresIn);
  }
}

export function WxkfServiceFactory(
  config: ConfigService,
  minio: MinioService,
  prisma: PrismaService,
  kvStorage: KeyValueStorageBase,
): WxkfService {
  const credentials = config.get<WxkfCredentials>('wxkf.credentials');
  const assetsBucket = config.get<string>('wxkf.assetsBucket');
  const minioClient = minio.instance;
  return new WxkfService(
    credentials,
    assetsBucket,
    minioClient,
    prisma,
    kvStorage,
  );
}
