type ProxyEvent = {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  body: string | null;
};

type ProxyResponse = {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
};

type Handler = (event: ProxyEvent) => Promise<ProxyResponse>;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_PROXY_TOKEN = process.env.GEMINI_PROXY_TOKEN || '';
const GEMINI_ALLOWED_ORIGINS = (process.env.GEMINI_ALLOWED_ORIGINS || '')
  .split(',')
  .map(v => v.trim())
  .filter(Boolean);
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const LIMITS = {
  ipPerMin: 10,
  clientPerHour: 30,
  daily: 100
};
const WINDOWS_MS = {
  ipPerMin: 60 * 1000,
  clientPerHour: 60 * 60 * 1000,
  daily: 24 * 60 * 60 * 1000
};

type Counter = { count: number; reset: number };
const ipCounters = new Map<string, Counter>();
const clientCounters = new Map<string, Counter>();
const dailyCounters = new Map<string, Counter>();

const buildError = (statusCode: number, message: string, headers: Record<string, string> = {}) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', ...headers },
  body: JSON.stringify({ error: message })
});

const getHeader = (headers: Record<string, string | undefined>, name: string) => {
  return headers[name] || headers[name.toLowerCase()];
};

const getClientId = (headers: Record<string, string | undefined>) => {
  return getHeader(headers, 'x-client-id') || 'client_unknown';
};

const getIp = (headers: Record<string, string | undefined>) => {
  const forwarded = getHeader(headers, 'x-forwarded-for') || '';
  const first = forwarded.split(',')[0].trim();
  return first || getHeader(headers, 'x-real-ip') || 'ip_unknown';
};

const checkLimit = (map: Map<string, Counter>, key: string, limit: number, windowMs: number) => {
  const now = Date.now();
  const entry = map.get(key);
  if (!entry || now > entry.reset) {
    map.set(key, { count: 1, reset: now + windowMs });
    return null;
  }
  entry.count += 1;
  if (entry.count > limit) {
    return Math.max(1, Math.ceil((entry.reset - now) / 1000));
  }
  return null;
};

export const handler: Handler = async (event) => {
  if (!GEMINI_API_KEY) {
    return buildError(500, 'Missing GEMINI_API_KEY on server');
  }

  if (event.httpMethod !== 'POST') {
    return buildError(405, 'Method not allowed');
  }

  if (GEMINI_PROXY_TOKEN) {
    const token = event.headers['x-gemini-proxy-token'] || event.headers['X-Gemini-Proxy-Token'];
    if (!token || token !== GEMINI_PROXY_TOKEN) {
      return buildError(401, 'Unauthorized');
    }
  }

  if (GEMINI_ALLOWED_ORIGINS.length > 0) {
    const origin = event.headers.origin || event.headers.Origin || '';
    if (!origin || !GEMINI_ALLOWED_ORIGINS.includes(origin)) {
      return buildError(403, 'Forbidden');
    }
  }

  const ip = getIp(event.headers);
  const clientId = getClientId(event.headers);
  const ipRetry = checkLimit(ipCounters, `ip:${ip}`, LIMITS.ipPerMin, WINDOWS_MS.ipPerMin);
  if (ipRetry) {
    return buildError(429, 'Rate limit exceeded. Try again shortly.', { 'Retry-After': String(ipRetry) });
  }
  const clientRetry = checkLimit(clientCounters, `client:${clientId}`, LIMITS.clientPerHour, WINDOWS_MS.clientPerHour);
  if (clientRetry) {
    return buildError(429, 'Rate limit exceeded. Try again later.', { 'Retry-After': String(clientRetry) });
  }
  const dailyKey = `daily:${clientId || ip}`;
  const dailyRetry = checkLimit(dailyCounters, dailyKey, LIMITS.daily, WINDOWS_MS.daily);
  if (dailyRetry) {
    return buildError(429, 'Daily quota reached. Try again tomorrow.', { 'Retry-After': String(dailyRetry) });
  }

  try {
    const body = event.body ? JSON.parse(event.body) : null;
    if (!body?.model || !body?.contents) {
      return buildError(400, 'Missing model or contents');
    }

    const url = `${GEMINI_API_BASE}/models/${body.model}:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: body.contents, config: body.config })
    });

    const text = await response.text();
    return {
      statusCode: response.status,
      headers: { 'Content-Type': 'application/json' },
      body: text
    };
  } catch (error: any) {
    return buildError(500, error?.message || 'Proxy error');
  }
};
