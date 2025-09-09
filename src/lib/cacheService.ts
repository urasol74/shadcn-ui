// Сервис кэширования для API запросов
class CacheService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 минут по умолчанию

  // Получение данных из кэша
  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.DEFAULT_TTL) {
      // Кэш истек
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  // Сохранение данных в кэш
  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
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