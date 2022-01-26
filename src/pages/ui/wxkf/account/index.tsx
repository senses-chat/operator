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

import { url, fetcher } from '../../../../utils/request';
import { AppLayout } from '../../../../components/AppLayout';

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
      title: 'Avatar',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (url: string) => <Image src={url} width={50} height={50} />,
    },
    {
      title: 'Name',
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
              Links
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
            title="Are you sure to delete this account?"
            onConfirm={() => onDeleteAccount(record.open_kfid)}
            okText="Yes"
            cancelText="No"
          >
            <Button className="mr-2" type="primary" danger>
              Delete
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
      message.success('Delete account successful');
    } else {
      message.error('Delete account failed');
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
      message.error('Missing Name');
      return;
    }

    if (isLoading) {
      message.error('Uploading avatar');
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
      message.success(`${editId ? 'Update' : 'Create'} account successful`);
      setIsModalVisible(false);
    } else {
      message.error(`${editId ? 'Update' : 'Create'} account failed`);
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
        <title>WXKF Account Management</title>
      </Head>

      <div className="flex flex-row justify-end mb-2">
        <Button type="primary" onClick={onCreateAccount}>
          Create
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
        title={`${editId ? 'Update' : 'Create'} Account`}
        visible={isModalVisible}
        onOk={onConfirmAccount}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form>
          <Form.Item label="Name">
            <Input
              placeholder="Name"
              value={editName}
              onChange={(ev) => setEditName(ev.target.value)}
            />
          </Form.Item>
          <Form.Item label="Avatar">
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
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
            <p className="text-red-400">
              If you don&apos;t upload avatar, it will use default avatar
            </p>
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
}
