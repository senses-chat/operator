import path from 'path';

import config from '../../ormconfig.js';

export default Object.assign(config, {
  entities: [path.resolve(__dirname, '..', '**/*.entity{.ts,.js}')],
  migrations: [path.resolve(__dirname, '..', 'migrations/*{.ts,.js}')],
});
