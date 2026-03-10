interface CacheItem<T> {
  value: T;
  expiresAt: number | null;
}

class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheItem<any>>;

  private constructor() {
    this.cache = new Map();

    setInterval(() => {
      this.cache.forEach((item, key) => {
        if (item.expiresAt && Date.now() > item.expiresAt) {
          console.log('Deleting expired cache item:', key);
          this.cache.delete(key);
        }
      });
    }, 1000 * 60);
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  set<T>(key: string, value: T, expirationMinutes?: number): void {
    const expiresAt = expirationMinutes
      ? Date.now() + expirationMinutes * 60 * 1000
      : null;

    this.cache.set(key, {
      value,
      expiresAt,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    if (item.expiresAt && Date.now() > item.expiresAt) {
      console.log('Cache expired:', key);
      this.cache.delete(key);
      return null;
    }

    console.log('Cache hit:', key);
    return item.value;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    console.log('Cache cleared');
  }

  size(): number {
    return this.cache.size;
  }
}

export default CacheService.getInstance();
