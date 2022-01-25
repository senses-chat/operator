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

import { url, fetcher } from '../../../utils/request';
import { AppLayout } from '../../../components/AppLayout';
import { getCorpId } from '../../../utils/utils';

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
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Source Type',
      dataIndex: 'sourceType',
      key: 'sourceType',
    },
    {
      title: 'Source Name',
      dataIndex: 'sourceName',
      key: 'sourceName',
    },
    {
      title: 'Destination Type',
      dataIndex: 'destinationType',
      key: 'destinationType',
    },
    {
      title: 'Destination Name',
      dataIndex: 'destinationName',
      key: 'destinationName',
    },
    {
      title: 'isActive',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (isActive ? 'Yes' : 'No'),
    },
    {
      title: 'createdAt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <p className="mb-0">{format(new Date(date), 'yyyy-MM-dd HH:mm:ss')}</p>
      ),
    },
    {
      title: 'updatedAt',
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
            Update
          </Button>
          <Popconfirm
            title="Are you sure to delete this route?"
            onConfirm={() => onDeleteRoute(record.id)}
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
      message.success('Delete route successful');
    } else {
      message.error('Delete route failed');
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
      message.error('Missing Param');
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
      message.success(`${editId ? 'Update' : 'Create'} route successful`);
      setIsModalVisible(false);
    } else {
      message.error(`${editId ? 'Update' : 'Create'} route failed`);
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
      message.error('Invalid type');
      return;
    }

    const res = await fetcher(url);
    if (res) {
      method(res);
    }
  }

  function onChangePage(pagination) {
    router.push(
      `/ui/route?page=${pagination.current}&size=${pagination.pageSize}`,
      `/ui/route?page=${pagination.current}&size=${pagination.pageSize}`,
      { shallow: true },
    );
  }

  return (
    <AppLayout>
      <Head>
        <title>Route Management</title>
      </Head>

      <div className="flex flex-row justify-end mb-2">
        <Button type="primary" onClick={onCreateRoute}>
          Create
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
        title={`${editId ? 'Update' : 'Create'} Route`}
        visible={isModalVisible}
        onOk={onConfirmRasaServer}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form>
          <Form.Item label="Source Type">
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
          <Form.Item label="Source">
            <Select
              value={editSourceName}
              onChange={(value) => setEditSourceName(value)}
            >
              {editSourceOptions.map((option) => (
                <Option
                  value={`${corpId}:${option.open_kfid}`}
                  key={option.open_kfid}
                >
                  {option.open_kfid}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Destination Type">
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
          <Form.Item label="Destination">
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
          <Form.Item label="Is Active">
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
