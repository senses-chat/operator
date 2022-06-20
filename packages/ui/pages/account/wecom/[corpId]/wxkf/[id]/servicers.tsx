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
  Select,
  message,
} from 'antd';

import { url, fetcher } from 'utils/request';
import { AppLayout } from 'components/AppLayout';
import { WxkfDepartment, WxkfUser } from 'utils/schema';

const Option = Select.Option;

interface Account {
  openKfId: string;
  scene: string;
  scene_param: JSON;
  url: string;
}

export default function AccountServicersPage() {
  const router = useRouter();
  const { id: accountId, name: accountName, page, corpId } = router.query;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editDepartment, setEditDepartment] = useState(null);
  const [editUserId, setEditUserId] = useState(null);
  const { data }: SWRResponse<Account[], Error> = useSWR(
    url(`/api/wxkf/servicer?open_kfid=${accountId}&corpId=${corpId}`),
    fetcher,
  );
  const { data: dataDepartment }: SWRResponse<WxkfDepartment[], Error> = useSWR(
    url(`/api/wxkf/department?corpId=${corpId}`),
    fetcher,
  );
  const { data: dataUser }: SWRResponse<WxkfUser[], Error> = useSWR(
    editDepartment ? url(`/api/wxkf/department/user?departmentId=${editDepartment}&corpId=${corpId}`) : null,
    fetcher,
  );

  const columns = [
    {
      title: '用户 ID',
      dataIndex: 'userid',
      key: 'userid',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => status === 0 ? '接待中' : status === 1 ? '停止接待' : '未知',
    },
    {
      title: '',
      dataIndex: '',
      key: 'action',
      render: (_, record) => (
        <div>
          <Popconfirm
            title="确认移除这个接待人员？"
            onConfirm={() => onDeleteServicer(record.userid)}
            okText="确认"
            cancelText="取消"
          >
            <Button className="mr-2 my-1" type="link" danger>
              移除
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  function onAddServicer() {
    setIsModalVisible(true);
    setEditDepartment(null);
    setEditUserId(null);
  }

  async function onConfirmServicer() {
    if (!editUserId) {
      message.error('请选择接待人员');
      return;
    }

    const res = await fetcher(url('/api/wxkf/servicer/add'), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        open_kfid: accountId,
        userId: editUserId,
        corpId,
      }),
    });
    if (res) {
      message.success('添加接待人员成功');
      setIsModalVisible(false);
    } else {
      message.error('添加接待人员失败');
    }
    mutate(url(`/api/wxkf/servicer?open_kfid=${accountId}&corpId=${corpId}`));
  }

  async function onDeleteServicer(id) {
    const res = await fetcher(url('/api/wxkf/servicer/remove'), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        open_kfid: accountId,
        userId: id,
        corpId
      }),
    });
    if (res) {
      message.success('移除接待人员成功');
    } else {
      message.error('移除接待人员失败');
    }
    mutate(url(`/api/wxkf/servicer?open_kfid=${accountId}&corpId=${corpId}`));
  }

  function onChangePage(pagination) {
    router.push(
      `/account/wecom/${corpId}/wxkf/${accountId}/servicers?name=${accountName}&page=${pagination.current}`,
      `/account/wecom/${corpId}/wxkf/${accountId}/servicers?name=${accountName}&page=${pagination.current}`,
      { shallow: true },
    );
  }

  return (
    <AppLayout>
      <Head>
        <title>微信客服接待人员管理</title>
      </Head>

      <div className="flex flex-row justify-between items-center mb-2">
        <p>名称: {accountName}</p>
        <Button type="primary" onClick={onAddServicer}>
          添加
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
        rowKey="userid"
        onChange={onChangePage}
        pagination={{
          pageSize: 10,
          current: +page || 1,
          total: data?.length || 0,
        }}
      />

      <Modal
        title={`添加接待人员`}
        visible={isModalVisible}
        onOk={onConfirmServicer}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form layout="vertical">
          <Form.Item label="部门">
            <Select
              value={editDepartment}
              onChange={(value) => setEditDepartment(value)}
            >
              {(dataDepartment || []).map((option) => (
                <Option value={option.id} key={option.id}>
                  {option.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="接待人员">
            <Select
              value={editUserId}
              onChange={(value) => setEditUserId(value)}
            >
              {(dataUser || []).map((option) => (
                <Option value={option.userid} key={option.userid}>
                  {option.name || option.userid}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
}
