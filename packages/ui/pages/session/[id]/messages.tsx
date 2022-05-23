import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR, { SWRResponse } from 'swr';
import { Breadcrumb, Button } from 'antd';
import { SwapOutlined, RightOutlined } from '@ant-design/icons';
import { format } from 'date-fns';

import { RouteMessage } from '@senses-chat/operator-events/dist/route/models/route.dto';

import { url, fetcher } from 'utils/request';
import { AppLayout } from 'components/AppLayout';
import { Messages } from 'components/Messages';
import { BotNode } from 'components/BotNode';
import { handleSessionMessageContent, handleWxkfIncomeMessageContent } from 'utils/utils';
import { WxkfAccount } from 'utils/schema';

interface sessionDetailData {
  _id: string;
  messages: sessionMessageData[];
  definition: {
    source: {
      type: string;
      namespaces: string[];
    };
    destination: {
      type: string;
      namespaces: string[];
    };
  };
}

interface sessionMessageData {
  message: RouteMessage;
  metadata: {
    timestamp: string;
  };
}

interface logDetailData {
  _id: string;
  messages: Array<logMessageData>;
}

interface logMessageData {
  corpid?: string;
  external_userid?: string;
  msgid?: string;
  msgtype?: string;
  open_kfid?: string;
  message?: RouteMessage;
  metadata: {
    timestamp: string;
  };
  event?: any;
  servicer_userid?: string;
  text?: {
    content?: string;
  };
}


export default function SessionMessagesPage() {
  const router = useRouter();
  const { id: sessionId } = router.query;
  const { data: wxkfData }: SWRResponse<WxkfAccount[], Error> = useSWR(
    url(`/api/wxkf/account`),
    fetcher,
  );
  const { data }: SWRResponse<sessionDetailData, Error> = useSWR(
    url(`/api/history/sessions/${sessionId}`),
    fetcher,
  );
  const { data: wxData }: SWRResponse<logDetailData, Error> = useSWR(
    data ? url(`/api/history/wxkf_msg_logs/${data.definition.source.namespaces.join(':')}`) : null,
    fetcher,
  );

  const messages =
    wxData?.messages?.map((msg) => {
      const message = msg?.msgid ? handleWxkfIncomeMessageContent(msg) : handleSessionMessageContent(msg.message);
      const type = msg?.msgid ? (msg?.servicer_userid ? 'bot' : 'user') : (msg.message.type === 'Wxkf' ? 'bot' : 'user');

      return {
        type: msg?.msgid ? (msg?.servicer_userid ? 'bot' : 'user') : (msg.message.type === 'Wxkf' ? 'bot' : 'user'),
        message,
        time: msg.metadata.timestamp,
        metadata: msg.message?.content?.metadata || msg.event || null,
        stageInfo: type === 'bot' ? {
          stage: msg?.msgid ? 'wxkf' : 'bot',
          name: msg?.msgid ? wxkfData?.find((item) => item.open_kfid === data.definition.source.namespaces[2])?.name || data.definition.source.namespaces[2] : data.definition.destination.namespaces[0],
        } : null,
      };
    }) || [];

  const points = [];
  let stage = null;
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    if (message.stageInfo && stage !== message.stageInfo.stage) {
      stage = message.stageInfo.stage;
      points.push({
        ...message.stageInfo,
        index: i,
        time: message.time,
      });
    }
  }

  return (
    <AppLayout withPadding={false}>
      <Head>
        <title>会话记录</title>
      </Head>

      <Breadcrumb separator=">" className='m-2'>
        <Breadcrumb.Item href="/session">会话管理</Breadcrumb.Item>
        <Breadcrumb.Item>会话详情</Breadcrumb.Item>
      </Breadcrumb>

      <div className='flex flex-row bg-slate-200 text-center p-2'>
        <p className='basis-50 grow-0'>会话路径</p>
        <div className='grow'>
          {
            data && (
              <div className='flex flex-row justify-center'>
                <BotNode type='WxCustomer' namespaces={data.definition?.source?.namespaces} />
                <SwapOutlined className="flex justify-center items-center mx-2 w-4 " />
                <BotNode type={data.definition?.destination.type} namespaces={data.definition.destination.namespaces} />
                &nbsp;会话详情
              </div>
            )
          }
        </div>
      </div>
      <div className='flex flex-row bg-gray-100 h-full'>
        <div className='basis-50 grow-0 bg-white'>
        {
          points.map((point) => (
            <div className='flex flex-row items-center justify-between p-3 border-b' key={point.index}>
              <div className=''>
                <p className='text-gray-500 mb-1'>{format(new Date(point.time), 'yyyy-MM-dd HH:mm:ss')}</p>
                <p className='text-base text-ellipsis'>{point.name}</p>
              </div>
              <Button className='ml-2 p-0 border-0' href={`#message-${point.index}`}>
                <RightOutlined className='cursor-pointer' />  
              </Button>
            </div>
          ))
        }
        </div>
        <div className='grow p-2 h-full overflow-y-scroll'>
          <Messages messages={messages} />
        </div>
      </div>
    </AppLayout>
  );
}
