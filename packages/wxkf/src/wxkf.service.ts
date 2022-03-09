import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import qs from 'query-string';

import {
  KeyValueStorageBase,
  MinioService,
  PrismaService,
} from '@senses-chat/operator-database';
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
  WxkfServiceStateGetInput,
  WxkfServiceStateGetResponse,
  WxkfServiceStateTransInput,
  WxkfServiceStateTransResponse,
  WxkfSyncMsgInput,
  WxkfSyncMsgResponse,
  WxkfExternalUserGetResponse,
} from '@senses-chat/wx-sdk';
import { plainToInstance, getS3FileName, getS3ObjectName, getS3BucketName } from '@senses-chat/operator-common';

import { WxkfCredentials, WxkfAccountLink } from './models';

const WXKF_ACCESS_TOKEN = 'accessToken';
const WXKF_LATEST_CURSOR = 'latestCursor';

export class WxkfService {
  private logger: Logger;
  private wxkfClient: WxkfClient;
  protected readonly corpId: string;

  constructor(
    private readonly credentials: WxkfCredentials,
    private readonly assetsBucket: string,
    private readonly minio: MinioService,
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
    await this.minio.putObject(
      this.assetsBucket,
      `${this.corpId}/${filename}`,
      media,
      {
        'Content-Type': contentType,
      },
    );
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
        corpId: this.corpId,
        openKfId: id || undefined,
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
        corpId: this.corpId,
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
        corpId: this.corpId,
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

  public async getServiceState(
    open_kfid: string,
    external_userid: string,
  ): Promise<WxkfServiceStateGetResponse> {
    return this.wxkfClient.getServiceState(
      plainToInstance(WxkfServiceStateGetInput, {
        open_kfid,
        external_userid,
      }),
    );
  }

  public async getExternalUser(
    external_userid_list: string[],
  ): Promise<WxkfExternalUserGetResponse> {
    return this.wxkfClient.getExternalUser(external_userid_list);
  }

  public async transferServiceState(
    open_kfid: string,
    external_userid: string,
    // TODO: enum
    service_state: number,
    servicer_userid?: string,
  ): Promise<WxkfServiceStateTransResponse> {
    return this.wxkfClient.transferServiceState(
      plainToInstance(WxkfServiceStateTransInput, {
        open_kfid,
        external_userid,
        service_state,
        servicer_userid,
      }),
    );
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
    const key = `${WXKF_LATEST_CURSOR}:${this.corpId}`;
    const cursorData = await this.kvStorage.get(key);
    return cursorData;
  }

  private async setLatestCursor(cursor: string): Promise<void> {
    const key = `${WXKF_LATEST_CURSOR}:${this.corpId}`;
    await this.kvStorage.set(key, cursor);
  }

  public async getAvatarUploadLink(): Promise<{ s3: string, link: string }> {
    const date = +new Date();

    const link = await this.minio.presignedPutObject(
      this.assetsBucket,
      `avatar/temp/${this.corpId}/${date}`,
      60 * 5,
    );

    return {
      s3: `${this.corpId}/${date}`,
      link,
    };
  }

  public async uploadAvatar(avatarS3Path: string): Promise<string> {
    const bucket = getS3BucketName(avatarS3Path) || this.assetsBucket;
    const objectName = getS3ObjectName(avatarS3Path);
    const avatarStat = await this.minio.statObject(bucket, objectName);
    const avatarFile = await this.minio.getObject(bucket, objectName);

    const response = await this.wxkfClient.uploadMedia(
      plainToInstance(WxkfMediaUploadInput, {
        type: WxkfMediaType.Image,
        media: avatarFile.read(),
        filename: getS3FileName(avatarS3Path),
        contentType: avatarStat?.metaData?.mimetype || undefined,
        knownLength: avatarStat.size,
      }),
    );

    await this.minio.copyObject(
      this.assetsBucket,
      `avatar/${this.corpId}/${response.media_id}`,
      `${bucket}/${objectName}`,
      null,
    );

    await this.minio.removeObject(bucket, objectName);

    return response.media_id;
  }

  public validateWxkfRequestSignature(
    signature: string,
    timestamp: string,
    nonce: string,
    echostr: string,
  ): boolean {
    return this.wxkfClient.validateRequestSignature(
      signature,
      timestamp,
      nonce,
      echostr,
    );
  }

  public decryptXmlMessage(encryptedXml: string): any {
    return this.wxkfClient.decryptXmlMessage(encryptedXml);
  }

  public decryptMessage(encrypted: string): string {
    return this.wxkfClient.decryptMessage(encrypted);
  }

  protected async getAccessToken(): Promise<string> {
    return this.kvStorage.get(`${WXKF_ACCESS_TOKEN}:${this.corpId}`);
  }

  protected async storeAccessToken(
    accessToken: string,
    expiresIn: number,
  ): Promise<void> {
    await this.kvStorage.set(
      `${WXKF_ACCESS_TOKEN}:${this.corpId}`,
      accessToken,
      expiresIn,
    );
  }
}

export function wxkfServiceFactory(
  config: ConfigService,
  minio: MinioService,
  prisma: PrismaService,
  kvStorage: KeyValueStorageBase,
): WxkfService {
  const credentials = config.get<WxkfCredentials>('wxkf.credentials');
  const assetsBucket = config.get<string>('wxkf.assetsBucket');
  return new WxkfService(
    credentials,
    assetsBucket,
    minio,
    prisma,
    kvStorage,
  );
}
