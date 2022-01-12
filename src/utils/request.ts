import { mutate } from 'swr';

export function url(path: string): string {
  const apiRoot = process.env.REACT_APP_API_ROOT || '';
  return `${apiRoot}${path}`;
}

interface ErrorBody {
  message: string;
}

export const fetcher = (input: RequestInfo, init?: RequestInit): Promise<any> =>
  fetch(input, init).then(async (res) => {
    if (res.status !== 200 && res.status !== 201) {
      const body: ErrorBody = await res.json();
      if (body?.message) {
        return Promise.reject(body?.message);
      }
      return undefined;
    }
    return res.json();
  });

export const fetcherCustom = (
  input: RequestInfo,
  init?: () => any,
): Promise<any> =>
  fetch(input, init()).then(async (res) => {
    if (res.status !== 200 && res.status !== 201) {
      const body: ErrorBody = await res.json();
      if (body?.message) {
        return Promise.reject(body?.message);
      }
      return undefined;
    }
    return res.json();
  });

export async function refreshData(data: string, count: string) {
  await Promise.all([mutate(url(data)), mutate(url(count))]);
}
