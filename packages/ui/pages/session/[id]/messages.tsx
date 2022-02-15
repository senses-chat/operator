import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR, { SWRResponse } from 'swr';

import { RouteMessage } from 'chat-operator-backend/server/route/models/route.dto';

import { url, fetcher } from 'utils/request';
import { AppLayout } from 'components/AppLayout';
import { Messages } from 'components/Messages';
import { handleSessionMessageContent } from 'utils/utils';

interface sessionDetailData {
  _id: string;
  messages: sessionMessageData[];
}

interface sessionMessageData {
  message: RouteMessage;
  metadata: {
    timestamp: string;
  };
}

export default function SessionMessagesPage() {
  const router = useRouter();
  const { id: sessionId } = router.query;
  const { data }: SWRResponse<sessionDetailData, Error> = useSWR(
    url(`/api/history/sessions/${sessionId}`),
    fetcher,
  );

  const messages =
    data?.messages?.map((msg) => {
      const message = handleSessionMessageContent(msg.message);

      return {
        type: msg.message.type === 'Rasa' ? 'bot' : 'user',
        message,
        time: msg.metadata.timestamp,
      };
    }) || [];

  return (
    <AppLayout>
      <Head>
        <title>Session Management</title>
      </Head>

      <Messages messages={messages} />
    </AppLayout>
  );
}
