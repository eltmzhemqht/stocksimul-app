interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5분
  private readonly maxSize = 500; // 최대 캐시 항목 수 (메모리 절약)
  private readonly maxMemoryMB = 50; // 최대 메모리 사용량 (MB)

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    // 메모리 사용량 확인
    if (this.getMemoryUsage() > this.maxMemoryMB) {
      this.evictOldest();
    }
    
    // 캐시 크기 제한 확인
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // 메모리 사용량 추정 (MB)
  private getMemoryUsage(): number {
    let totalSize = 0;
    for (const [key, item] of this.cache.entries()) {
      totalSize += key.length * 2; // 문자열 크기 (UTF-16)
      totalSize += JSON.stringify(item.data).length * 2; // 데이터 크기
      totalSize += 24; // 객체 오버헤드
    }
    return totalSize / (1024 * 1024); // MB로 변환
  }

  // 가장 오래된 항목 제거 (LRU 방식)
  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // 특정 패턴의 키들을 삭제 (예: stocks 관련 캐시)
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  // 캐시 통계
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      memoryUsageMB: this.getMemoryUsage(),
      maxMemoryMB: this.maxMemoryMB,
      keys: Array.from(this.cache.keys())
    };
  }

  // 메모리 정리 (만료된 항목들 제거)
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new MemoryCache();
