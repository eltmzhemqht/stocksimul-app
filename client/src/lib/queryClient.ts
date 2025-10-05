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
      staleTime: 3 * 60 * 1000, // 3분 - 서버 캐시와 동기화
      gcTime: 10 * 60 * 1000, // 10분 - 가비지 컬렉션 시간
      retry: (failureCount, error: any) => {
        // 네트워크 오류나 타임아웃은 재시도
        if (error?.message?.includes('시간이 초과') || error?.message?.includes('네트워크')) {
          return failureCount < 1; // 1번만 재시도
        }
        // 4xx 에러는 재시도하지 않음
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // 5xx 에러는 최대 1번 재시도
        return failureCount < 1;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // 최대 5초
    },
    mutations: {
      retry: false,
    },
  },
});
