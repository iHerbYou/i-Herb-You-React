export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const getBaseUrl = () => {
  // In dev, vite dev server proxy will handle /api → backend
  // In prod, use env (set VITE_API_BASE_URL) or fallback to same origin
  const env = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return env?.replace(/\/$/, '') || '';
};

export async function api<T = unknown>(
  path: string,
  options: {
    method?: HttpMethod;
    headers?: Record<string, string>;
    body?: unknown;
    credentials?: RequestCredentials;
    signal?: AbortSignal;
  } = {}
): Promise<T> {
  const base = getBaseUrl();
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const isJson = options.body && typeof options.body === 'object' && !(options.body instanceof FormData);

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      ...(isJson ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
    body: isJson ? JSON.stringify(options.body) : (options.body as any),
    credentials: options.credentials,
    signal: options.signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}

// Convenience helpers
export const get = <T = unknown>(path: string, init?: Omit<Parameters<typeof api>[1], 'method' | 'body'>) =>
  api<T>(path, { ...(init || {}), method: 'GET' });

export const post = <T = unknown>(path: string, body?: unknown, init?: Omit<Parameters<typeof api>[1], 'method' | 'body'>) =>
  api<T>(path, { ...(init || {}), method: 'POST', body });

export const put = <T = unknown>(path: string, body?: unknown, init?: Omit<Parameters<typeof api>[1], 'method' | 'body'>) =>
  api<T>(path, { ...(init || {}), method: 'PUT', body });

export const patch = <T = unknown>(path: string, body?: unknown, init?: Omit<Parameters<typeof api>[1], 'method' | 'body'>) =>
  api<T>(path, { ...(init || {}), method: 'PATCH', body });

export const del = <T = unknown>(path: string, init?: Omit<Parameters<typeof api>[1], 'method' | 'body'>) =>
  api<T>(path, { ...(init || {}), method: 'DELETE' });

