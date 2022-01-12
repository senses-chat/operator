import fs from 'fs';
import path from 'path';
import { Express } from 'express';
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

import { WxkfAccountLink } from './models';
import { WxkfService } from '../wxkf/wxkf.service';

@Controller('/api/wxkf')
export class WxkfApiController {
  private readonly logger = new Logger(WxkfApiController.name);

  constructor(private readonly wxkfService: WxkfService) {}

  @Get('/account')
  async getAccountList(): Promise<any[]> {
    const accountList = await this.wxkfService.fetchAccountList();
    return accountList;
  }

  @Post('/account/delete')
  async deleteAccount(@Body() body: any): Promise<boolean> {
    return await this.wxkfService.deleteAccount(body.id);
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
      mediaId = await this.wxkfService.uploadAvatar(file);
    }
    return !!(await this.wxkfService.createAccount(body.name, mediaId));
  }

  @Post('/account/update')
  async updateAccount(@Body() body: any): Promise<boolean> {
    return await this.wxkfService.updateAccount(
      body.id,
      body?.name || null,
      body?.mediaId || null,
    );
  }

  @Post('/account/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAccountAvatar(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<string> {
    return await this.wxkfService.uploadAvatar(file);
  }

  @Get('/account/link')
  async getAccountLinks(@Query() query: any): Promise<WxkfAccountLink[]> {
    return await this.wxkfService.getAccountLinks(query.id);
  }

  @Post('/account/link/add')
  async addAccountLink(@Body() body: any): Promise<boolean> {
    return !!(await this.wxkfService.addAccountLink(
      body.id,
      body.scene,
      body.sceneParam,
    ));
  }

  @Post('/account/link/delete')
  async deleteAccountLink(@Body() body: any): Promise<boolean> {
    return !!(await this.wxkfService.deleteAccountLink(body.id));
  }
}
