import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import httpProxyMiddleware from 'next-http-proxy-middleware';
import { getSession } from 'next-auth/react';

function onError(err, req, res) {
  console.error(err);

  res.status(500).end(err.toString());
}

function onNoMatch(req, res) {
  res.status(404).end('NOT FOUND');
}

const handler = nc<NextApiRequest, NextApiResponse>({
  onError,
  onNoMatch,
});

// redirect to backend
handler.all('*', async (req, res) => {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).end('Unauthorized');
  }

  return httpProxyMiddleware(req, res, {
    target: process.env.UI_API_URL,
    headers: {
      'NEXT_AUTH_USER_ID': session.userId,
    } as any
  });
});

export default handler;
