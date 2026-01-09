// Network error recovery utilities

interface NetworkRecoveryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  timeoutMs: number;
}

const DEFAULT_NETWORK_CONFIG: NetworkRecoveryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffFactor: 2,
  timeoutMs: 10000, // 10 seconds
};

// Network error types
export enum NetworkErrorType {
  TIMEOUT = 'TIMEOUT',
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  SERVER_ERROR = 'SERVER_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
  UNKNOWN = 'UNKNOWN'
}

export interface NetworkError extends Error {
  type: NetworkErrorType;
  status?: number;
  retryable: boolean;
}

// Create a network error with proper classification
export function createNetworkError(
  error: any,
  message?: string
): NetworkError {
  const networkError = new Error(message || error.message || 'Network error') as NetworkError;
  
  // Classify the error type
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    networkError.type = NetworkErrorType.TIMEOUT;
    networkError.retryable = true;
  } else if (error.status === 429 || error.message?.includes('rate limit')) {
    networkError.type = NetworkErrorType.RATE_LIMITED;
    networkError.retryable = true;
  } else if (error.status >= 500) {
    networkError.type = NetworkErrorType.SERVER_ERROR;
    networkError.retryable = true;
  } else if (error.status >= 400 && error.status < 500) {
    networkError.type = NetworkErrorType.CONNECTION_FAILED;
    networkError.retryable = false;
  } else {
    networkError.type = NetworkErrorType.UNKNOWN;
    networkError.retryable = true;
  }
  
  networkError.status = error.status;
  
  return networkError;
}

// Sleep utility
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Calculate exponential backoff delay with jitter
function calculateBackoffDelay(attempt: number, config: NetworkRecoveryConfig): number {
  const exponentialDelay = config.baseDelay * Math.pow(config.backoffFactor, attempt - 1);
  const jitter = Math.random() * 0.1 * exponentialDelay; // Add 10% jitter
  const delay = exponentialDelay + jitter;
  return Math.min(delay, config.maxDelay);
}

// Enhanced fetch with timeout and retry logic
export async function fetchWithRecovery(
  url: string,
  options: RequestInit = {},
  config: Partial<NetworkRecoveryConfig> = {}
): Promise<Response> {
  const finalConfig = { ...DEFAULT_NETWORK_CONFIG, ...config };
  let lastError: any;

  for (let attempt = 1; attempt <= finalConfig.maxRetries + 1; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), finalConfig.timeoutMs);

      // Make the request
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check if response is ok
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        (error as any).status = response.status;
        throw error;
      }

      return response;
    } catch (error: any) {
      lastError = error;
      const networkError = createNetworkError(error);

      // Don't retry if error is not retryable
      if (!networkError.retryable) {
        throw networkError;
      }

      // If this was the last attempt, throw the error
      if (attempt > finalConfig.maxRetries) {
        throw networkError;
      }

      // Calculate delay and wait before retry
      const delay = calculateBackoffDelay(attempt, finalConfig);
      console.warn(`Network request failed (attempt ${attempt}/${finalConfig.maxRetries + 1}), retrying in ${delay}ms:`, error.message);
      await sleep(delay);
    }
  }

  throw createNetworkError(lastError);
}

// API client with built-in error recovery
export class APIClient {
  private baseURL: string;
  private defaultConfig: Partial<NetworkRecoveryConfig>;

  constructor(baseURL: string = '', config: Partial<NetworkRecoveryConfig> = {}) {
    this.baseURL = baseURL;
    this.defaultConfig = config;
  }

  async get(endpoint: string, config?: Partial<NetworkRecoveryConfig>): Promise<any> {
    const response = await fetchWithRecovery(
      `${this.baseURL}${endpoint}`,
      { method: 'GET' },
      { ...this.defaultConfig, ...config }
    );
    return response.json();
  }

  async post(endpoint: string, data: any, config?: Partial<NetworkRecoveryConfig>): Promise<any> {
    const response = await fetchWithRecovery(
      `${this.baseURL}${endpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
      { ...this.defaultConfig, ...config }
    );
    return response.json();
  }
}

// Network status monitoring
export class NetworkMonitor {
  private listeners: Set<(online: boolean) => void> = new Set();
  private isOnline: boolean = true; // Default to true for SSR

  constructor() {
    // Only initialize on client-side
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.notifyListeners(true);
  };

  private handleOffline = () => {
    this.isOnline = false;
    this.notifyListeners(false);
  };

  private notifyListeners(online: boolean) {
    this.listeners.forEach(listener => listener(online));
  }

  public addListener(listener: (online: boolean) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getStatus(): boolean {
    return this.isOnline;
  }

  public destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
    this.listeners.clear();
  }
}

// Singleton network monitor instance - only create on client-side
export const networkMonitor = typeof window !== 'undefined' ? new NetworkMonitor() : null;

// Hook for React components to use network status
export function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = React.useState(true); // Default to true for SSR

  React.useEffect(() => {
    if (!networkMonitor) return; // No network monitor on server-side
    
    // Initialize with current status
    setIsOnline(networkMonitor.getStatus());
    
    const unsubscribe = networkMonitor.addListener(setIsOnline);
    return unsubscribe;
  }, []);

  return isOnline;
}

// React import (will be available in React components)
declare const React: any;