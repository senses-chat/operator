import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';

import { Typography } from 'antd';

import { AppLayout } from '../../components/AppLayout';

const { Title, Paragraph } = Typography;

export default function IndexPage(props: { body: string }) {
  return (
    <AppLayout>
      <Head>
        <title>Chat Operator</title>
      </Head>
      <Title level={2}>Hello {props.body}!</Title>
      <Paragraph>This is a middleware module for connecting different chat systems.</Paragraph>
    </AppLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const response = await fetch('http://localhost:3000/');
  const body = await response.text();
  return {
    props: {
      body,
    },
  };
};
