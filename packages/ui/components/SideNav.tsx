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
const { SubMenu } = Menu;

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
    <div className="h-8 m-4 text-white">{`先思${collapsed ? '' : '智联'}`}</div>
    <Menu theme="dark" mode="inline" defaultSelectedKeys={[selected]} defaultOpenKeys={['bot', 'account']}>
      <Menu.Item key="/" icon={<HomeOutlined />}>
        <Link href="/">首页</Link>
      </Menu.Item>
      <Menu.Item key="/wxkf/account" icon={<CustomerServiceOutlined />}>
        <Link href="/wxkf/account">微信客服账号管理</Link>
      </Menu.Item>
      <Menu.Item key="/session" icon={<MessageOutlined />}>
        <Link href="/session">会话管理</Link>
      </Menu.Item>
      <SubMenu key="bot" title="智能客服管理" icon={<RobotOutlined />}>
        <Menu.Item key="/rasa-server" >
          <Link href="/rasa-server">机器人管理</Link>
        </Menu.Item>
        <Menu.Item key="/route" >
          <Link href="/route">对接管理</Link>
        </Menu.Item>
      </SubMenu>
      <SubMenu key="account" title="账号管理" icon={<RobotOutlined />}>
        <Menu.Item key="/account/wechat" >
          <Link href="/account/wechat">微信账号管理</Link>
        </Menu.Item>
        <Menu.Item key="/account/wecom" >
          <Link href="/account/wecom">企业微信账号管理</Link>
        </Menu.Item>
      </SubMenu>
    </Menu>
  </Sider>
);
