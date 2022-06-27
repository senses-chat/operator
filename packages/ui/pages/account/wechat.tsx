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
  Form,
  message,
  Input,
} from 'antd';

import { url, fetcher } from 'utils/request';
import { AppLayout } from 'components/AppLayout';
import { WechatAppData } from 'utils/schema';


export default function IndexPage() {
  const router = useRouter();
  const { page, size } = router.query;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAppId, setEditAppId] = useState('');
  const [editAppSecret, setEditAppSecret] = useState('');
  const [editToken, setEditToken] = useState('');
  const [editAesKey, setEditAesKey] = useState('');
  const { data }: SWRResponse<WechatAppData[], Error> = useSWR(
    url(
      `/api/account/wechat?skip=${(+page - 1) * +size || 0}&size=${
        +size || 10
      }`,
    ),
    fetcher,
  );
  const { data: countData }: SWRResponse<number, Error> = useSWR(
    url(`/api/account/wechat/count`),
    fetcher,
  );

  const columns = [
    {
      title: '名字',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'App ID',
      dataIndex: 'appId',
      key: 'appId',
    },
    {
      title: 'token',
      dataIndex: 'token',
      key: 'token',
    },
    {
      title: 'aesKey',
      dataIndex: 'aesKey',
      key: 'aesKey',
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
            onClick={() => onUpdateAccount(record)}
          >
            更新
          </Button>
          <Popconfirm
            title="确认删除该账号？"
            onConfirm={() => onDeleteAccount(record.id)}
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
    setEditAppId('');
    setEditAppSecret('');
    setEditToken('');
    setEditAesKey('');
    setIsModalVisible(true);
  }

  function onUpdateAccount(wechat: WechatAppData) {
    setEditId(wechat.id);
    setEditName(wechat.name);
    setEditAppId(wechat.appId);
    setEditAppSecret(wechat.appSecret);
    setEditToken(wechat.token);
    setEditAesKey(wechat.aesKey);
    setIsModalVisible(true);
  }

  async function onDeleteAccount(id) {
    const res = await fetcher(url('/api/account/wechat/remove'), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        id,
      }),
    });
    if (res) {
      message.success('删除账号成功');
    } else {
      message.error('删除账号失败');
    }
    mutate(
      url(
        `/api/account/wechat?skip=${(+page - 1) * +size || 0}&size=${
          +size || 10
        }`,
      ),
    );
    mutate(url(`/api/account/wechat/count`));
  }

  async function onConfirmAccount() {
    if (
      !editName ||
      !editAppId ||
      (editId ? false : !editAppSecret)
    ) {
      message.error('请填写完整参数');
      return;
    }

    const res = await fetcher(
      url(`/api/account/wechat/${editId ? 'update' : 'create'}`),
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          id: editId || undefined,
          name: editName,
          appId: editAppId,
          appSecret: editAppSecret,
          token: editToken,
          aesKey: editAesKey,
        }),
      },
    );
    if (res) {
      message.success(`${editId ? '更新' : '新建'}账号成功`);
      setIsModalVisible(false);
    } else {
      message.error(`${editId ? '更新' : '新建'}账号失败`);
    }
    mutate(
      url(
        `/api/account/wechat?skip=${(+page - 1) * +size || 0}&size=${
          +size || 10
        }`,
      ),
    );
    mutate(url(`/api/account/wechat/count`));
  }

  function onChangePage(pagination) {
    router.push(
      `/account/wechat?page=${pagination.current}&size=${pagination.pageSize}`,
      `/account/wechat?page=${pagination.current}&size=${pagination.pageSize}`,
      { shallow: true },
    );
  }

  return (
    <AppLayout>
      <Head>
        <title>微信账号管理</title>
      </Head>

      <div className="flex flex-row justify-end mb-2">
        <Button type="primary" onClick={onCreateAccount}>
          添加
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
        title={`${editId ? '更新' : '添加'}账号`}
        visible={isModalVisible}
        onOk={onConfirmAccount}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form>
          <Form.Item label="名字">
            <Input value={editName} onChange={(ev) => setEditName(ev.target.value)} />
          </Form.Item>
          <Form.Item label="App ID">
            <Input value={editAppId} onChange={(ev) => setEditAppId(ev.target.value)} />
          </Form.Item>
          <Form.Item label="App Secret">
            <Input placeholder={editId ? `不填则为不修改` : ''} value={editAppSecret} onChange={(ev) => setEditAppSecret(ev.target.value)} />
          </Form.Item>
          <Form.Item label="token">
            <Input value={editToken} onChange={(ev) => setEditToken(ev.target.value)} />
          </Form.Item>
          <Form.Item label="aesKey">
            <Input value={editAesKey} onChange={(ev) => setEditAesKey(ev.target.value)} />
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
}
