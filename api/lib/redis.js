import { Redis } from '@upstash/redis';

// 创建 Upstash Redis 客户端
const redis = new Redis({
  url: process.env.KV_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// 测试数据库连接
redis.ping().then(() => {
  console.log("[API] Successfully connected to Upstash Redis");
}).catch((error) => {
  console.error("[API] Failed to connect to Upstash Redis:", error);
});

// 数据库操作封装
export const kvClient = {
  async lrange(key, start, end) {
    try {
      const result = await redis.lrange(key, start, end);
      return result || [];
    } catch (error) {
      console.error('[KV] Error in lrange:', error);
      return [];
    }
  },
  
  async lpush(key, value) {
    try {
      return await redis.lpush(key, value);
    } catch (error) {
      console.error('[KV] Error in lpush:', error);
      throw new Error('Failed to save comment');
    }
  },
  
  async lset(key, index, value) {
    try {
      return await redis.lset(key, index, value);
    } catch (error) {
      console.error('[KV] Error in lset:', error);
      throw new Error('Failed to update list item');
    }
  },
  
  async lrem(key, count, value) {
    try {
      return await redis.lrem(key, count, value);
    } catch (error) {
      console.error('[KV] Error in lrem:', error);
      throw new Error('Failed to remove list item');
    }
  },
  
  async hgetall(key) {
    try {
      const result = await redis.hgetall(key);
      return result || { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    } catch (error) {
      console.error('[KV] Error in hgetall:', error);
      return { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    }
  },
  
  async hincrby(key, field, increment) {
    try {
      return await redis.hincrby(key, field, increment);
    } catch (error) {
      console.error('[KV] Error in hincrby:', error);
      throw new Error('Failed to update rating');
    }
  },
  
  async get(key) {
    try {
      return await redis.get(key);
    } catch (error) {
      console.error('[KV] Error in get:', error);
      return null;
    }
  },
  
  async set(key, value) {
    try {
      return await redis.set(key, value);
    } catch (error) {
      console.error('[KV] Error in set:', error);
      throw new Error('Failed to set value');
    }
  },
  
  async keys(pattern) {
    try {
      return await redis.keys(pattern);
    } catch (error) {
      console.error('[KV] Error in keys:', error);
      return [];
    }
  }
};

// 导出 Redis 实例，以便在需要时直接访问
export default redis;
