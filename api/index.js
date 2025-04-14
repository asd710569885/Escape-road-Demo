import 'dotenv/config';
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import {
  adminLogin,
  verifyAdminToken,
  changeAdminPassword,
  getAllComments,
  deleteCommentById
} from './admin.js';

// 导入共享模块
import redis, { kvClient } from './lib/redis.js';
import logger from './lib/logger.js';
import { ErrorTypes, errorMiddleware, asyncHandler } from './lib/error-handler.js';
import { validateRequired, validateRating, validateComment, validateUsername } from './lib/validation.js';

const app = express();
const PORT = process.env.PORT || 3000;

// 基本中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 添加请求日志中间件
app.use(logger.requestLogger);

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
  handler: (_, res) => {
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

// 评分统计计算 - 保留供将来使用
/*
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
*/

// API 路由
// 获取评论
app.get('/api/comments', getLimiter, asyncHandler(async (req, res) => {
  const { pageId } = req.query;

  // 验证输入
  if (!pageId) {
    throw ErrorTypes.BAD_REQUEST('PageId is required');
  }

  const comments = await kvClient.lrange(`comments:${pageId}`, 0, -1);
  res.json(comments);
}));

// 添加评论
app.post('/api/comments', commentLimiter, asyncHandler(async (req, res) => {
  const { pageId, text, username } = req.body;

  // 验证输入
  validateRequired(req.body, ['pageId', 'text'], 'PageId and text are required');
  validateComment(text);
  if (username) validateUsername(username);

  const comment = {
    id: Date.now().toString(),
    text,
    username: username || 'Anonymous',
    timestamp: new Date().toISOString()
  };

  await kvClient.lpush(`comments:${pageId}`, JSON.stringify(comment));
  logger.info('新评论已添加', { pageId, commentId: comment.id });
  res.status(201).json(comment);
}));

// 获取评分
app.get('/api/ratings', getLimiter, asyncHandler(async (req, res) => {
  const { pageId } = req.query;

  // 验证输入
  if (!pageId) {
    throw ErrorTypes.BAD_REQUEST('Page ID is required');
  }

  const key = `ratings:${pageId}`;
  const ratingData = await kvClient.get(key) || { total: 0, count: 0 };

  res.json({
    average: ratingData.count > 0 ? ratingData.total / ratingData.count : 0,
    count: ratingData.count
  });
}));

// 提交评分
app.post('/api/ratings', ratingLimiter, asyncHandler(async (req, res) => {
  const { pageId, rating } = req.body;

  // 验证输入
  validateRequired(req.body, ['pageId', 'rating'], 'PageId and rating are required');
  validateRating(rating);

  const key = `ratings:${pageId}`;
  const ratingData = await kvClient.get(key) || { total: 0, count: 0 };

  ratingData.total = (ratingData.total || 0) + Number(rating);
  ratingData.count = (ratingData.count || 0) + 1;

  await kvClient.set(key, ratingData);

  logger.info('新评分已提交', { pageId, rating, newAverage: ratingData.total / ratingData.count });

  res.json({
    average: ratingData.total / ratingData.count,
    count: ratingData.count
  });
}));

// 管理员登录路由
app.post('/api/admin/login', adminLogin);
app.post('/api/admin/change-password', verifyAdminToken, changeAdminPassword);

// 管理员评论管理路由 (受保护)
app.get('/api/admin/comments', verifyAdminToken, getAllComments);
app.delete('/api/admin/comments/:pageId/:commentId', verifyAdminToken, deleteCommentById);

// 受保护的管理员路由
app.get('/api/admin/protected', verifyAdminToken, asyncHandler(async (_, res) => {
  res.json({ message: '已通过验证的管理员路由' });
}));

// --- Removed Debug API Endpoint ---
// app.get('/api/debug/view-data', ...) // Removed

// --- Server Export ---
export default app;

app.listen(PORT, () => {
  console.log(`[API] Server running on port ${PORT}`);
});

// 使用统一的错误处理中间件
app.use(errorMiddleware);

// 404 处理
app.use((_, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// 添加一个测试端点
app.get('/api/health', asyncHandler(async (_, res) => {
  // 测试 Redis 连接
  const redisStatus = await redis.ping().then(() => 'ok').catch(() => 'error');

  res.json({
    status: 'ok',
    redis: redisStatus,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
}));
