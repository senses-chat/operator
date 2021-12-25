import path from 'path';

export default Object.assign(
  {
    retryAttempts: 10,
    type: process.env.TYPEORM_CONNECTION || 'postgres',
    host: process.env.TYPEORM_HOST || 'localhost',
    port: Number(process.env.TYPEORM_PORT || 5433),
    username: process.env.TYPEORM_USERNAME || 'chatop',
    password: process.env.TYPEORM_PASSWORD || 'chatOperator',
    database: process.env.TYPEORM_DATABASE || 'chat-operator',
    logging: Boolean(process.env.TYPEORM_LOGGING || true),
    synchronize: Boolean(process.env.TYPEORM_SYNCHRONIZE || true),
    migrationsTableName: 'migrations',
    seeds: ['src/seeds/*{.ts,.js}'],
  },
  {
    entities: [path.resolve(__dirname, '..', '**/*.entity{.ts,.js}')],
    migrations: [path.resolve(__dirname, '..', 'migrations/*{.ts,.js}')],
  },
);
