import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useSWR, { SWRResponse } from 'swr';
import { format } from 'date-fns';

import { Table, Button } from 'antd';

import { AppLayout } from '../../../components/AppLayout';
import { url, fetcher } from '../../../utils/request';

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
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      render: (source) => (
        <div>
          <p>Type: {source.type}</p>
          <p className="mb-0">Namespace:</p>
          {source.namespaces.map((namespace, index) => (
            <p className="mb-0" key={index}>
              {namespace}
            </p>
          ))}
        </div>
      ),
    },
    {
      title: 'Destination',
      dataIndex: 'destination',
      key: 'destination',
      render: (destination) => (
        <div>
          <p>Type: {destination.type}</p>
          <p className="mb-0">Namespace:</p>
          {destination.namespaces.map((namespace, index) => (
            <p className="mb-0" key={index}>
              {namespace}
            </p>
          ))}
        </div>
      ),
    },
    {
      title: 'Count',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: 'ExpiredAt',
      dataIndex: 'expiredAt',
      key: 'expiredAt',
      render: (expiredAt) => (
        <p>{expiredAt && format(new Date(expiredAt), 'yyyy-MM-dd HH:mm:ss')}</p>
      ),
    },
    {
      title: 'CreatedAt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => (
        <p>{createdAt && format(new Date(createdAt), 'yyyy-MM-dd HH:mm:ss')}</p>
      ),
    },
    {
      title: 'UpdatedAt',
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
          <Link href={`/ui/session/${record.id}/messages`} passHref>
            <Button className="mr-2" type="primary">
              Messages
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  function onChangePage(pagination) {
    router.push(
      `/ui/session?page=${pagination.current}`,
      `/ui/session?page=${pagination.current}`,
      { shallow: true },
    );
  }

  return (
    <AppLayout>
      <Head>
        <title>Session Management</title>
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
