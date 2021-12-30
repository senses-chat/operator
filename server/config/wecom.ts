import { registerAs } from '@nestjs/config';

export default registerAs('wecom', () => ({
  corpId: process.env.WECOM_CORP_ID,
  // corpSecret: process.env.WECOM_CORP_SECRET,
  secret: process.env.WECOM_SECRET,
  token: process.env.WECOM_TOKEN,
  aesKey: process.env.WECOM_AESKEY,
}));
