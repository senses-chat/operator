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
  Switch,
  message,
  Select,
} from 'antd';
import { 
  CheckCircleOutlined,
  MinusCircleOutlined
} from '@ant-design/icons';

import { url, fetcher } from 'utils/request';
import { AppLayout } from 'components/AppLayout';
import { BotNode } from 'components/BotNode';
import { getCorpId } from 'utils/utils';

const Option = Select.Option;

enum RouteType {
  Rasa,
  WechatApp,
  Wxkf,
  Saga,
}

interface RouteData {
  id: number;
  sourceType: RouteType;
  sourceName: string;
  destinationType: RouteType;
  destinationName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function IndexPage() {
  const router = useRouter();
  const { page, size } = router.query;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editSourceType, setEditSourceType] = useState('');
  const [editSourceName, setEditSourceName] = useState('');
  const [editDestinationType, setEditDestinationType] = useState('');
  const [editDestinationName, setEditDestinationName] = useState('');
  const [editIsActive, setEditIsActive] = useState(false);
  const [editSourceOptions, setEditSourceOptions] = useState([]);
  const [editDestinationOptions, setEditDestinationOptions] = useState([]);
  const { data }: SWRResponse<RouteData[], Error> = useSWR(
    url(
      `/api/bot/config/route?skip=${(+page - 1) * +size || 0}&size=${
        +size || 10
      }`,
    ),
    fetcher,
  );
  const { data: countData }: SWRResponse<number, Error> = useSWR(
    url(`/api/bot/config/route/count`),
    fetcher,
  );

  const corpId = getCorpId();

  const sourceOptions = [{ label: 'Wxkf', value: 'Wxkf' }];
  const destinationOptions = [{ label: 'Rasa', value: 'Rasa' }];

  const columns = [
    {
      title: '接入账号',
      key: 'account',
      render: (_, record: RouteData) => {
        return (
          <div className="flex flex-row justify-center">
            <BotNode type={record.sourceType as unknown as string} namespaces={record.sourceName.split(':')} />
          </div>
        )
      }
    },
    {
      title: '对接bot',
      key: 'bot',
      render: (_, record: RouteData) => {
        return (
          <div className="flex flex-row justify-center">
            <BotNode type={record.destinationType as unknown as string} namespaces={record.destinationName.split(':')} />
          </div>
        )
      }
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
      ),
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
              onUpdateRoute(
                record.id,
                record.sourceType,
                record.sourceName,
                record.destinationType,
                record.destinationName,
                record.isActive,
              )
            }
          >
            更新
          </Button>
          <Popconfirm
            title="确认删除对接配置？"
            onConfirm={() => onDeleteRoute(record.id)}
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

  function onCreateRoute() {
    setEditId(null);
    setEditSourceType('');
    setEditSourceName('');
    setEditDestinationType('');
    setEditDestinationName('');
    setEditIsActive(false);
    setIsModalVisible(true);
  }

  function onUpdateRoute(
    id,
    sourceType,
    sourceName,
    destinationType,
    destinationName,
    isActive,
  ) {
    setEditId(id);
    setEditSourceType(sourceType);
    setEditSourceName(sourceName);
    setEditDestinationType(destinationType);
    setEditDestinationName(destinationName);
    setEditIsActive(isActive);
    setIsModalVisible(true);
    loadOptions(setEditSourceOptions, sourceType);
    loadOptions(setEditDestinationOptions, destinationType);
  }

  async function onDeleteRoute(id) {
    const res = await fetcher(url('/api/bot/config/route/remove'), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        id,
      }),
    });
    if (res) {
      message.success('删除配置成功');
    } else {
      message.error('删除配置失败');
    }
    mutate(
      url(
        `/api/bot/config/route?skip=${(+page - 1) * +size || 0}&size=${
          +size || 10
        }`,
      ),
    );
    mutate(url(`/api/bot/config/route/count`));
  }

  async function onConfirmRasaServer() {
    if (
      !editSourceType ||
      !editSourceName ||
      !editDestinationType ||
      !editDestinationName
    ) {
      message.error('请填写完整参数');
      return;
    }

    const res = await fetcher(
      url(`/api/bot/config/route/${editId ? 'update' : 'create'}`),
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          id: editId || undefined,
          sourceType: editSourceType || undefined,
          sourceName: editSourceName || undefined,
          destinationType: editDestinationType || undefined,
          destinationName: editDestinationName || undefined,
          isActive: editIsActive,
        }),
      },
    );
    if (res) {
      message.success(`${editId ? '更新' : '新建'}配置成功`);
      setIsModalVisible(false);
    } else {
      message.error(`${editId ? '更新' : '新建'}配置失败`);
    }
    mutate(
      url(
        `/api/bot/config/route?skip=${(+page - 1) * +size || 0}&size=${
          +size || 10
        }`,
      ),
    );
    mutate(url(`/api/bot/config/route/count`));
  }

  async function loadOptions(method, type) {
    let url = '';
    switch (type) {
      case 'Wxkf':
        url = `/api/wxkf/account`;
        break;
      case 'Rasa':
        url = '/api/bot/config/rasa-server?skip=0&size=9999';
        break;
    }
    if (!url) {
      message.error('非法类型');
      return;
    }

    const res = await fetcher(url);
    if (res) {
      method(res);
    }
  }

  function onChangePage(pagination) {
    router.push(
      `/route?page=${pagination.current}&size=${pagination.pageSize}`,
      `/route?page=${pagination.current}&size=${pagination.pageSize}`,
      { shallow: true },
    );
  }

  return (
    <AppLayout>
      <Head>
        <title>对接管理</title>
      </Head>

      <div className="flex flex-row justify-end mb-2">
        <Button type="primary" onClick={onCreateRoute}>
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
        title={`${editId ? '更新' : '新建'}配置`}
        visible={isModalVisible}
        onOk={onConfirmRasaServer}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form>
          <Form.Item label="来源类型">
            <Select
              value={editSourceType}
              onChange={(value) => {
                setEditSourceType(value),
                  loadOptions(setEditSourceOptions, value);
              }}
            >
              {sourceOptions.map((option) => (
                <Option value={option.value} key={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="来源">
            <Select
              value={editSourceName}
              onChange={(value) => setEditSourceName(value)}
            >
              {editSourceOptions.map((option) => (
                <Option
                  value={`${corpId}:${option.open_kfid}`}
                  key={option.open_kfid}
                >
                  {option.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="目标类型">
            <Select
              value={editDestinationType}
              onChange={(value) => {
                setEditDestinationType(value),
                  loadOptions(setEditDestinationOptions, value);
              }}
            >
              {destinationOptions.map((option) => (
                <Option value={option.value} key={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="目标">
            <Select
              value={editDestinationName}
              onChange={(value) => setEditDestinationName(value)}
            >
              {editDestinationOptions.map((option) => (
                <Option value={option.name} key={option.id}>
                  {option.name}
                </Option>
              ))}
            </Select>
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
