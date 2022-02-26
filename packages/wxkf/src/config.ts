import { registerAs } from '@nestjs/config';

export default registerAs('wxkf', () => ({
  credentials: {
    corpId: process.env.WXKF_CORP_ID,
    secret: process.env.WXKF_SECRET,
    token: process.env.WXKF_TOKEN,
    aesKey: process.env.WXKF_AESKEY,
  },
  assetsBucket: process.env.WXKF_ASSETS_BUCKET || 'wxkf-assets',
  defaultAvatarS3: process.env.WXKF_DEFAULT_AVATAR_S3 || '',
}));
