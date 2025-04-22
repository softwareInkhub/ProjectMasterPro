import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      // First try to parse as JSON to get structured error
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const clone = res.clone(); // Clone to avoid consuming the original response
        const errorData = await clone.json();
        const errorMessage = errorData.message || errorData.details || res.statusText;
        throw new Error(`${res.status}: ${errorMessage}`);
      } else {
        // Fallback to text if not JSON
        const text = await res.text() || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }
    } catch (e) {
      // If JSON parsing fails, use the original error message
      if (e instanceof Error && e.message !== `${res.status}: ${res.statusText}`) {
        throw e;
      }
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

// Helper to get the auth token from localStorage
function getAuthToken(): string | null {
  // Get the token from localStorage
  const storedToken = localStorage.getItem("authToken");
  // Only return the actual stored token - no default demo token
  return storedToken;
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
  try {
    // Ensure data is properly stringified and null values are handled correctly
    let bodyData: string | undefined = undefined;
    
    if (data !== undefined) {
      // Convert any null values to empty strings for fields that might cause issues
      const processedData = data;
      
      if (typeof processedData === 'object' && processedData !== null) {
        // Convert website null to empty string
        if ('website' in processedData && processedData.website === null) {
          (processedData as any).website = '';
        }
        
        // Add protocol to website if missing
        if ('website' in processedData && 
            typeof (processedData as any).website === 'string' && 
            (processedData as any).website && 
            !(processedData as any).website.match(/^https?:\/\//)) {
          (processedData as any).website = `http://${(processedData as any).website}`;
        }
      }
      
      try {
        bodyData = JSON.stringify(processedData);
        console.log("REQUEST DATA (stringified):", bodyData);
      } catch (error) {
        console.error("Error stringifying request data:", error);
        throw new Error("Invalid request data");
      }
    }
    
    // Build headers with content type for JSON data
    const headers = createHeaders(bodyData !== undefined);
    
    const res = await fetch(url, {
      method,
      headers,
      body: bodyData,
    });

    // Handle unauthorized error (redirect to login page)
    if (res.status === 401) {
      // If token is invalid or expired, clear it
      localStorage.removeItem("authToken");
      // Force redirect to login page
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/auth') &&
          !window.location.pathname.includes('/test-login')) {
        window.location.href = "/login";
      }
    }

    // Create a clone before checking for errors to preserve the response body
    const resClone = res.clone();
    
    try {
      await throwIfResNotOk(res);
    } catch (error) {
      console.error(`API Response Error (${method} ${url}):`, error);
      throw error;
    }
    
    // Return the cloned response to ensure it can be consumed multiple times
    return resClone;
  } catch (error) {
    console.error(`API Request Error (${method} ${url}):`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn = <T,>(options?: {
  on401?: UnauthorizedBehavior;
}): QueryFunction<T> =>
  async ({ queryKey }) => {
    const unauthorizedBehavior = options?.on401 || "throw";
    const res = await fetch(queryKey[0] as string, {
      headers: createHeaders(),
    });

    if (res.status === 401) {
      // If token is invalid or expired, clear it
      localStorage.removeItem("authToken");
      
      // Force redirect to login page if not already on login/auth pages
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/auth') &&
          !window.location.pathname.includes('/test-login')) {
        window.location.href = "/login";
      }
      
      // Return null or throw based on the behavior parameter
      if (unauthorizedBehavior === "returnNull") {
        return null as unknown as T;
      }
      
      throw new Error("Unauthorized: Please log in to continue");
    }

    await throwIfResNotOk(res);
    
    // Safely parse JSON response
    try {
      const text = await res.text();
      
      // If the response is empty, return an empty object
      if (!text || text.trim() === '') {
        return {} as any;
      }
      
      // Try to parse the JSON
      return JSON.parse(text) as any;
    } catch (error) {
      console.error("Error parsing JSON response:", error);
      throw new Error("Failed to parse server response");
    }
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
