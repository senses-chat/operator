import { registerAs } from '@nestjs/config';

export default registerAs('wx3p', () => ({
  appId: process.env.WX3P_APPID,
  appSecret: process.env.WX3P_APP_SECRET,
  aesKey: process.env.WX3P_AESKEY,
  token: process.env.WX3P_TOKEN,
  validationString: process.env.WX3P_VALIDATION_STRING,
}));
