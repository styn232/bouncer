import { SingleProfile, SiteSettings, SubscriptionPlan, PaymentTransaction, MatchOrder, AdminStats, ReelItem, StoryItem, FeedPost, Conversation, NotificationItem, CentralizedLoadingState } from '../types';

export const INITIAL_LOADING_STATE: CentralizedLoadingState = {
  isInitialLoading: true,
  isProfilesLoading: true,
  isFilterUpdating: false,
  isBackgroundSyncing: false,
  isSocialLoading: false,
  isActionLoading: false,
  activeRequestsCount: 0,
  lastSyncedAt: null,
  error: null
};

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class DataCacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private inFlight = new Map<string, Promise<any>>();
  private activeProfileAbortController: AbortController | null = null;

  // TTL Defaults (in milliseconds)
  private readonly PROFILES_TTL = 45 * 1000; // 45 seconds
  private readonly STATIC_TTL = 5 * 60 * 1000; // 5 minutes (settings, plans)
  private readonly SOCIAL_TTL = 30 * 1000; // 30 seconds
  private readonly ADMIN_TTL = 20 * 1000; // 20 seconds

  /**
   * Get cached data if valid, otherwise return null.
   */
  get<T>(key: string, customTtl?: number): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const ttl = customTtl ?? this.getDefaultTtl(key);
    const isExpired = Date.now() - entry.timestamp > ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  /**
   * Set cached data with current timestamp.
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Remove a single cache entry or entries matching a prefix.
   */
  invalidate(keyOrPrefix: string): void {
    for (const key of Array.from(this.cache.keys())) {
      if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Invalidate all profile queries.
   */
  invalidateProfiles(): void {
    this.invalidate('profiles_');
  }

  /**
   * Invalidate all social endpoints.
   */
  invalidateSocial(): void {
    this.invalidate('social_');
    this.invalidate('reels');
    this.invalidate('stories');
    this.invalidate('posts');
    this.invalidate('conversations');
    this.invalidate('wholikedme');
    this.invalidate('notifications');
  }

  /**
   * Invalidate all cached data.
   */
  invalidateAll(): void {
    this.cache.clear();
    this.inFlight.clear();
  }

  /**
   * Deduplicate concurrent in-flight requests.
   * If a fetch for this exact key is already running, return the existing Promise.
   */
  async dedupe<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    if (this.inFlight.has(key)) {
      return this.inFlight.get(key) as Promise<T>;
    }

    const promise = fetcher()
      .finally(() => {
        this.inFlight.delete(key);
      });

    this.inFlight.set(key, promise);
    return promise;
  }

  /**
   * Abort any ongoing profile search/filter fetch to avoid race conditions.
   */
  getProfileAbortSignal(): AbortSignal {
    if (this.activeProfileAbortController) {
      try {
        this.activeProfileAbortController.abort();
      } catch {}
    }
    this.activeProfileAbortController = new AbortController();
    return this.activeProfileAbortController.signal;
  }

  private getDefaultTtl(key: string): number {
    if (key.startsWith('profiles_')) return this.PROFILES_TTL;
    if (key.startsWith('static_') || key === 'settings' || key === 'plans') return this.STATIC_TTL;
    if (key.startsWith('social_') || key === 'reels' || key === 'stories' || key === 'posts') return this.SOCIAL_TTL;
    if (key.startsWith('admin_')) return this.ADMIN_TTL;
    return 30 * 1000;
  }
}

export const dataCache = new DataCacheManager();
