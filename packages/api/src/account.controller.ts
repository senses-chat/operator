import { Controller, Get, Logger, Query, Post, Body, Headers } from '@nestjs/common';
import { PrismaService, WechatApp, WecomApp } from '@senses-chat/operator-database';

@Controller('/api/account')
export class AccountApiController {
  private readonly logger = new Logger(AccountApiController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Get('/wechat')
  async getWechatAppList(
    @Query('skip') skip: number,
    @Query('size') size: number,
    @Headers('NEXT_AUTH_USER_ID') userId: string,
  ): Promise<WechatApp[]> {
    const wechatApps = await this.prisma.wechatApp.findMany({
      skip: +skip || 0,
      take: +size || 10,
      where: {
        userId,
      }
    });
    return wechatApps.map((item) => ({
      ...item,
      appSecret: ''
    }));
  }

  @Get('/wechat/count')
  async getWechatAppCount(
    @Headers('NEXT_AUTH_USER_ID') userId: string,
  ): Promise<number> {
    const count = await this.prisma.wechatApp.count({
      where: {
        userId,
      }
    });
    return count;
  }

  @Post('/wechat/remove')
  async deleteWechatApp(
    @Body('id') id: number,
    @Headers('NEXT_AUTH_USER_ID') userId: string,
  ): Promise<boolean> {
    if (!(await this.prisma.wechatApp.findFirst({
      where: {
        id,
        userId,
      }
    }))) {
      return true;
    }

    const wechatApp = await this.prisma.wechatApp.delete({
      where: {
        id,
      }
    });
    return !!wechatApp;
  }

  @Post('/wechat/update')
  async updateWechatApp(
    @Body('id') id: number,
    @Body('name') name: string,
    @Body('appId') appId: string,
    @Body('appSecret') appSecret: string,
    @Body('token') token: string,
    @Body('aesKey') aesKey: string,
    @Headers('NEXT_AUTH_USER_ID') userId: string,
  ): Promise<WechatApp> {
    if (!(await this.prisma.wechatApp.findFirst({
      where: {
        id,
        userId,
      }
    }))) {
      return null;
    }

    const wechatApp = await this.prisma.wechatApp.update({
      where: {
        id,
      },
      data: {
        name,
        appId,
        appSecret: appSecret || undefined,
        token,
        aesKey,
        updatedAt: new Date(),
      }
    });
    return wechatApp;
  }

  @Post('/wechat/create')
  async createWechatApp(
    @Body('name') name: string,
    @Body('appId') appId: string,
    @Body('appSecret') appSecret: string,
    @Body('token') token: string,
    @Body('aesKey') aesKey: string,
    @Headers('NEXT_AUTH_USER_ID') userId: string,
  ): Promise<WechatApp> {
    const wechatApp = await this.prisma.wechatApp.create({
      data: {
        name,
        appId,
        appSecret: appSecret || undefined,
        token,
        aesKey,
        userId,
      }
    });
    return wechatApp;
  }

  @Get('/wecom')
  async getWecomAppList(
    @Query('skip') skip: number,
    @Query('size') size: number,
    @Headers('NEXT_AUTH_USER_ID') userId: string,
  ): Promise<WecomApp[]> {
    const wecomApps = await this.prisma.wecomApp.findMany({
      skip: +skip || 0,
      take: +size || 10,
      where: {
        userId,
      }
    });
    return wecomApps.map((item) => ({
      ...item,
      corpSecret: ''
    }));
  }

  @Get('/wecom/count')
  async getWecomAppCount(
    @Headers('NEXT_AUTH_USER_ID') userId: string,
  ): Promise<number> {
    const count = await this.prisma.wecomApp.count({
      where: {
        userId,
      }
    });
    return count;
  }

  @Post('/wecom/remove')
  async deleteWecomApp(
    @Body('id') id: number,
    @Headers('NEXT_AUTH_USER_ID') userId: string,
  ): Promise<boolean> {
    if (!(await this.prisma.wecomApp.findFirst({
      where: {
        id,
        userId,
      }
    }))) {
      return true;
    }

    const wecomApp = await this.prisma.wecomApp.delete({
      where: {
        id,
      }
    });
    return !!wecomApp;
  }

  @Post('/wecom/update')
  async updateWecomApp(
    @Body('id') id: number,
    @Body('name') name: string,
    @Body('corpId') corpId: string,
    @Body('corpSecret') corpSecret: string,
    @Body('token') token: string,
    @Body('aesKey') aesKey: string,
    @Headers('NEXT_AUTH_USER_ID') userId: string,
  ): Promise<WecomApp> {
    if (!(await this.prisma.wecomApp.findFirst({
      where: {
        id,
        userId,
      }
    }))) {
      return null;
    }

    const wecomApp = await this.prisma.wecomApp.update({
      where: {
        id,
      },
      data: {
        name,
        corpId,
        corpSecret: corpSecret || undefined,
        token,
        aesKey,
        updatedAt: new Date(),
      }
    });
    return wecomApp;
  }

  @Post('/wecom/create')
  async createWecomApp(
    @Body('name') name: string,
    @Body('corpId') corpId: string,
    @Body('corpSecret') corpSecret: string,
    @Body('token') token: string,
    @Body('aesKey') aesKey: string,
    @Headers('NEXT_AUTH_USER_ID') userId: string,
  ): Promise<WecomApp> {
    const wecomApp = await this.prisma.wecomApp.create({
      data: {
        name,
        corpId,
        corpSecret: corpSecret || undefined,
        token,
        aesKey,
        userId,
      }
    });
    return wecomApp;
  }
}
