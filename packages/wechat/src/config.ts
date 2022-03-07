import { registerAs } from '@nestjs/config';

export default registerAs('wechat', () => ({
  assetsBucket: process.env.WECHAT_ASSETS_BUCKET || 'wechat-assets',
}));
