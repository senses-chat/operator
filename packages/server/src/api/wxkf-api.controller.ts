import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { WxkfAccountLink } from './models';
import { WxkfServiceRegistry } from 'src/wxkf/wxkf.registry';

@Controller('/api/wxkf')
export class WxkfApiController {
  private readonly logger = new Logger(WxkfApiController.name);

  constructor(private readonly wxkfServiceRegistry: WxkfServiceRegistry, private readonly config: ConfigService) {}

  @Get('/account')
  async getAccountList(@Query('corpId') corpId?: string): Promise<any[]> {
    const accountList = await this.wxkfServiceRegistry
      .getService(corpId)
      .fetchAccountList();
    return accountList;
  }

  @Post('/account/delete')
  async deleteAccount(@Body() body: any): Promise<boolean> {
    return await this.wxkfServiceRegistry
      .getService(body.corpId)
      .deleteAccount(body.id);
  }

  @Post('/account/add')
  async createAccount(@Body() body: any): Promise<boolean> {
    let mediaId = body.mediaId;
    if (!mediaId) {
      mediaId = await this.wxkfServiceRegistry
        .getService(body.corpId)
        .uploadAvatar(this.config.get<string>('wxkf.defaultAvatarS3'));
    }
    return !!(await this.wxkfServiceRegistry
      .getService(body.corpId)
      .createAccount(body.name, mediaId));
  }

  @Post('/account/update')
  async updateAccount(@Body() body: any): Promise<boolean> {
    return await this.wxkfServiceRegistry
      .getService(body.corpId)
      .updateAccount(body.id, body?.name || null, body?.mediaId || null);
  }

  @Post('/account/avatar')
  async uploadAccountAvatar(
    @Body('avatar') avatar: string,
    @Query('corpId') corpId?: string,
  ): Promise<string> {
    return await this.wxkfServiceRegistry.getService(corpId).uploadAvatar(`avatar/temp/${avatar}`);
  }

  @Get('/account/avatar')
  async getAccountAvatarUploadLink(
    @Query('corpId') corpId?: string,
  ): Promise<{ s3: string, link: string }> {
    return await this.wxkfServiceRegistry.getService(corpId).getAvatarUploadLink();
  }

  @Get('/account/link')
  async getAccountLinks(
    @Query('id') id?: string,
    @Query('corpId') corpId?: string,
  ): Promise<WxkfAccountLink[]> {
    return await this.wxkfServiceRegistry
      .getService(corpId)
      .getAccountLinks(id);
  }

  @Post('/account/link/add')
  async addAccountLink(@Body() body: any): Promise<boolean> {
    return !!(await this.wxkfServiceRegistry
      .getService(body.corpId)
      .addAccountLink(body.id, body.scene, body.sceneParam));
  }

  @Post('/account/link/delete')
  async deleteAccountLink(@Body() body: any): Promise<boolean> {
    return !!(await this.wxkfServiceRegistry
      .getService(body.corpId)
      .deleteAccountLink(body.id));
  }
}
