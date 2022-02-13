import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Logger,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import path from 'path';
import fs from 'fs';

import { WxkfAccountLink } from './models';
import { WxkfServiceRegistry } from 'server/wxkf/wxkf.registry';

@Controller('/api/wxkf')
export class WxkfApiController {
  private readonly logger = new Logger(WxkfApiController.name);

  constructor(private readonly wxkfServiceRegistry: WxkfServiceRegistry) {}

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
      const file: any = {
        buffer: fs.readFileSync(
          path.resolve(__dirname, '../../public/default_avatar.png'),
        ),
        originalname: 'default_avatar.png',
        mimetype: 'image/png',
      };
      mediaId = await this.wxkfServiceRegistry
        .getService(body.corpId)
        .uploadAvatar(file);
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
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAccountAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Query('corpId') corpId?: string,
  ): Promise<string> {
    return await this.wxkfServiceRegistry.getService(corpId).uploadAvatar(file);
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
