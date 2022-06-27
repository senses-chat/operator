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
    const wxkfService = await this.wxkfServiceRegistry.getService(corpId);
    const accountList = await wxkfService.fetchAccountList();
    return accountList;
  }

  @Post('/account/delete')
  async deleteAccount(@Body() body: any): Promise<boolean> {
    const wxkfService = await this.wxkfServiceRegistry.getService(body.corpId);
    return await wxkfService.deleteAccount(body.id);
  }

  @Post('/account/add')
  async createAccount(@Body() body: any): Promise<boolean> {
    const wxkfService = await this.wxkfServiceRegistry.getService(body.corpId);
    const mediaId = body.mediaId;
    return !!(await wxkfService.createAccount(body.name, mediaId));
  }

  @Post('/account/update')
  async updateAccount(@Body() body: any): Promise<boolean> {
    const wxkfService = await this.wxkfServiceRegistry.getService(body.corpId);
    return await wxkfService.updateAccount(body.id, body?.name || null, body?.mediaId || null);
  }

  @Post('/account/avatar')
  async uploadAccountAvatar(
    @Body('avatar') avatar: string,
    @Query('corpId') corpId?: string,
  ): Promise<string> {
    const wxkfService = await this.wxkfServiceRegistry.getService(corpId);
    return await wxkfService.uploadAvatar(`avatar/temp/${avatar}`);
  }

  @Get('/account/avatar')
  async getAccountAvatarUploadLink(
    @Query('corpId') corpId?: string,
  ): Promise<{ s3: string, link: string }> {
    const wxkfService = await this.wxkfServiceRegistry.getService(corpId);
    return await wxkfService.getAvatarUploadLink();
  }

  @Get('/account/link')
  async getAccountLinks(
    @Query('id') id?: string,
    @Query('corpId') corpId?: string,
  ): Promise<WxkfAccountLink[]> {
    const wxkfService = await this.wxkfServiceRegistry.getService(corpId);
    return await wxkfService.getAccountLinks(id);
  }

  @Post('/account/link/add')
  async addAccountLink(@Body() body: any): Promise<boolean> {
    const wxkfService = await this.wxkfServiceRegistry.getService(body.corpId);
    return !!(await wxkfService.addAccountLink(body.id, body.scene, body.sceneParam));
  }

  @Post('/account/link/update')
  async updateAccountLink(@Body() body: any): Promise<boolean> {
    const wxkfService = await this.wxkfServiceRegistry.getService(body.corpId);
    return !!(await wxkfService.updateAccountLink(body.id, body.scene, body.sceneParam));
  }

  @Post('/account/link/delete')
  async deleteAccountLink(@Body() body: any): Promise<boolean> {
    const wxkfService = await this.wxkfServiceRegistry.getService(body.corpId);
    return !!(await wxkfService.deleteAccountLink(body.id));
  }

  @Get('/externalUser/:id')
  async getExternalUser(
    @Query('corpId') corpId?: string,
    @Param('id') id?: string,
  ): Promise<any> {
    const wxkfService = await this.wxkfServiceRegistry.getService(corpId);
    return (await wxkfService.getExternalUser([id])).customer_list?.[0] || null;
  }

  @Get('/department')
  async getDepartmentList(@Query('corpId') corpId?: string): Promise<any[]> {
    const wxkfService = await this.wxkfServiceRegistry.getService(corpId);
    const departmentList = await wxkfService.fetchDepartmentList();
    return departmentList;
  }

  @Get('/department/user')
  async getUserList(@Query('corpId') corpId?: string, @Query('departmentId') departmentId?: number): Promise<any[]> {
    const wxkfService = await this.wxkfServiceRegistry.getService(corpId);
    const usertList = await wxkfService.fetchUserList(departmentId);
    return usertList;
  }

  @Get('/servicer')
  async getServicerList(@Query('open_kfid') open_kfid: string, @Query('corpId') corpId?: string): Promise<any[]> {
    const wxkfService = await this.wxkfServiceRegistry.getService(corpId);
    const servicerList = await wxkfService.fetchServicerList(open_kfid);
    return servicerList;
  }

  @Post('/servicer/add')
  async addServicer(@Body('open_kfid') open_kfid: string, @Body('userId') userId: string, @Query('corpId') corpId?: string): Promise<any> {
    const wxkfService = await this.wxkfServiceRegistry.getService(corpId);
    const result = await wxkfService.addServicer(open_kfid, userId);
    return result;
  }

  @Post('/servicer/remove')
  async removeServicer(@Body('open_kfid') open_kfid: string, @Body('userId') userId: string, @Query('corpId') corpId?: string): Promise<any> {
    const wxkfService = await this.wxkfServiceRegistry.getService(corpId);
    const result = await wxkfService.removeServicer(open_kfid, userId);
    return result;
  }
}
