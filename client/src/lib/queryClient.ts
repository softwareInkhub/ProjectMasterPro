import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Helper to get the auth token from localStorage
function getAuthToken(): string | null {
  // First try to get from localStorage
  const storedToken = localStorage.getItem("authToken");
  if (storedToken) {
    return storedToken;
  }
  
  // For development/demo purposes, return a demo token if no token is stored
  // This allows testing without needing to log in
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzEyNTA0ODgzLCJleHAiOjE3NDQwNDA4ODN9.J4BrxnTeLkL4NvskJ-IVpLpYGJiB_6v0tzdH7n-d-O8";
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
export const getQueryFn: <T>(options?: {
  on401?: UnauthorizedBehavior;
}) => QueryFunction<T> =
  (options) =>
  async ({ queryKey }) => {
    const unauthorizedBehavior = options?.on401 || "throw";
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
