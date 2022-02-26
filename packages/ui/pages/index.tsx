import React from 'react';
import Head from 'next/head';

import { Typography } from 'antd';

import { AppLayout } from 'components/AppLayout';

const { Title, Paragraph } = Typography;

export default function IndexPage(props: { body: string }) {
  return (
    <AppLayout>
      <Head>
        <title>先思智联开源版</title>
      </Head>
      <Title level={2}>先思智联 Senses Chat Operator</Title>
      <Paragraph>
        先思智联是开源的智能聊天机器人中间件，能够快速对接聊天机器人到不同的线上客服渠道，可以让您专注于您的业务，让您的客服系统更加智能。
      </Paragraph>
      <Paragraph>
        我们将在首页添加常用的仪表盘，如果对仪表数据显示方面有任何建议，欢迎联系我们！
      </Paragraph>
    </AppLayout>
  );
}
