import { registerAs } from '@nestjs/config';

// TODO: add env vars
const host = 'localhost';
const port = 2376;
const version = 'v1.40';

export default registerAs('docker', () => ({
  proxyEndpoint: `http://${host}:${port}/${version}`,
  config: {
    host,
    port,
    version,
  },
}));
