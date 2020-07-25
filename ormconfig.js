module.exports = {
  retryAttempts: 10,
  type: process.env.TYPEORM_CONNECTION || 'postgres',
  host: process.env.TYPEORM_HOST || 'localhost',
  port: Number(process.env.TYPEORM_PORT || 5432),
  username: process.env.TYPEORM_USERNAME || 'chatop',
  password: process.env.TYPEORM_PASSWORD || 'chatOperator',
  database: process.env.TYPEORM_DATABASE || 'chat-operator',
  logging: Boolean(process.env.TYPEORM_LOGGING || true),
  entities: [
    path.resolve(
      __dirname,
      '..',
      process.env.TYPEORM_ENTITIES || '**/*.entity{.ts,.js}',
    ),
  ],
  synchronize: Boolean(process.env.TYPEORM_SYNCHRONIZE || true),
  migrationsTableName: 'migrations',
  migrations: [
    path.resolve(
      __dirname,
      '..',
      process.env.TYPEORM_MIGRATIONS || 'migrations/*{.ts,.js}',
    ),
  ],
};
