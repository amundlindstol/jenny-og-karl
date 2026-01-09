/**
 * Caching utilities for performance optimization
 */

import { logger } from './logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * In-memory cache with TTL support
 */
export class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(cleanupIntervalMs = 60000) { // Clean up every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, cleanupIntervalMs);
  }

  /**
   * Set a value in the cache with TTL
   */
  set<T>(key: string, value: T, ttlMs = 300000): void { // Default 5 minutes
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
    
    logger.debug('Cache set', { key, ttl: ttlMs });
  }

  /**
   * Get a value from the cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      logger.debug('Cache miss', { key });
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      logger.debug('Cache expired', { key });
      return null;
    }

    logger.debug('Cache hit', { key });
    return entry.data;
  }

  /**
   * Delete a value from the cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      logger.debug('Cache deleted', { key });
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    logger.info('Cache cleared', { entriesRemoved: size });
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      logger.debug('Cache cleanup completed', { removedEntries: removedCount });
    }
  }

  /**
   * Destroy the cache and cleanup interval
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

/**
 * Cache decorator for functions
 */
export function cached<T extends (...args: any[]) => any>(
  ttlMs = 300000, // Default 5 minutes
  keyGenerator?: (...args: Parameters<T>) => string
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const cache = new MemoryCache();

    descriptor.value = function (...args: Parameters<T>): ReturnType<T> {
      const key = keyGenerator ? keyGenerator(...args) : `${propertyName}_${JSON.stringify(args)}`;
      
      // Try to get from cache
      const cached = cache.get<ReturnType<T>>(key);
      if (cached !== null) {
        return cached;
      }

      // Execute original method
      const result = originalMethod.apply(this, args);
      
      // Cache the result
      cache.set(key, result, ttlMs);
      
      return result;
    };

    return descriptor;
  };
}

/**
 * Async cache decorator for async functions
 */
export function cachedAsync<T extends (...args: any[]) => Promise<any>>(
  ttlMs = 300000, // Default 5 minutes
  keyGenerator?: (...args: Parameters<T>) => string
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const cache = new MemoryCache();
    const pendingRequests = new Map<string, Promise<any>>();

    descriptor.value = async function (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {
      const key = keyGenerator ? keyGenerator(...args) : `${propertyName}_${JSON.stringify(args)}`;
      
      // Try to get from cache
      const cached = cache.get<Awaited<ReturnType<T>>>(key);
      if (cached !== null) {
        return cached;
      }

      // Check if request is already pending
      const pending = pendingRequests.get(key);
      if (pending) {
        return pending;
      }

      // Execute original method
      const promise = originalMethod.apply(this, args);
      pendingRequests.set(key, promise);

      try {
        const result = await promise;
        
        // Cache the result
        cache.set(key, result, ttlMs);
        
        return result;
      } finally {
        pendingRequests.delete(key);
      }
    };

    return descriptor;
  };
}

// Global cache instance
export const globalCache = new MemoryCache();

/**
 * HTTP response caching headers
 */
export const CacheHeaders = {
  /**
   * No caching - for dynamic content
   */
  noCache: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },

  /**
   * Short-term caching (5 minutes)
   */
  shortTerm: {
    'Cache-Control': 'public, max-age=300, s-maxage=300',
  },

  /**
   * Medium-term caching (1 hour)
   */
  mediumTerm: {
    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
  },

  /**
   * Long-term caching (1 day)
   */
  longTerm: {
    'Cache-Control': 'public, max-age=86400, s-maxage=86400',
  },

  /**
   * Static assets caching (1 year)
   */
  staticAssets: {
    'Cache-Control': 'public, max-age=31536000, immutable',
  },
};