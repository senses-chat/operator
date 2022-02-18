import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useSWR, { SWRResponse, mutate } from 'swr';

import {
  Popconfirm,
  Table,
  Button,
  Modal,
  Input,
  Form,
  Upload,
  Avatar,
  message,
  Image,
} from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';

import { url, fetcher } from 'utils/request';
import { AppLayout } from 'components/AppLayout';

interface Account {
  open_kfid: string;
  name: string;
  avatar: string;
}

export default function IndexPage() {
  const router = useRouter();
  const { page } = router.query;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editMediaId, setEditMediaId] = useState(null);
  const [editAvatarLink, setEditAvatarLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { data }: SWRResponse<Account[], Error> = useSWR(
    url(`/api/wxkf/account`),
    fetcher,
  );

  const columns = [
    {
      title: 'ID',
      dataIndex: 'open_kfid',
      key: 'open_kfid',
    },
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (url: string) => <Image src={url} width={50} height={50} />,
    },
    {
      title: '名字',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '',
      dataIndex: '',
      key: 'action',
      render: (_, record) => (
        <div>
          <Link
            href={`/ui/wxkf/account/${record.open_kfid}/links?name=${record.name}`}
            passHref
          >
            <Button className="mr-2" type="primary">
              链接管理
            </Button>
          </Link>
          <Button
            className="mr-2"
            type="primary"
            onClick={() =>
              onUpdateAccount(record.open_kfid, record.name, record.avatar)
            }
          >
            Update
          </Button>
          <Popconfirm
            title="确认删除这个账户？"
            onConfirm={() => onDeleteAccount(record.open_kfid)}
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
    setEditMediaId(null);
    setEditAvatarLink('');
    setIsModalVisible(true);
  }

  function onUpdateAccount(id, name, avatar) {
    setEditId(id);
    setEditName(name);
    setEditMediaId(null);
    setEditAvatarLink(avatar);
    setIsModalVisible(true);
  }

  async function onDeleteAccount(id) {
    const res = await fetcher(url('/api/wxkf/account/delete'), {
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
    mutate(url(`/api/wxkf/account`));
  }

  function onAvatarChange(info) {
    if (info.file.status === 'uploading') {
      setIsLoading(true);
    }
    if (info.file.status === 'done') {
      const reader = new FileReader();
      reader.readAsDataURL(info.file.originFileObj);
      reader.onloadend = function () {
        setEditAvatarLink(reader.result as string);
        setEditMediaId(info.file.response);
        setIsLoading(false);
      };
    }
  }

  async function onConfirmAccount() {
    if (!editName) {
      message.error('缺少名字');
      return;
    }

    if (isLoading) {
      message.error('上传头像中，请稍后');
      return;
    }

    const res = await fetcher(
      url(`/api/wxkf/account/${editId ? 'update' : 'add'}`),
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          id: editId || undefined,
          name: editName || undefined,
          mediaId: editMediaId || undefined,
        }),
      },
    );
    if (res) {
      message.success(`${editId ? '更新' : '新建'}账号成功`);
      setIsModalVisible(false);
    } else {
      message.error(`${editId ? '更新' : '新建'}账号失败`);
    }
    mutate(url(`/api/wxkf/account`));
  }

  function onChangePage(pagination) {
    router.push(
      `/ui/wxkf/account?page=${pagination.current}`,
      `/ui/wxkf/account?page=${pagination.current}`,
      { shallow: true },
    );
  }

  return (
    <AppLayout>
      <Head>
        <title>微信客服账号管理</title>
      </Head>

      <div className="flex flex-row justify-end mb-2">
        <Button type="primary" onClick={onCreateAccount}>
          新建
        </Button>
      </div>

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
        rowKey="open_kfid"
        onChange={onChangePage}
        pagination={{
          pageSize: 10,
          current: +page || 1,
          total: data?.length || 0,
        }}
      />

      <Modal
        title={`${editId ? '更新' : '新建'}账号`}
        okText="确定"
        cancelText="取消"
        visible={isModalVisible}
        onOk={onConfirmAccount}
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
          <Form.Item label="头像">
            <Upload
              name="avatar"
              listType="picture-card"
              showUploadList={false}
              action={url('/api/wxkf/account/avatar')}
              onChange={onAvatarChange}
            >
              {editAvatarLink ? (
                <Avatar shape="square" size={64} src={editAvatarLink} />
              ) : (
                <div>
                  {isLoading ? <LoadingOutlined /> : <PlusOutlined />}
                  <div style={{ marginTop: 8 }}>上传</div>
                </div>
              )}
            </Upload>
            <p className="text-red-400">
              如果没有上传头像，将会使用默认头像
            </p>
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
}
