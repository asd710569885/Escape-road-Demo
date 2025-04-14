/**
 * 安全模块
 * 提供认证和授权相关功能
 */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { ErrorTypes } from './error-handler.js';

// 获取 JWT 密钥，确保在生产环境中设置
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('警告: JWT_SECRET 环境变量未设置，使用随机生成的密钥');
    // 在没有设置环境变量的情况下，生成随机密钥
    // 注意：这会导致服务重启后所有令牌失效
    return require('crypto').randomBytes(32).toString('hex');
  }
  return secret;
};

// JWT 配置
const JWT_SECRET = getJwtSecret();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// 生成 JWT 令牌
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// 验证 JWT 令牌
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw ErrorTypes.UNAUTHORIZED('Invalid or expired token');
  }
};

// 从请求头中提取令牌
export const extractTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw ErrorTypes.UNAUTHORIZED('No authorization header provided');
  }
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw ErrorTypes.UNAUTHORIZED('Invalid authorization header format');
  }
  
  return parts[1];
};

// 密码哈希
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12); // 增加到12轮
};

// 验证密码
export const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// 认证中间件
export const authMiddleware = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req);
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

// 角色验证中间件
export const roleMiddleware = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ErrorTypes.UNAUTHORIZED('User not authenticated'));
    }
    
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return next(ErrorTypes.FORBIDDEN('Insufficient permissions'));
    }
    
    next();
  };
};

export default {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  hashPassword,
  verifyPassword,
  authMiddleware,
  roleMiddleware
};
