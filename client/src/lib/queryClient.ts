import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  userId?: string | null,
): Promise<Response> {
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  if (userId) {
    headers["x-user-id"] = userId;
  }

  // 타임아웃 설정 (10초)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.');
    }
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
  userId?: string | null;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior, userId }) =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = {};
    
    if (userId) {
      headers["x-user-id"] = userId;
    }

    // 타임아웃 설정 (10초)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(queryKey.join("/") as string, {
        headers,
        credentials: "include",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.');
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      // 더 공격적인 캐싱 전략
      staleTime: 5 * 60 * 1000, // 5분 - 데이터 신선도
      gcTime: 15 * 60 * 1000, // 15분 - 메모리 보관 시간
      // 스마트 재시도 로직
      retry: (failureCount, error: any) => {
        // 네트워크 오류나 타임아웃은 재시도
        if (error?.message?.includes('시간이 초과') || error?.message?.includes('네트워크')) {
          return failureCount < 2; // 2번 재시도
        }
        // 4xx 에러는 재시도하지 않음
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // 5xx 에러는 최대 2번 재시도
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 3000), // 최대 3초, 더 빠른 재시도
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // 뮤테이션은 네트워크 오류만 재시도
        if (error?.message?.includes('시간이 초과') || error?.message?.includes('네트워크')) {
          return failureCount < 1;
        }
        return false;
      },
      retryDelay: 1000,
    },
  },
});
