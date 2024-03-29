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
import {
  CheckCircleOutlined,
  MinusCircleOutlined
} from '@ant-design/icons';

import { url, fetcher } from 'utils/request';
import { AppLayout } from 'components/AppLayout';

interface RasaServerData {
  id: number;
  name: string;
  url: string;
  pingUrl: string;
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
  const [editPingURL, setEditPingURL] = useState('');
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
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <div style={{ display: 'flex', alignItems: 'center', color: isActive ? '#90ee90' : '#bbbfc5' }}>
          {
            isActive ? (
              <>
                <CheckCircleOutlined />
                <span style={{ marginLeft: '3px' }}>已启用</span>
              </>
            ) : (
              <>
                <MinusCircleOutlined />
                <span style={{ marginLeft: '3px' }}>未启用</span>
              </>
            )
          }
        </div>
      )
    },
    {
      title: '平均延迟',
      key: 'latency',
      render: (_, record) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { data: latencyData } = useSWR(
          url(`/api/bot/config/rasa-server/latency?name=${record.name}`),
          fetcher,
        );
        if (latencyData) {
          return `${latencyData.toFixed(2)}ms`;
        }
        return '-';
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <p>{format(new Date(date), 'yyyy-MM-dd HH:mm:ss')}</p>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => (
        <p>{format(new Date(date), 'yyyy-MM-dd HH:mm:ss')}</p>
      ),
    },
    {
      title: '',
      dataIndex: '',
      key: 'action',
      render: (_, record) => (
        <div>
          <Button
            className="mr-2 my-1"
            type="link"
            onClick={() =>
              onUpdateRasaServer(
                record.id,
                record.name,
                record.url,
                record.pingUrl,
                record.isActive,
              )
            }
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除该 Rasa 服务吗？"
            onConfirm={() => onDeleteRasaServer(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button className="mr-2 my-1" type="link" danger>
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
    setEditPingURL('');
    setEditIsActive(false);
    setIsModalVisible(true);
  }

  function onUpdateRasaServer(id, name, url, pingUrl, isActive) {
    setEditId(id);
    setEditName(name);
    setEditURL(url);
    setEditPingURL(pingUrl);
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
    if (!editName || !editURL || !editPingURL) {
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
          pingUrl: editPingURL || undefined,
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
        <title>聊天机器人管理</title>
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
          <Form.Item label="名称">
            <Input
              placeholder="名称"
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
          <Form.Item label="测试连通性链接">
            <Input
              placeholder="测试连通性链接"
              value={editPingURL}
              onChange={(ev) => setEditPingURL(ev.target.value)}
            />
          </Form.Item>
          <Form.Item label="状态">
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
