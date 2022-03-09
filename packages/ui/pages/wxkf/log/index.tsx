import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useSWR, { SWRResponse } from 'swr';
import { format } from 'date-fns';

import { Table, Button } from 'antd';
import { SwapOutlined } from '@ant-design/icons';

import { AppLayout } from 'components/AppLayout';
import { BotNode } from 'components/BotNode';
import { url, fetcher } from 'utils/request';

interface LogData {
  aggregateType: string;
  aggregateId: string;
  createdAt: string;
  updatedAt: string;
  count: number;
}

export default function IndexPage() {
  const router = useRouter();
  const { page } = router.query;
  const { data }: SWRResponse<LogData[], Error> = useSWR(
    url(`/api/history/wxkf_msg_logs`),
    fetcher,
  );

  const columns = [
    {
      title: '信息流向',
      key: 'flow',
      render: (_, record: LogData) => {
        const namespaces = record.aggregateId.split(':');
        return (
          <div className="flex flex-row justify-center">
            <BotNode type='Wxkf' namespaces={namespaces} />
            <SwapOutlined className="flex justify-center items-center mx-2 w-4 " />
            <BotNode type='WxCustomer' namespaces={namespaces} />
          </div>
        )
      }
    },
    {
      title: '消息数量',
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
    {
      title: '',
      dataIndex: '',
      key: 'action',
      render: (_, record) => (
        <div>
          <Link href={`/wxkf/log/${record.aggregateId}/messages`} passHref>
            <Button className="mr-2 my-1" type="primary">
              消息
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  function onChangePage(pagination) {
    router.push(
      `/wxkf/log?page=${pagination.current}`,
      `/wxkf/log?page=${pagination.current}`,
      { shallow: true },
    );
  }

  return (
    <AppLayout>
      <Head>
        <title>微信日志管理</title>
      </Head>

      <Table
        dataSource={
          (data &&
            data.slice(
              ((+page || 1) - 1) * 10,
              ((+page || 1) - 1) * 10 + 10,
            )) ||
          []
        }
        columns={columns}
        rowKey="id"
        onChange={onChangePage}
        pagination={{
          pageSize: 10,
          current: +page || 1,
          total: data?.length || 0,
        }}
      />
    </AppLayout>
  );
}
