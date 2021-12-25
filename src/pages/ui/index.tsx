import React from 'react';
import Head from 'next/head';

import { Typography } from 'antd';

import { AppLayout } from '../../components/AppLayout';

const { Title, Paragraph } = Typography;

export default function IndexPage() {
  return (
    <AppLayout>
      <Head>
        <title>Chat Operator</title>
      </Head>
      <Title level={2}>Hello!</Title>
      <Paragraph>This is a middleware module for connecting different chat systems.</Paragraph>
    </AppLayout>
  );
}
