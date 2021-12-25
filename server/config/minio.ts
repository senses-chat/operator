import { ClientOptions } from 'minio';

const minioConfig: ClientOptions = {
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: Number(process.env.MINIO_PORT || 9000),
  useSSL: process.env.MINIO_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minio',
  secretKey: process.env.MINIO_SECRET_KEY || 'minio123',
};

export default minioConfig;
