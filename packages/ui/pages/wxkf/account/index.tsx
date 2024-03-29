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
import { WxkfAccount } from 'utils/schema';

import DefaultAvatarImg from '../../../public/default_avatar.png';

export default function IndexPage() {
  const router = useRouter();
  const { page } = router.query;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editMediaId, setEditMediaId] = useState(null);
  const [editAvatarLink, setEditAvatarLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarS3Key, setAvatarS3Key] = useState('');
  const [avatarS3Link, setAvatarS3Link] = useState('');
  const { data }: SWRResponse<WxkfAccount[], Error> = useSWR(
    url(`/api/wxkf/account`),
    fetcher,
  );

  const columns = [
    {
      title: '客服账号头像',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (url: string) => <Image src={url} width={50} height={50} />,
    },
    {
      title: '客服账号名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '',
      dataIndex: '',
      key: 'action',
      render: (_, record) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Link
            href={`/wxkf/account/${record.open_kfid}/links?name=${record.name}`}
            passHref
          >
            <Button className="mr-2 my-1" type="primary">
              客服接入链接管理
            </Button>
          </Link>
          <Link
            href={`/wxkf/account/${record.open_kfid}/servicers?name=${record.name}`}
            passHref
          >
            <Button className="mr-2 my-1" type="primary">
              接待人员管理
            </Button>
          </Link>
          <Button
            className="mr-2"
            type="primary"
            onClick={() =>
              onUpdateAccount(record.open_kfid, record.name, record.avatar)
            }
          >
            更新
          </Button>
          <Popconfirm
            title="确认删除这个客服账户？"
            onConfirm={() => onDeleteAccount(record.open_kfid)}
            okText="确认"
            cancelText="取消"
          >
            <Button className="mr-2 my-1" type="primary" danger>
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
    onBeforeUploadAvatar();
  }

  function onUpdateAccount(id, name, avatar) {
    setEditId(id);
    setEditName(name);
    setEditMediaId(null);
    setEditAvatarLink(avatar);
    setIsModalVisible(true);
    onBeforeUploadAvatar();
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
      message.error('请填入客服账号名');
      return;
    }

    if (isLoading) {
      message.error('上传头像中，请稍后');
      return;
    }

    let mediaId = undefined;
    if (!editMediaId) {
      const res = await fetcher(DefaultAvatarImg.src, {
        method: 'GET',
      }, async (res) => {
        const buffer = await res.arrayBuffer();
        return new File([buffer], 'default_avatar.png', { type: 'image/png' });
      });
      if (!res) {
        message.error('上传默认头像失败');
        return;
      }

      mediaId = await onUploadAvatar({
        file: res,
        action: avatarS3Link,
      });

      setEditMediaId(mediaId);
      setEditAvatarLink(DefaultAvatarImg.src);
      if (!mediaId) {
        message.error('上传默认头像失败');
        return;
      }
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
          mediaId: editMediaId || mediaId,
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

  async function onBeforeUploadAvatar() {
    const res = await fetcher(url(`/api/wxkf/account/avatar`), {
      method: 'GET',
    });
    if (res) {
      setAvatarS3Key(res.s3);
      setAvatarS3Link(res.link);
      return res.link;
    } else {
      message.error(`获取头像上传链接失败`);
      return null;
    }
  }

  async function onUploadAvatar({ onError, onSuccess, file, action }: any) {
    const resUpload = await fetcher(
      action,
      {
        method: 'PUT',
        body: file,
      },
      (res) => {
        if (res.status === 200) {
          return true;
        }
        return false;
      },
    );
    if (resUpload) {
      const res = await fetcher(
        url(`/api/wxkf/account/avatar`),
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            avatar: avatarS3Key,
          }),
        },
        async (res) => {
          return await res.text();
        },
      );

      if (res) {
        onSuccess && await onSuccess(res);
        return res;
      }
    }

    onError && await onError();
    return null
  }

  function onChangePage(pagination) {
    router.push(
      `/wxkf/account?page=${pagination.current}`,
      `/wxkf/account?page=${pagination.current}`,
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
          新建客服账号
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
          <Form.Item label="客服账号名">
            <Input
              placeholder="客服账号名"
              value={editName}
              onChange={(ev) => setEditName(ev.target.value)}
            />
          </Form.Item>
          <Form.Item label="头像">
            <Upload
              listType="picture-card"
              showUploadList={false}
              action={onBeforeUploadAvatar}
              onChange={onAvatarChange}
              customRequest={onUploadAvatar}
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
            <p className="text-red-400">如果没有上传头像，将会使用默认头像</p>
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
}
