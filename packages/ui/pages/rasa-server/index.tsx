import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR, { SWRResponse, mutate } from 'swr';
import { format } from 'date-fns';

import {
  Popconfirm,
  Table,
  Button,
  Modal,
  Input,
  Form,
  Switch,
  message,
} from 'antd';

import { url, fetcher } from 'utils/request';
import { AppLayout } from 'components/AppLayout';

interface RasaServerData {
  id: number;
  name: string;
  url: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function IndexPage() {
  const router = useRouter();
  const { page, size } = router.query;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editURL, setEditURL] = useState('');
  const [editIsActive, setEditIsActive] = useState(false);
  const { data }: SWRResponse<RasaServerData[], Error> = useSWR(
    url(
      `/api/bot/config/rasa-server?skip=${(+page - 1) * +size || 0}&size=${
        +size || 10
      }`,
    ),
    fetcher,
  );
  const { data: countData }: SWRResponse<number, Error> = useSWR(
    url(`/api/bot/config/rasa-server/count`),
    fetcher,
  );

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '名字',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '链接',
      dataIndex: 'url',
      key: 'url',
    },
    {
      title: '是否激活',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (isActive ? '是' : '否'),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <p className="mb-0">{format(new Date(date), 'yyyy-MM-dd HH:mm:ss')}</p>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => (
        <p className="mb-0">{format(new Date(date), 'yyyy-MM-dd HH:mm:ss')}</p>
      ),
    },
    {
      title: '',
      dataIndex: '',
      key: 'action',
      render: (_, record) => (
        <div>
          <Button
            className="mr-2"
            type="primary"
            onClick={() =>
              onUpdateRasaServer(
                record.id,
                record.name,
                record.url,
                record.isActive,
              )
            }
          >
            更新
          </Button>
          <Popconfirm
            title="确认删除该 Rasa 服务吗？"
            onConfirm={() => onDeleteRasaServer(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button className="mr-2" type="primary" danger>
              删除
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  function onCreateAccount() {
    setEditId(null);
    setEditName('');
    setEditURL('');
    setEditIsActive(false);
    setIsModalVisible(true);
  }

  function onUpdateRasaServer(id, name, url, isActive) {
    setEditId(id);
    setEditName(name);
    setEditURL(url);
    setEditIsActive(isActive);
    setIsModalVisible(true);
  }

  async function onDeleteRasaServer(id) {
    const res = await fetcher(url('/api/bot/config/rasa-server/remove'), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        id,
      }),
    });
    if (res) {
      message.success('删除 Rasa 服务成功');
    } else {
      message.error('删除 Rasa 服务失败');
    }
    mutate(
      url(
        `/api/bot/config/rasa-server?skip=${(+page - 1) * +size || 0}&size=${
          +size || 10
        }`,
      ),
    );
    mutate(url(`/api/bot/config/rasa-server/count`));
  }

  async function onConfirmRasaServer() {
    if (!editName || !editURL) {
      message.error('请填写完整参数');
      return;
    }

    const res = await fetcher(
      url(`/api/bot/config/rasa-server/${editId ? 'update' : 'create'}`),
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          id: editId || undefined,
          name: editName || undefined,
          url: editURL || undefined,
          isActive: editIsActive,
        }),
      },
    );
    if (res) {
      message.success(`${editId ? '更新' : '新建'} Rasa 服务成功`);
      setIsModalVisible(false);
    } else {
      message.error(`${editId ? '更新' : '新建'} Rasa 服务失败`);
    }
    mutate(
      url(
        `/api/bot/config/rasa-server?skip=${(+page - 1) * +size || 0}&size=${
          +size || 10
        }`,
      ),
    );
    mutate(url(`/api/bot/config/rasa-server/count`));
  }

  function onChangePage(pagination) {
    router.push(
      `/rasa-server?page=${pagination.current}&size=${pagination.pageSize}`,
      `/rasa-server?page=${pagination.current}&size=${pagination.pageSize}`,
      { shallow: true },
    );
  }

  return (
    <AppLayout>
      <Head>
        <title>Rasa 服务管理</title>
      </Head>

      <div className="flex flex-row justify-end mb-2">
        <Button type="primary" onClick={onCreateAccount}>
          新建
        </Button>
      </div>

      <Table
        dataSource={data || []}
        columns={columns}
        rowKey="id"
        onChange={onChangePage}
        pagination={{
          pageSize: +size || 10,
          current: +page || 1,
          total: countData || 0,
        }}
      />

      <Modal
        title={`${editId ? '更新' : '新建'} Rasa 服务`}
        visible={isModalVisible}
        onOk={onConfirmRasaServer}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form>
          <Form.Item label="名字">
            <Input
              placeholder="名字"
              value={editName}
              onChange={(ev) => setEditName(ev.target.value)}
            />
          </Form.Item>
          <Form.Item label="链接">
            <Input
              placeholder="链接"
              value={editURL}
              onChange={(ev) => setEditURL(ev.target.value)}
            />
          </Form.Item>
          <Form.Item label="是否激活">
            <Switch
              checked={editIsActive}
              onChange={(value) => setEditIsActive(value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
}
