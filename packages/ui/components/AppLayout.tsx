import React, { FC, ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import createPersistedState from 'use-persisted-state';
import { Layout } from 'antd';

import { SideNav } from './SideNav';

import styles from './app-layout.module.css';

const { Content, Footer } = Layout;

const useCollapsedState = createPersistedState('side-nav-collapsed');

interface AppLayoutProps {
  children?: ReactNode;
  withPadding?: boolean;
}

export const AppLayout: FC<AppLayoutProps> = ({ children, withPadding = true }: AppLayoutProps) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [collapsed, setCollapsed] = useCollapsedState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    }
  }, [router, status]);

  return (
    <Layout
      className="min-h-screen"
      style={{ marginLeft: collapsed ? '80px' : '200px' }}
    >
      <SideNav
        selected={router.pathname}
        collapsed={collapsed as boolean}
        setCollapsed={setCollapsed}
      />
      <Layout className="bg-white">
        <Content className={`${withPadding ? 'p-4' : ''} pb-20`}>
          <div
            className={`${styles['content-container']} h-full w-full bg-white`}
          >
            {children}
          </div>
        </Content>
        <Footer
          className="footer w-full h-20 flex text-center items-center justify-center fixed bottom-0"
          style={{ paddingRight: collapsed ? '80px' : '200px' }}
        >
          &copy; 2022&nbsp;
          <Link href="https://www.senses.chat" passHref>
            <a target="_blank" rel="noreferrer">
              广州先思科技有限公司
            </a>
          </Link>
        </Footer>
      </Layout>
    </Layout>
  );
};
