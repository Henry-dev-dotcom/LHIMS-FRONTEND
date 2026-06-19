import { API_MODES, clearStoredTokens, getApiConfig, getStoredTokens, setStoredTokens } from './config';
import { createMockBackend } from './mockBackend';

export class ApiError extends Error {
  constructor(message, { status = 500, details = null, requestId = '' } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.requestId = requestId;
  }
}

export function unwrapApiEnvelope(payload) {
  if (payload && typeof payload === 'object' && payload.success === true && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return payload.data;
  }
  return payload;
}

export function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
      return;
    }
    query.set(key, value);
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
}

function normalizeHeaders({ body, headers, token, skipAuth }) {
  const storedTokens = getStoredTokens();
  const accessToken = token || storedTokens.accessToken;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  return {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(!skipAuth && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...headers
  };
}

async function parseResponse(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function request(path, { method = 'GET', body, token, headers = {}, signal, skipAuth = false, unwrap = true } = {}) {
  const config = getApiConfig();
  const url = `${config.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), config.timeoutMs);
  const linkedSignal = signal || controller.signal;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  try {
    const response = await fetch(url, {
      method,
      headers: normalizeHeaders({ body, headers, token, skipAuth }),
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
      signal: linkedSignal
    });
    const payload = await parseResponse(response);
    if (!response.ok) {
      if (response.status === 401) clearStoredTokens();
      throw new ApiError(payload?.message || `Request failed: ${response.status}`, {
        status: response.status,
        details: payload,
        requestId: payload?.requestId || response.headers.get('x-request-id') || ''
      });
    }
    return unwrap ? unwrapApiEnvelope(payload) : payload;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function loginRequest(credentials) {
  const data = await request('/auth/login', { method: 'POST', body: credentials, skipAuth: true });
  setStoredTokens(data);
  return data;
}

export async function logoutRequest() {
  const storedTokens = getStoredTokens();
  try {
    return await request('/auth/logout', { method: 'POST', body: { refreshToken: storedTokens.refreshToken } });
  } finally {
    clearStoredTokens();
  }
}

export function createApiClient({ mode, data, auth } = {}) {
  const config = getApiConfig();
  const activeMode = mode || config.mode;
  if (activeMode === API_MODES.MOCK) {
    const mock = createMockBackend(data);
    return {
      mode: API_MODES.MOCK,
      config,
      mock,
      auth,
      get: async (resolver, ...args) => {
        await new Promise((resolve) => window.setTimeout(resolve, config.demoDelayMs));
        return typeof resolver === 'function' ? resolver(...args) : resolver;
      }
    };
  }
  return {
    mode: API_MODES.LIVE,
    config,
    auth,
    request,
    login: loginRequest,
    logout: logoutRequest,
    tokens: getStoredTokens()
  };
}
