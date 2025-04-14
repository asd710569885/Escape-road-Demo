import { kv } from "@vercel/kv";
import { adminLogin, verifyAdminToken, changeAdminPassword, getAllComments, deleteCommentById } from '../admin.js';

// 处理管理员登录请求
export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 根据路径和方法分发请求
    const path = req.url.split('/').filter(Boolean);
    
    // 移除 'api' 和 'admin' 前缀
    if (path[0] === 'api' && path[1] === 'admin') {
      path.splice(0, 2);
    } else if (path[0] === 'admin') {
      path.splice(0, 1);
    }
    
    // 登录请求
    if (path.length === 0 && req.method === 'POST') {
      return await adminLogin(req, res);
    }
    
    // 修改密码请求
    if (path[0] === 'change-password' && req.method === 'POST') {
      // 验证令牌中间件
      try {
        await verifyAdminToken(req, res, () => {});
        return await changeAdminPassword(req, res);
      } catch (error) {
        return res.status(401).json({ message: '认证失败' });
      }
    }
    
    // 获取所有评论
    if (path[0] === 'comments' && req.method === 'GET') {
      try {
        await verifyAdminToken(req, res, () => {});
        return await getAllComments(req, res);
      } catch (error) {
        return res.status(401).json({ message: '认证失败' });
      }
    }
    
    // 删除评论
    if (path[0] === 'comments' && path.length === 3 && req.method === 'DELETE') {
      try {
        req.params = {
          pageId: path[1],
          commentId: path[2]
        };
        await verifyAdminToken(req, res, () => {});
        return await deleteCommentById(req, res);
      } catch (error) {
        return res.status(401).json({ message: '认证失败' });
      }
    }
    
    // 受保护的测试路由
    if (path[0] === 'protected' && req.method === 'GET') {
      try {
        await verifyAdminToken(req, res, () => {});
        return res.json({ message: '已通过验证的管理员路由' });
      } catch (error) {
        return res.status(401).json({ message: '认证失败' });
      }
    }

    // 如果没有匹配的路由，返回 404
    return res.status(404).json({
      message: `Route not found: ${req.url}`
    });
  } catch (error) {
    console.error(`[API] Error in admin handler:`, error);
    return res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
