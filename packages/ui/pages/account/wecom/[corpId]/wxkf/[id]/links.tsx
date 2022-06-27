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
} from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import QRCode from 'qrcode.react';

import { url, fetcher } from 'utils/request';
import { AppLayout } from 'components/AppLayout';

interface AccountLink {
  id: string;
  openKfId: string;
  scene: string;
  scene_param: JSON;
  url: string;
}

export default function AccountLinksPage() {
  const router = useRouter();
  const { id: accountId, name: accountName, page, corpId } = router.query;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSceneModalVisible, setIsSceneModalVisible] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editScene, setEditScene] = useState('');
  const [editSceneParam, setEditSceneParam] = useState([]);
  const [isModalVisibleParam, setIsModalVisibleParam] = useState(false);
  const [editUpdateKey, setEditUpdateKey] = useState('');
  const [editKey, setEditKey] = useState('');
  const [editValue, setEditValue] = useState('');
  const { data }: SWRResponse<AccountLink[], Error> = useSWR(
    url(`/api/wxkf/account/link?id=${accountId}&corpId=${corpId}`),
    fetcher,
  );

  const columns = [
    {
      title: '场景值',
      dataIndex: 'scene',
      key: 'scene',
    },
    {
      title: '场景参数',
      dataIndex: 'scene_param',
      key: 'scene_param',
      render: (sceneParam: JSON) => {
        return (
          Object.entries(sceneParam || {}).length > 0 ? (
            <Button type='link' onClick={() => onOpenSceneParamModal(sceneParam) }>查看参数</Button>
          ) : (
            <p style={{ marginLeft: '16px' }}>无</p>
          )
        );
      },
    },
    {
      title: '接入链接',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => (
        <CopyToClipboard text={url} onCopy={() => message.success('复制成功')}>
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#0ea5e9' }}>
            <p style={{ marginRight: '5px' }}>复制客服链接</p>
            <CopyOutlined className="mr-2 text-sky-500 hover:scale-110" />
          </div>
        </CopyToClipboard>
      ),
    },
    {
      title: '接入链接二维码',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => (
        <QRCode value={url} size={64} />
      ),
    },
    {
      title: '',
      dataIndex: '',
      key: 'action',
      render: (_, record) => (
        <div>
          <Button className="mr-2 my-1" type="link" onClick={() => onUpdateLink(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除这个链接？"
            onConfirm={() => onDeleteLink(record.id)}
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

  const columnsSceneParam = [
    {
      title: '字段',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: '值',
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

  function onUpdateLink(link: AccountLink) {
    setIsModalVisible(true);
    setEditId(link.id);
    setEditScene(link.scene);
    initSceneParam(link.scene_param);
  }

  function initSceneParam(sceneParam) {
    const scene = Object.entries((sceneParam || {})).map(([key, value]) => ({ key, value}));
    setEditSceneParam(scene);
  }

  function onOpenSceneParamModal(sceneParam) {
    initSceneParam(sceneParam);
    setIsSceneModalVisible(true);
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
      message.error('字段冲突，请检查');
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
    const res = await fetcher(url(`/api/wxkf/account/link/${editId ? 'update' : 'add'}`), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        id: editId || accountId,
        scene: editScene,
        sceneParam: editSceneParam.reduce(
          (prev, curr) => ({ ...prev, [curr.key]: curr.value }),
          {},
        ),
        corpId,
      }),
    });
    if (res) {
      message.success(`${editId ? '更新' : '新建'}接入链接成功`);
      setIsModalVisible(false);
    } else {
      message.error(`${editId ? '更新' : '新建'}接入链接失败`);
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
        corpId,
      }),
    });
    if (res) {
      message.success('删除接入链接成功');
    } else {
      message.error('删除接入链接失败');
    }
    mutate(url(`/api/wxkf/account/link?id=${accountId}&corpId=${corpId}`));
  }

  function onChangePage(pagination) {
    router.push(
      `/account/wecom/${corpId}/wxkf/${accountId}/links?name=${accountName}&page=${pagination.current}`,
      `/account/wecom/${corpId}/wxkf/${accountId}/links?name=${accountName}&page=${pagination.current}`,
      { shallow: true },
    );
  }

  return (
    <AppLayout>
      <Head>
        <title>微信客服账号接入链接管理</title>
      </Head>

      <div className="flex flex-row justify-between items-center mb-2">
        <p>名称: {accountName}</p>
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
        title={'查看场景参数'}
        visible={isSceneModalVisible}
        onOk={() => setIsSceneModalVisible(false)}
        footer={[
          <Button key="submit" type="primary" onClick={() => setIsSceneModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        <Table
          dataSource={editSceneParam}
          columns={columnsSceneParam.slice(0, 2)}
          rowKey="key"
          pagination={false}
        />
      </Modal>

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
