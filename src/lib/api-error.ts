// API 错误类型定义
export type ApiErrorCode = '401' | '403' | '429' | '5XX' | 'TIMEOUT' | 'UNKNOWN' | 'NETWORK_ERROR';

// API 错误类
export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public provider: string,
    public originalError?: any,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 从 HTTP 响应或错误中提取错误码
export function getErrorCode(error: any, provider: string): ApiErrorCode {
  // HTTP 状态码
  if (error.statusCode || error.status) {
    const status = error.statusCode || error.status;
    if (status === 401) return '401';
    if (status === 403) return '403';
    if (status === 429) return '429';
    if (status >= 500) return '5XX';
  }

  // 错误消息判断
  const message = error.message || '';
  if (message.includes('timeout') || message.includes('超时')) return 'TIMEOUT';
  if (message.includes('ECONNREFUSED') || message.includes('fetch failed')) return 'NETWORK_ERROR';

  return 'UNKNOWN';
}

// 获取用户友好的错误消息
export function getErrorMessage(code: ApiErrorCode, provider: string): string {
  const messages: Record<ApiErrorCode, string> = {
    '401': 'API 密钥无效或已过期',
    '403': '无权访问该服务',
    '429': '请求过于频繁，请稍后重试',
    '5XX': '服务暂时不可用，请稍后重试',
    'TIMEOUT': '请求超时，请稍后重试',
    'NETWORK_ERROR': '网络连接失败',
    'UNKNOWN': '未知错误',
  };
  return messages[code] || '未知错误';
}

// API 调用日志
export interface ApiLogParams {
  provider: string;
  endpoint: string;
  method: string;
  startTime: number;
  status?: number;
  success: boolean;
  error?: string;
  duration?: number;
}

export function logApiCall(params: ApiLogParams): void {
  const log = {
    timestamp: new Date().toISOString(),
    provider: params.provider,
    endpoint: params.endpoint,
    method: params.method,
    duration: params.duration || Date.now() - params.startTime,
    status: params.status,
    success: params.success,
    error: params.error,
  };

  console.log(JSON.stringify(log));
}

// 创建带重试的 fetch 包装器
export interface FetchWithRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  logParams: Omit<ApiLogParams, 'duration' | 'status' | 'success' | 'error'>,
  retryOptions: FetchWithRetryOptions = {}
): Promise<Response> {
  const { maxRetries = 2, retryDelay = 1000, timeout = 30000 } = retryOptions;
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // 记录成功日志
      logApiCall({
        ...logParams,
        status: response.status,
        success: response.ok,
        duration: Date.now() - logParams.startTime,
      });

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        (error as any).statusCode = response.status;
        throw error;
      }

      return response;
    } catch (error: any) {
      lastError = error;

      // 如果是最后一次重试或不可重试的错误，直接抛出
      if (attempt === maxRetries || !shouldRetry(error)) {
        logApiCall({
          ...logParams,
          success: false,
          error: error.message,
          duration: Date.now() - logParams.startTime,
        });
        throw error;
      }

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
    }
  }

  throw lastError;
}

// 判断是否应该重试
function shouldRetry(error: any): boolean {
  const code = getErrorCode(error, '');
  return ['5XX', 'TIMEOUT', 'NETWORK_ERROR'].includes(code);
}
