import { registerAs } from '@nestjs/config';

export default registerAs('api', () => ({
  wxkf: {
    defaultAvatarS3: process.env.WXKF_DEFAULT_AVATAR_S3 || '',
  },
}));
