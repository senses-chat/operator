import React from 'react';
import Head from 'next/head';

import { Typography } from 'antd';

import { AppLayout } from 'components/AppLayout';

const { Title, Paragraph } = Typography;

export default function IndexPage(props: { body: string }) {
  return (
    <AppLayout>
      <Head>
        <title>Chat Operator</title>
      </Head>
      <Title level={2}>你好!</Title>
      <Paragraph>
        这是一个用于连接不同对话机器人系统的中间模块。
      </Paragraph>
    </AppLayout>
  );
}
