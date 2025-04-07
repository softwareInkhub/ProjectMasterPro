import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Helper to get the auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem("authToken");
}

// Helper to create headers with auth token if available
function createHeaders(contentType = false): Record<string, string> {
  const headers: Record<string, string> = {};
  
  if (contentType) {
    headers["Content-Type"] = "application/json";
  }
  
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: createHeaders(!!data),
    body: data ? JSON.stringify(data) : undefined,
  });

  // Handle unauthorized error (could redirect to login page)
  if (res.status === 401) {
    // If token is invalid or expired, clear it
    localStorage.removeItem("authToken");
    // Could redirect to login here
    // window.location.href = "/login";
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      headers: createHeaders(),
    });

    if (res.status === 401) {
      // If token is invalid or expired, clear it
      localStorage.removeItem("authToken");
      
      // Return null or throw based on the behavior parameter
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
      
      throw new Error("Unauthorized: Please log in to continue");
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
