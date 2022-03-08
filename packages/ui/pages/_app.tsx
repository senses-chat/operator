import 'tailwindcss/tailwind.css';
import 'antd/dist/antd.css';
import 'reflect-metadata';

import React from 'react';
import { AppProps } from 'next/app';
import { SessionProvider, getSession } from "next-auth/react";

import 'components/global.css';

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export async function getServerSideProps(ctx) {
  return {
    props: {
      session: await getSession(ctx)
    }
  }
}