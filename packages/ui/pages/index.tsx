import React from 'react';
import Head from 'next/head';
import useSWR, { SWRResponse } from 'swr';
import { format } from 'date-fns';

import { Typography, Row, Col, Statistic, Card, Tag, Table } from 'antd';
import { UserOutlined, RobotOutlined, CustomerServiceOutlined, ProfileOutlined } from '@ant-design/icons';

import { AppLayout } from 'components/AppLayout';
import { BotNode } from 'components/BotNode';
import { url, fetcher } from 'utils/request';
import { SessionData } from 'utils/schema';

const { Title, Paragraph } = Typography;

export default function IndexPage(props: { body: string }) {
  const { data: dashboardData }: SWRResponse<{
    visitor: number;
    visitorBot: number;
    visitorKf: number;
    visitorRate: number;
  }, Error> = useSWR(
    url(`/api/home/dashboard`),
    fetcher,
  );
  const { data }: SWRResponse<SessionData[], Error> = useSWR(
    url(`/api/history/sessions`),
    fetcher,
  );

  const columns = [
    {
      title: '客户',
      key: 'client',
      render: (_, record: SessionData) => {
        return (
          <div className="flex flex-row justify-center">
            {
              record.source.type === 'Wxkf' && (
                <>
                  <BotNode type='WxCustomer' namespaces={record.source.namespaces} />
                </>
              )
            }
          </div>
        )
      }
    },
    {
      title: '接入渠道',
      key: 'upstream',
      render: (_, record: SessionData) => {
        return (
          <div className="flex flex-row justify-center">
            <BotNode type={record.source.type} namespaces={record.source.namespaces} />
          </div>
        )
      }
    },
    {
      title: '对接bot',
      key: 'bot',
      render: (_, record: SessionData) => {
        return (
          <div className="flex flex-row justify-center">
            <BotNode type={record.destination.type} namespaces={record.destination.namespaces} />
          </div>
        )
      }
    },
    {
      title: '消息数',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: '会话起始时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => (
        <p>{createdAt && format(new Date(createdAt), 'yyyy-MM-dd HH:mm:ss')}</p>
      ),
    },
    {
      title: '最后更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (updatedAt) => (
        <p>{updatedAt && format(new Date(updatedAt), 'yyyy-MM-dd HH:mm:ss')}</p>
      ),
    },
  ];

  return (
    <AppLayout>
      <Head>
        <title>先思智联开源版</title>
      </Head>
      <Title level={2}>您好，<br />欢迎使用先思客服，Senses Chat Operator</Title>
      <Paragraph className='text-gray-500'>
        先思智联是开源的智能聊天机器人中间件，能够快速对接聊天机器人到不同的线上客服渠道，可以让您专注于您的业务，让您的客服系统更加智能。我们将在首页添加常用的仪表盘，如果对仪表数据显示方面有任何建议，欢迎联系我们！
      </Paragraph>
      <Row gutter={24}>
        <Col span={8}>
          <Card>
            <Statistic title={<span className='flex items-center'><UserOutlined className='mr-1' />今日访客</span>} valueStyle={{ fontSize: '40px', textAlign: 'center' }} value={dashboardData?.visitor} />
            <Card.Meta
              className='text-right'
              description={<Tag color={dashboardData?.visitorRate >= 0 ? 'success' : 'error'}>{`${dashboardData?.visitorRate > 0 ? '+' : ''}${dashboardData?.visitorRate}%`}</Tag>}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title={<span className='flex items-center'><RobotOutlined className='mr-1' />智能客服接待</span>} valueStyle={{ fontSize: '40px', textAlign: 'center' }} value={dashboardData?.visitorBot} />
            <Card.Meta
              description={<p className='text-right'>{`占比：${(dashboardData?.visitorBot / dashboardData?.visitor * 100).toFixed(2)}%`}</p>}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title={<span className='flex items-center'><CustomerServiceOutlined className='mr-1' />人工接待</span>} valueStyle={{ fontSize: '40px', textAlign: 'center' }} value={dashboardData?.visitorKf} />
            <Card.Meta
              description={<p className='text-right'>{`占比：${(dashboardData?.visitorKf / dashboardData?.visitor * 100).toFixed(2)}%`}</p>}
            />
          </Card>
        </Col>
      </Row>

      <Title level={5} className="flex items-center mt-2 text-gray-500"><ProfileOutlined className='mr-1' />最新会话</Title>
      <Table
        dataSource={
          (data &&
            data.slice(0, 10) ||
          [])
        }
        columns={columns}
        rowKey="id"
        pagination={false}
      />
    </AppLayout>
  );
}
