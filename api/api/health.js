import redis from '../lib/redis.js';

// 健康检查端点
export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({
      message: `Method ${req.method} not allowed. Supported methods are GET, OPTIONS.`
    });
  }

  try {
    // 测试 Redis 连接
    const redisStatus = await redis.ping()
      .then(() => 'ok')
      .catch((error) => {
        console.error('[API] Redis connection error:', error);
        return 'error';
      });
    
    // 返回健康状态
    return res.json({
      status: 'ok',
      redis: redisStatus,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    console.error('[API] Health check error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
