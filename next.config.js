/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  useFileSystemPublicRoutes: false,
  typescript: {
    tsconfigPath: './tsconfig.nextjs.json',
  },
};
