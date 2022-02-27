module.exports = (options, webpack) => {
  const lazyImports = [
    '@nestjs/microservices',
    '@nestjs/microservices/microservices-module',
    '@grpc/grpc-js',
    '@grpc/proto-loader',
    'kafkajs',
    'mqtt',
    'nats',
    'redis',
    'amqplib',
    'amqp-connection-manager',
    '@nestjs/websockets/socket-module',
    '@nestjs/platform-express',
    'fastify-static',
    'point-of-view',
  ];

  return {
    ...options,
    externals: {
      '@prisma/client': 'commonjs2 @prisma/client',
    },
    plugins: [
      ...options.plugins,
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
      new webpack.IgnorePlugin({
        checkResource(resource) {
          if (lazyImports.includes(resource)) {
            try {
              require.resolve(resource);
            } catch (err) {
              return true;
            }
          }
          return false;
        },
      }),
      new webpack.SourceMapDevToolPlugin({
        filename: '[name].js.map',
      }),
    ],
  };
};
