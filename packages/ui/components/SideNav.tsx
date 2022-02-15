import React, { FC } from 'react';
import Link from 'next/link';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  CustomerServiceOutlined,
  RobotOutlined,
  LinkOutlined,
  MessageOutlined,
} from '@ant-design/icons';

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
      <Menu.Item key="/" icon={<HomeOutlined />}>
        <Link href="/">Home</Link>
      </Menu.Item>
      <Menu.Item key="/wxkf/account" icon={<CustomerServiceOutlined />}>
        <Link href="/wxkf/account">WXKF Account Management</Link>
      </Menu.Item>
      <Menu.Item key="/wxkf/log" icon={<MessageOutlined />}>
        <Link href="/wxkf/log">WXKF Log Management</Link>
      </Menu.Item>
      <Menu.Item key="/session" icon={<MessageOutlined />}>
        <Link href="/session">Session Management</Link>
      </Menu.Item>
      <Menu.Item key="/rasa-server" icon={<RobotOutlined />}>
        <Link href="/rasa-server">Rasa Server Management</Link>
      </Menu.Item>
      <Menu.Item key="/route" icon={<LinkOutlined />}>
        <Link href="/route">Route Management</Link>
      </Menu.Item>
    </Menu>
  </Sider>
);
