import 'tailwindcss/tailwind.css';
import 'antd/dist/antd.css';

import React from 'react';
import { AppProps } from 'next/app';

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
