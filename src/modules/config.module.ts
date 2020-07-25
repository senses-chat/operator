import * as path from 'path';
import { ConfigModule } from 'nestjs-config';

const ENV = process.env.NODE_ENV;

export const Module = ConfigModule.load(path.resolve(__dirname, '..', 'config', '**/!(*.d).{ts,js}'), {
  path: path.resolve(process.cwd(), !ENV ? '.env' : `.env.${ENV}`),
});
