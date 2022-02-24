import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR, { SWRResponse, mutate } from 'swr';

import {
  Popconfirm,
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Tooltip,
} from 'antd';
import { CopyOutlined, QrcodeOutlined } from '@ant-design/icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import qs from 'query-string';
import QRCode from 'qrcode.react';

import { url, fetcher } from 'utils/request';
import { AppLayout } from 'components/AppLayout';

interface Account {
  openKfId: string;
  scene: string;
  scene_param: JSON;
  url: string;
}

export default function AccountLinksPage() {
  const router = useRouter();
  const { id: accountId, name: accountName, page } = router.query;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editScene, setEditScene] = useState('');
  const [editSceneParam, setEditSceneParam] = useState([]);
  const [isModalVisibleParam, setIsModalVisibleParam] = useState(false);
  const [editUpdateKey, setEditUpdateKey] = useState('');
  const [editKey, setEditKey] = useState('');
  const [editValue, setEditValue] = useState('');
  const { data }: SWRResponse<Account[], Error> = useSWR(
    url(`/api/wxkf/account/link?id=${accountId}`),
    fetcher,
  );

  const columns = [
    {
      title: '场景',
      dataIndex: 'scene',
      key: 'scene',
    },
    {
      title: '场景参数',
      dataIndex: 'scene_param',
      key: 'scene_param',
      render: (sceneParam: JSON) => qs.stringify(sceneParam),
    },
    {
      title: '链接',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => (
        <div>
          <p className="mb-1">{url}</p>
          <CopyToClipboard text={url} onCopy={() => message.success('复制成功')}>
            <Tooltip title={'复制'}>
              <CopyOutlined className="mr-2 text-sky-500 hover:scale-110" />
            </Tooltip>
          </CopyToClipboard>
          <Tooltip title={<QRCode value={url} />}>
            <QrcodeOutlined className="mr-2 text-sky-500 hover:scale-110" />
          </Tooltip>
        </div>
      ),
    },
    {
      title: '',
      dataIndex: '',
      key: 'action',
      render: (_, record) => (
        <div>
          <Popconfirm
            title="确认删除这个链接？"
            onConfirm={() => onDeleteLink(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button className="mr-2" type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const columnsSceneParam = [
    {
      title: 'Key 值',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: 'Value 值',
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: '',
      dataIndex: '',
      key: 'action',
      render: (_, record) => (
        <div>
          <Button
            onClick={() => onUpdateSceneParam(record.key)}
            className="mr-2"
            type="link"
          >
            更新
          </Button>
          <Popconfirm
            title="确认删除这个参数？"
            onConfirm={() => onDeleteParam(record.key)}
            okText="确认"
            cancelText="取消"
          >
            <Button className="mr-2" type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  function onCreateAccountLink() {
    setIsModalVisible(true);
    setEditId(null);
    setEditScene('');
    setEditSceneParam([]);
  }

  function onAddSceneParam() {
    setIsModalVisibleParam(true);
    setEditUpdateKey('');
    setEditKey('');
    setEditValue('');
  }

  function onUpdateSceneParam(key: string) {
    setIsModalVisibleParam(true);
    setEditUpdateKey(key);
    setEditKey(key);
    setEditValue(editSceneParam.find((item) => item.key === key).value);
  }

  function onConfirmSceneParam() {
    const temp = [...editSceneParam];
    if (editUpdateKey) {
      temp.splice(
        temp.findIndex((item) => item.key === editUpdateKey),
        1,
      );
    }

    if (temp.find((item) => item.key === editKey)) {
      message.error('Key 值已经存在');
      return;
    }

    setEditSceneParam([...temp, { key: editKey, value: editValue }]);
    setIsModalVisibleParam(false);
  }

  function onDeleteParam(key: string) {
    const temp = [...editSceneParam];
    temp.splice(
      temp.findIndex((item) => item.key === key),
      1,
    );
    setEditSceneParam([...temp]);
  }

  async function onConfirmLink() {
    const res = await fetcher(url('/api/wxkf/account/link/add'), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        id: accountId,
        scene: editScene,
        sceneParam: editSceneParam.reduce(
          (prev, curr) => ({ ...prev, [curr.key]: curr.value }),
          {},
        ),
      }),
    });
    if (res) {
      message.success('新建账号链接成功');
      setIsModalVisible(false);
    } else {
      message.error('新建账号链接失败');
    }
    mutate(url(`/api/wxkf/account/link?id=${accountId}`));
  }

  async function onDeleteLink(id) {
    const res = await fetcher(url('/api/wxkf/account/link/delete'), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        id,
      }),
    });
    if (res) {
      message.success('删除账号链接成功');
    } else {
      message.error('删除账号链接失败');
    }
    mutate(url(`/api/wxkf/account/link?id=${accountId}`));
  }

  function onChangePage(pagination) {
    router.push(
      `/wxkf/account/${accountId}/links?name=${accountName}&page=${pagination.current}`,
      `/wxkf/account/${accountId}/links?name=${accountName}&page=${pagination.current}`,
      { shallow: true },
    );
  }

  return (
    <AppLayout>
      <Head>
        <title>微信客服账号管理</title>
      </Head>

      <div className="flex flex-row justify-between items-center mb-2">
        <p className="mb-0">名字: {accountName}</p>
        <Button type="primary" onClick={onCreateAccountLink}>
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
        title={`${editId ? '更新' : '新建'}账号链接`}
        visible={isModalVisible}
        onOk={onConfirmLink}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form layout="vertical">
          <Form.Item label="场景">
            <Input
              placeholder="场景"
              value={editScene}
              onChange={(ev) => setEditScene(ev.target.value)}
            />
          </Form.Item>
          <Form.Item label="场景参数">
            <Table
              dataSource={editSceneParam}
              columns={columnsSceneParam}
              rowKey="key"
              pagination={false}
            />
            <Button
              onClick={onAddSceneParam}
              type="link"
              className="block w-full mt-4 text-center border border-dashed border-blue-400 hover:border-solid"
            >
              添加新参数
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="添加新参数"
        visible={isModalVisibleParam}
        onOk={onConfirmSceneParam}
        onCancel={() => setIsModalVisibleParam(false)}
      >
        <Form>
          <Form.Item label="Key 值">
            <Input
              placeholder="Key 值"
              value={editKey}
              onChange={(ev) => setEditKey(ev.target.value)}
            />
          </Form.Item>
          <Form.Item label="Value 值">
            <Input
              placeholder="Value 值"
              value={editValue}
              onChange={(ev) => setEditValue(ev.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
}
