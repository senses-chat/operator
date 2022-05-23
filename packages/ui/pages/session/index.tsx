import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useSWR, { SWRResponse } from 'swr';
import { format } from 'date-fns';

import { Table, Button } from 'antd';

import { AppLayout } from 'components/AppLayout';
import { BotNode } from 'components/BotNode';
import { url, fetcher } from 'utils/request';
import { SessionData } from 'utils/schema';

export default function IndexPage() {
  const router = useRouter();
  const { page } = router.query;
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
    {
      title: '',
      dataIndex: '',
      key: 'action',
      render: (_, record) => (
        <div>
          <Link href={`/session/${record.id}/messages`} passHref>
            <Button className="mr-2 my-1" type="primary">
              会话详情
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  function onChangePage(pagination) {
    router.push(
      `/session?page=${pagination.current}`,
      `/session?page=${pagination.current}`,
      { shallow: true },
    );
  }

  return (
    <AppLayout>
      <Head>
        <title>会话记录</title>
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
