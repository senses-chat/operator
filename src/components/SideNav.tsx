import React, { FC } from 'react';
import Link from 'next/link';
import { Layout, Menu } from 'antd';
import { HomeOutlined, CustomerServiceOutlined } from '@ant-design/icons';

const { Sider } = Layout;

interface SideNavProps {
  selected: string;
  collapsed: boolean;
  setCollapsed: (bool: boolean) => void;
}

export const SideNav: FC<SideNavProps> = ({
  selected,
  collapsed,
  setCollapsed,
}: SideNavProps) => (
  <Sider
    className="z-50"
    collapsible
    collapsed={collapsed}
    onCollapse={() => setCollapsed(!collapsed)}
    style={{
      overflow: 'auto',
      height: '100vh',
      position: 'fixed',
      left: 0,
    }}
  >
    <div className="h-8 m-4 text-white">Chat Operator</div>
    <Menu theme="dark" mode="inline" defaultSelectedKeys={[selected]}>
      <Menu.Item key="/ui" icon={<HomeOutlined />}>
        <Link href="/ui">Home</Link>
      </Menu.Item>
      <Menu.Item key="/ui/wxkf/account" icon={<CustomerServiceOutlined />}>
        <Link href="/ui/wxkf/account">WXKF Account Management</Link>
      </Menu.Item>
      <Menu.Item key="/ui/wxkf/log" icon={<CustomerServiceOutlined />}>
        <Link href="/ui/wxkf/log">WXKF Log Management</Link>
      </Menu.Item>
      <Menu.Item key="/ui/session" icon={<CustomerServiceOutlined />}>
        <Link href="/ui/session">Session Management</Link>
      </Menu.Item>
    </Menu>
  </Sider>
);
