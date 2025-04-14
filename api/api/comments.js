import { kvClient } from '../lib/redis.js';
import { validateRequired, validateComment, validateUsername } from '../lib/validation.js';

// 处理评论请求
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
    // GET 请求处理获取评论
    if (req.method === 'GET') {
      const { pageId } = req.query;
      
      // 验证输入
      if (!pageId) {
        return res.status(400).json({ message: 'PageId is required' });
      }

      const comments = await kvClient.lrange(`comments:${pageId}`, 0, -1);
      return res.json(comments);
    }

    // POST 请求处理添加评论
    if (req.method === 'POST') {
      const { pageId, text, username } = req.body;
      
      try {
        // 验证输入
        validateRequired(req.body, ['pageId', 'text'], 'PageId and text are required');
        validateComment(text);
        if (username) validateUsername(username);
      } catch (validationError) {
        return res.status(400).json({ message: validationError.message });
      }

      const comment = {
        id: Date.now().toString(),
        text,
        username: username || 'Anonymous',
        timestamp: new Date().toISOString()
      };
      
      await kvClient.lpush(`comments:${pageId}`, JSON.stringify(comment));
      console.log(`[API] New comment added for ${pageId}, id: ${comment.id}`);
      
      return res.status(201).json(comment);
    }

    // 如果不是支持的方法，返回 405
    return res.status(405).json({
      message: `Method ${req.method} not allowed. Supported methods are GET, POST, OPTIONS.`
    });
  } catch (error) {
    console.error(`[API] Error in comments ${req.method} handler:`, error);
    return res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
