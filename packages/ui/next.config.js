const path = require('path');

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.module.rules.push({
      test: /\.[t]sx?$/,
      loader: "ts-loader",
      include: [
        path.resolve(__dirname, "../backend/server")
      ],
      exclude: /node_modules/
    });

    return config
  },
};
