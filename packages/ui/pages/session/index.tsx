import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useSWR, { SWRResponse } from 'swr';
import { format } from 'date-fns';

import { Table, Button } from 'antd';

import { AppLayout } from 'components/AppLayout';
import { url, fetcher } from 'utils/request';

interface SessionData {
  id: string;
  source: {
    type: string;
    namespaces: string[];
  };
  destination: {
    type: string;
    namespaces: string[];
  };
  createdAt: string;
  updatedAt: string;
  count: number;
  expiredAt: string;
}

export default function IndexPage() {
  const router = useRouter();
  const { page } = router.query;
  const { data }: SWRResponse<SessionData[], Error> = useSWR(
    url(`/api/history/sessions`),
    fetcher,
  );

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      render: (source) => (
        <div>
          <p>类型: {source.type}</p>
          <p className="mb-0">命名空间:</p>
          {source.namespaces.map((namespace, index) => (
            <p className="mb-0" key={index}>
              {namespace}
            </p>
          ))}
        </div>
      ),
    },
    {
      title: '目标',
      dataIndex: 'destination',
      key: 'destination',
      render: (destination) => (
        <div>
          <p>类型: {destination.type}</p>
          <p className="mb-0">命名空间:</p>
          {destination.namespaces.map((namespace, index) => (
            <p className="mb-0" key={index}>
              {namespace}
            </p>
          ))}
        </div>
      ),
    },
    {
      title: '消息数量',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: '过期时间',
      dataIndex: 'expiredAt',
      key: 'expiredAt',
      render: (expiredAt) => (
        <p>{expiredAt && format(new Date(expiredAt), 'yyyy-MM-dd HH:mm:ss')}</p>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => (
        <p>{createdAt && format(new Date(createdAt), 'yyyy-MM-dd HH:mm:ss')}</p>
      ),
    },
    {
      title: '更新时间',
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
            <Button className="mr-2" type="primary">
              消息
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
        <title>会话管理</title>
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
