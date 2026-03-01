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

const ipCounters = new Map();
const clientCounters = new Map();
const dailyCounters = new Map();

const getHeader = (headers, name) => headers[name] || headers[name.toLowerCase()];

const getClientId = (headers) => getHeader(headers, 'x-client-id') || 'client_unknown';

const getIp = (headers) => {
  const forwarded = getHeader(headers, 'x-forwarded-for') || '';
  const first = forwarded.split(',')[0].trim();
  return first || getHeader(headers, 'x-real-ip') || 'ip_unknown';
};

const checkLimit = (map, key, limit, windowMs) => {
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

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const proxyToken = process.env.GEMINI_PROXY_TOKEN || '';
  const allowedOrigins = (process.env.GEMINI_ALLOWED_ORIGINS || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

  if (!apiKey) {
    res.status(500).json({ error: 'Missing GEMINI_API_KEY on server' });
    return;
  }

  if (proxyToken) {
    const token = req.headers['x-gemini-proxy-token'];
    if (!token || token !== proxyToken) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  }

  if (allowedOrigins.length > 0) {
    const origin = req.headers.origin || '';
    if (!origin || !allowedOrigins.includes(origin)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
  }

  const ip = getIp(req.headers);
  const clientId = getClientId(req.headers);
  const ipRetry = checkLimit(ipCounters, `ip:${ip}`, LIMITS.ipPerMin, WINDOWS_MS.ipPerMin);
  if (ipRetry) {
    res.status(429).setHeader('Retry-After', String(ipRetry)).json({ error: 'Rate limit exceeded. Try again shortly.' });
    return;
  }
  const clientRetry = checkLimit(clientCounters, `client:${clientId}`, LIMITS.clientPerHour, WINDOWS_MS.clientPerHour);
  if (clientRetry) {
    res.status(429).setHeader('Retry-After', String(clientRetry)).json({ error: 'Rate limit exceeded. Try again later.' });
    return;
  }
  const dailyKey = `daily:${clientId || ip}`;
  const dailyRetry = checkLimit(dailyCounters, dailyKey, LIMITS.daily, WINDOWS_MS.daily);
  if (dailyRetry) {
    res.status(429).setHeader('Retry-After', String(dailyRetry)).json({ error: 'Daily quota reached. Try again tomorrow.' });
    return;
  }

  const body = req.body || {};
  if (!body.model || !body.contents) {
    res.status(400).json({ error: 'Missing model or contents' });
    return;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${body.model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: body.contents, config: body.config })
    });
    const text = await response.text();
    res.status(response.status).setHeader('Content-Type', 'application/json').send(text);
  } catch (error) {
    res.status(500).json({ error: error?.message || 'Proxy error' });
  }
};
