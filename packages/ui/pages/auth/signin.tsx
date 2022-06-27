import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { getProviders, signIn, useSession } from "next-auth/react";
import {
  Button,
  Input,
  message
} from 'antd';
import bgImg from 'public/bg.svg';

interface SignInParam {
  providers: any;
}

export default function SignIn({ providers }: SignInParam) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [router, status]);

  function credentialLogin() {
    if (!username || !password) {
      message.error('请输入账号密码');
      return;
    }

    signIn(providers.credentials.id, { username, password, callbackUrl: '/' })
  }

  return (
    <div className="w-screen h-screen bg-no-repeat pt-28" style={{ backgroundImage: `url(${bgImg.src})`, backgroundSize: '100%', backgroundPosition: 'center 110px', backgroundColor: '#f0f2f5' }}>
      <div className="w-64 mx-auto text-center">
        <h1 className="text-3xl mb-0">先思智联</h1>
        <h2 className="mt-2 mb-10 text-sm font-normal" style={{ color: 'rgba(0,0,0,0.45)' }}>聊天机器人消息中间件</h2>

        {
          providers.credentials && (
            <div className="pb-5 mb-5 border-b border-gray-300">
              <Input value={username} onChange={(ev) => setUsername(ev.target.value)} className="w-full mb-2" placeholder="用户名" size="large" />
              <Input value={password} onChange={(ev) => setPassword(ev.target.value)} className="w-full mb-4" placeholder="密码" size="large" />
              <Button className="w-full" type="primary" size="large" onClick={credentialLogin}>
                通过账号密码登录
              </Button>
            </div>
          )
        }

        {Object.values(providers).map((provider: any) => {
          if (provider.id === "credentials") {
            return null;
          }

          return (
            <div key={provider.name}>
              <Button className="w-full" type="primary" size="large" onClick={() => signIn(provider.id, { callbackUrl: '/' })}>
                通过 {provider.name} 登录
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export async function getServerSideProps(context) {
  const providers = await getProviders();
  return {
    props: { providers },
  }
}