import { Redis } from '@upstash/redis';

// 创建 Upstash Redis 客户端
const redis = new Redis({
  url: process.env.KV_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// 处理评分提交
export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET 请求处理获取评分
  if (req.method === 'GET') {
    try {
      const { pageId } = req.query;
      if (!pageId) {
        return res.status(400).json({ message: 'Page ID is required' });
      }

      const key = `ratings:${pageId}`;
      const ratingData = await redis.get(key) || { total: 0, count: 0 };
      
      return res.json({
        average: ratingData.count > 0 ? ratingData.total / ratingData.count : 0,
        count: ratingData.count
      });
    } catch (error) {
      console.error('Get rating error:', error);
      return res.status(500).json({ message: 'Failed to get rating' });
    }
  }

  // POST 请求处理提交评分
  if (req.method === 'POST') {
    try {
      const { pageId, rating } = req.body;
      
      // 添加请求体解析日志
      console.log('Received POST request body:', req.body);
      
      if (!pageId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Invalid rating data' });
      }

      const key = `ratings:${pageId}`;
      const ratingData = await redis.get(key) || { total: 0, count: 0 };
      
      ratingData.total = (ratingData.total || 0) + rating;
      ratingData.count = (ratingData.count || 0) + 1;
      
      await redis.set(key, ratingData);
      
      return res.json({
        average: ratingData.total / ratingData.count,
        count: ratingData.count
      });
    } catch (error) {
      console.error('Rating error:', error);
      return res.status(500).json({ message: 'Failed to submit rating' });
    }
  }

  // 如果不是支持的方法，返回 405
  return res.status(405).json({ 
    message: `Method ${req.method} not allowed. Supported methods are GET, POST, OPTIONS.` 
  });
} 