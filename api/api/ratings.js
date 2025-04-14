import { kvClient } from '../lib/redis.js';
import { validateRequired, validateRating } from '../lib/validation.js';

// 处理评分提交
export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // GET 请求处理获取评分
    if (req.method === 'GET') {
      const { pageId } = req.query;

      // 验证输入
      if (!pageId) {
        return res.status(400).json({ message: 'Page ID is required' });
      }

      const key = `ratings:${pageId}`;
      const ratingData = await kvClient.get(key) || { total: 0, count: 0 };

      return res.json({
        average: ratingData.count > 0 ? ratingData.total / ratingData.count : 0,
        count: ratingData.count
      });
    }

    // POST 请求处理提交评分
    if (req.method === 'POST') {
      const { pageId, rating } = req.body;

      try {
        // 验证输入
        validateRequired(req.body, ['pageId', 'rating'], 'PageId and rating are required');
        validateRating(rating);
      } catch (validationError) {
        return res.status(400).json({ message: validationError.message });
      }

      const key = `ratings:${pageId}`;
      const ratingData = await kvClient.get(key) || { total: 0, count: 0 };

      ratingData.total = (ratingData.total || 0) + Number(rating);
      ratingData.count = (ratingData.count || 0) + 1;

      await kvClient.set(key, ratingData);

      return res.json({
        average: ratingData.total / ratingData.count,
        count: ratingData.count
      });
    }

    // 如果不是支持的方法，返回 405
    return res.status(405).json({
      message: `Method ${req.method} not allowed. Supported methods are GET, POST, OPTIONS.`
    });
  } catch (error) {
    console.error(`[API] Error in ratings ${req.method} handler:`, error);
    return res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}