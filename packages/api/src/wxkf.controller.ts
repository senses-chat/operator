import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Logger,
  Param,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { WxkfAccountLink } from '@senses-chat/operator-database';
import { WxkfServiceRegistry } from '@senses-chat/operator-wxkf';

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
    const mediaId = body.mediaId;
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

  @Post('/account/link/update')
  async updateAccountLink(@Body() body: any): Promise<boolean> {
    return !!(await this.wxkfServiceRegistry
      .getService(body.corpId)
      .updateAccountLink(body.id, body.scene, body.sceneParam));
  }

  @Post('/account/link/delete')
  async deleteAccountLink(@Body() body: any): Promise<boolean> {
    return !!(await this.wxkfServiceRegistry
      .getService(body.corpId)
      .deleteAccountLink(body.id));
  }

  @Get('/externalUser/:id')
  async getExternalUser(
    @Query('corpId') corpId?: string,
    @Param('id') id?: string,
  ): Promise<any> {
    return (await this.wxkfServiceRegistry
      .getService(corpId)
      .getExternalUser([id])).customer_list?.[0] || null;
  }

  @Get('/department')
  async getDepartmentList(@Query('corpId') corpId?: string): Promise<any[]> {
    const departmentList = await this.wxkfServiceRegistry
      .getService(corpId)
      .fetchDepartmentList();
    return departmentList;
  }

  @Get('/department/user')
  async getUserList(@Query('corpId') corpId?: string, @Query('departmentId') departmentId?: number): Promise<any[]> {
    const usertList = await this.wxkfServiceRegistry
      .getService(corpId)
      .fetchUserList(departmentId);
    return usertList;
  }

  @Get('/servicer')
  async getServicerList(@Query('open_kfid') open_kfid: string, @Query('corpId') corpId?: string): Promise<any[]> {
    const servicerList = await this.wxkfServiceRegistry
      .getService(corpId)
      .fetchServicerList(open_kfid);
    return servicerList;
  }

  @Post('/servicer/add')
  async addServicer(@Body('open_kfid') open_kfid: string, @Body('userId') userId: string, @Query('corpId') corpId?: string): Promise<any> {
    const result = await this.wxkfServiceRegistry
      .getService(corpId)
      .addServicer(open_kfid, userId);
    return result;
  }

  @Post('/servicer/remove')
  async removeServicer(@Body('open_kfid') open_kfid: string, @Body('userId') userId: string, @Query('corpId') corpId?: string): Promise<any> {
    const result = await this.wxkfServiceRegistry
      .getService(corpId)
      .removeServicer(open_kfid, userId);
    return result;
  }
}
