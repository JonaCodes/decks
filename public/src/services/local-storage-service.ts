interface StorageItem<T> {
  value: T;
  expiresAt: number | null;
}

export class LocalStorageService {
  static set<T>(key: string, value: T, expiryHours?: number): void {
    const expiresAt = expiryHours
      ? Date.now() + expiryHours * 60 * 60 * 1000
      : null;

    const item: StorageItem<T> = {
      value,
      expiresAt,
    };

    localStorage.setItem(key, JSON.stringify(item));
  }

  static get<T>(key: string): T | null {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item: StorageItem<T> = JSON.parse(itemStr);

    if (item.expiresAt && Date.now() > item.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }

    return item.value;
  }

  static remove(key: string): void {
    localStorage.removeItem(key);
  }

  static clear(): void {
    localStorage.clear();
  }
}
