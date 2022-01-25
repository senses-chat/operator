import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import useSWR, { SWRResponse } from 'swr';
import { format } from 'date-fns';

import { Table, Button } from 'antd';

import { AppLayout } from '../../../../components/AppLayout';
import { url, fetcher } from '../../../../utils/request';

interface LogData {
  aggregateType: string;
  aggregateId: string;
  createdAt: string;
  updatedAt: string;
  count: number;
}

export default function IndexPage() {
  const { data }: SWRResponse<LogData[], Error> = useSWR(
    url(`/api/history/wxkf_msg_logs`),
    fetcher,
  );

  const columns = [
    {
      title: 'ID',
      dataIndex: 'aggregateId',
      key: 'aggregateId',
    },
    {
      title: 'Type',
      dataIndex: 'aggregateType',
      key: 'aggregateType',
    },
    {
      title: 'Count',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: 'CreatedAt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => (
        <p>{format(new Date(createdAt), 'yyyy-MM-dd HH:mm:ss')}</p>
      ),
    },
    {
      title: 'UpdatedAt',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (updatedAt) => (
        <p>{format(new Date(updatedAt), 'yyyy-MM-dd HH:mm:ss')}</p>
      ),
    },
    {
      title: '',
      dataIndex: '',
      key: 'action',
      render: (_, record) => (
        <div>
          <Link href={`/ui/wxkf/log/${record.aggregateId}/messages`} passHref>
            <Button className="mr-2" type="primary">
              Messages
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      <Head>
        <title>Wxkf Log Management</title>
      </Head>

      <Table
        dataSource={data || []}
        columns={columns}
        rowKey="id"
        pagination={false}
      />
    </AppLayout>
  );
}
