import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import httpProxyMiddleware from 'next-http-proxy-middleware';

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
handler.all('*', async (req, res) =>
  httpProxyMiddleware(req, res, {
    target: process.env.UI_API_URL,
  }),
);

export default handler;
