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
      title: 'Scene',
      dataIndex: 'scene',
      key: 'scene',
    },
    {
      title: 'Scene Param',
      dataIndex: 'scene_param',
      key: 'scene_param',
      render: (sceneParam: JSON) => qs.stringify(sceneParam),
    },
    {
      title: 'Url',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => (
        <div>
          <p className="mb-1">{url}</p>
          <CopyToClipboard text={url} onCopy={() => message.success('Copied')}>
            <Tooltip title={'Copy'}>
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
            title="Are you sure to delete this link?"
            onConfirm={() => onDeleteLink(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button className="mr-2" type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const columnsSceneParam = [
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: 'Value',
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
            Update
          </Button>
          <Popconfirm
            title="Are you sure to delete this param?"
            onConfirm={() => onDeleteParam(record.key)}
            okText="Yes"
            cancelText="No"
          >
            <Button className="mr-2" type="link" danger>
              Delete
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
      message.error('Key already exists');
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
      message.success('Create account link successful');
      setIsModalVisible(false);
    } else {
      message.error('Create account link failed');
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
      message.success('Delete account link successful');
    } else {
      message.error('Delete account link failed');
    }
    mutate(url(`/api/wxkf/account/link?id=${accountId}`));
  }

  function onChangePage(pagination) {
    router.push(
      `/ui/wxkf/account/${accountId}/links?name=${accountName}&page=${pagination.current}`,
      `/ui/wxkf/account/${accountId}/links?name=${accountName}&page=${pagination.current}`,
      { shallow: true },
    );
  }

  return (
    <AppLayout>
      <Head>
        <title>WXKF Account Management</title>
      </Head>

      <div className="flex flex-row justify-between items-center mb-2">
        <p className="mb-0">Name: {accountName}</p>
        <Button type="primary" onClick={onCreateAccountLink}>
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
        title={`${editId ? 'Update' : 'Create'} Account Link`}
        visible={isModalVisible}
        onOk={onConfirmLink}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form layout="vertical">
          <Form.Item label="Scene">
            <Input
              placeholder="Scene"
              value={editScene}
              onChange={(ev) => setEditScene(ev.target.value)}
            />
          </Form.Item>
          <Form.Item label="Scene Param">
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
              Add New Param
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add New Param"
        visible={isModalVisibleParam}
        onOk={onConfirmSceneParam}
        onCancel={() => setIsModalVisibleParam(false)}
      >
        <Form>
          <Form.Item label="Key">
            <Input
              placeholder="Key"
              value={editKey}
              onChange={(ev) => setEditKey(ev.target.value)}
            />
          </Form.Item>
          <Form.Item label="Value">
            <Input
              placeholder="Value"
              value={editValue}
              onChange={(ev) => setEditValue(ev.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
}
