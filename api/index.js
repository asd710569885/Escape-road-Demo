import 'dotenv/config';
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import { Redis } from '@upstash/redis';
import { 
  adminLogin, 
  verifyAdminToken, 
  changeAdminPassword, 
  getAllComments, 
  deleteCommentById 
} from './admin.js'

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
const kvClient = {
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
  }
};

console.log("[API] Connected to Upstash KV");

const app = express();
const PORT = process.env.PORT || 3000;

// 基本中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS 配置
app.use(cors({
  origin: [
    'http://localhost:5174',
    'http://localhost:3000',
    'https://escape-road-demo-01.vercel.app',
    /\.vercel\.app$/
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 添加预检请求处理
app.options('*', cors());

// Rate Limiters
const keyGenerator = (req) => {
  const pageId = req.method === 'POST' ? req.body?.pageId : req.query?.pageId;
  const ip = req.ip || 'unknown_ip';
  return `${ip}-${pageId || 'unknown_page'}`;
};

const createLimiter = (message, max = 1) => rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: max,
  keyGenerator: keyGenerator,
  handler: (req, res) => {
    res.status(429).json({ 
      message,
      retryAfter: Math.ceil(60 - (Date.now() % 60000) / 1000) // 返回需要等待的秒数
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const commentLimiter = createLimiter('You can only post one comment per game every minute.');
const ratingLimiter = createLimiter('You can only submit one rating per game every minute.'); // 改回每分钟1次
const getLimiter = createLimiter('Too many requests, please try again later.', 30);

// 评分统计计算
const calculateRatingStats = (ratingCounts) => {
  let totalScore = 0;
  let count = 0;
  const safeRatingCounts = (typeof ratingCounts === 'object' && ratingCounts !== null) ? ratingCounts : {};

  for (let i = 1; i <= 5; i++) {
    const key = String(i);
    const numRatings = parseInt(safeRatingCounts[key] || 0, 10);
    if (!isNaN(numRatings) && numRatings > 0) {
      totalScore += numRatings * i;
      count += numRatings;
    }
  }
  const average = count > 0 ? totalScore / count : 0;
  return { average: parseFloat(average.toFixed(1)), count };
};

// API 路由
// 获取评论
app.get('/api/comments', getLimiter, async (req, res) => {
  const pageId = req.query.pageId;
  if (!pageId) {
    return res.status(400).json({ message: 'PageId is required' });
  }

  try {
    const comments = await kvClient.lrange(`comments:${pageId}`, 0, -1);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

// 添加评论
app.post('/api/comments', commentLimiter, async (req, res) => {
  const { pageId, text, username } = req.body;
  if (!pageId || !text) {
    return res.status(400).json({ message: 'PageId and text are required' });
  }

  try {
    const comment = {
      id: Date.now().toString(),
      text,
      username: username || 'Anonymous',
      timestamp: new Date().toISOString()
    };
    await kvClient.lpush(`comments:${pageId}`, JSON.stringify(comment));
    res.json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

// 获取评分
app.get('/api/ratings', getLimiter, async (req, res) => {
  try {
    const { pageId } = req.query;
    if (!pageId) {
      return res.status(400).json({ message: 'Page ID is required' });
    }

    const key = `ratings:${pageId}`;
    const ratingData = await redis.get(key) || { total: 0, count: 0 };
    
    res.json({
      average: ratingData.count > 0 ? ratingData.total / ratingData.count : 0,
      count: ratingData.count
    });
  } catch (error) {
    console.error('Get rating error:', error);
    res.status(500).json({ message: 'Failed to get rating' });
  }
});

// 提交评分
app.post('/api/ratings', ratingLimiter, async (req, res) => {
  try {
    const { pageId, rating } = req.body;
    if (!pageId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Invalid rating data' });
    }

    const key = `ratings:${pageId}`;
    const ratingData = await redis.get(key) || { total: 0, count: 0 };
    
    ratingData.total = (ratingData.total || 0) + rating;
    ratingData.count = (ratingData.count || 0) + 1;
    
    await redis.set(key, ratingData);
    
    res.json({
      average: ratingData.total / ratingData.count,
      count: ratingData.count
    });
  } catch (error) {
    console.error('Rating error:', error);
    res.status(500).json({ message: 'Failed to submit rating' });
  }
});

// 管理员登录路由
app.post('/api/admin/login', adminLogin);
app.post('/api/admin/change-password', verifyAdminToken, changeAdminPassword);

// 管理员评论管理路由 (受保护)
app.get('/api/admin/comments', verifyAdminToken, getAllComments);
app.delete('/api/admin/comments/:pageId/:commentId', verifyAdminToken, deleteCommentById);

// 受保护的管理员路由
app.get('/api/admin/protected', verifyAdminToken, (req, res) => {
  res.json({ message: '已通过验证的管理员路由' });
});

// --- Removed Debug API Endpoint ---
// app.get('/api/debug/view-data', ...) // Removed

// --- Server Export ---
export default app;

app.listen(PORT, () => {
  console.log(`[API] Server running on port ${PORT}`);
});
