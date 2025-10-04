// Сервис кэширования для API запросов
class CacheService {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 минут по умолчанию в миллисекундах

  // Получение данных из кэша
  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    // Используем TTL, сохраненный для этого элемента кэша
    if (now - cached.timestamp > cached.ttl) {
      // Кэш истек
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  // Сохранение данных в кэш. ttlInSeconds - опциональное время жизни в секундах.
  set(key: string, data: any, ttlInSeconds?: number): void {
    const ttl = ttlInSeconds ? ttlInSeconds * 1000 : this.DEFAULT_TTL;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl,
    });
  }

  // Удаление данных из кэша
  remove(key: string): void {
    this.cache.delete(key);
  }

  // Очистка всего кэша
  clear(): void {
    this.cache.clear();
  }

  // Генерация ключа для кэша на основе URL и параметров
  generateKey(url: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${url}_${paramString}`;
  }
}

export const cacheService = new CacheService();