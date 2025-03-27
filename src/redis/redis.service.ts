import Redis from 'ioredis';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT, 10),
    });
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttl: number): Promise<void> {
    await this.redis.set(key, value, 'EX', ttl);
  }

  async clearArticlesCache(): Promise<void> {
    const keys = await this.redis.keys('articles:*');
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
