import { RequestInfo, RequestInit } from 'node-fetch';

const _importDynamic = new Function('modulePath', 'return import(modulePath)')

async function fetchLocal(url: RequestInfo, init?: RequestInit) {
  const {default: fetch} = await _importDynamic('node-fetch');
  return fetch(url, init);
}

export default fetchLocal;