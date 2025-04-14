/**
 * 标准化错误处理模块
 * 提供统一的错误处理方法和错误响应格式
 */

// 自定义API错误类
export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 常见错误类型
export const ErrorTypes = {
  BAD_REQUEST: (message = 'Bad Request', details = null) => 
    new ApiError(400, message, details),
  
  UNAUTHORIZED: (message = 'Unauthorized', details = null) => 
    new ApiError(401, message, details),
  
  FORBIDDEN: (message = 'Forbidden', details = null) => 
    new ApiError(403, message, details),
  
  NOT_FOUND: (message = 'Not Found', details = null) => 
    new ApiError(404, message, details),
  
  RATE_LIMITED: (message = 'Too Many Requests', details = null) => 
    new ApiError(429, message, details),
  
  INTERNAL_ERROR: (message = 'Internal Server Error', details = null) => 
    new ApiError(500, message, details),
};

// Express 错误处理中间件
export const errorMiddleware = (err, req, res, next) => {
  // 记录错误
  console.error(`[ERROR] ${err.name}: ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  // 确定状态码和响应
  const statusCode = err instanceof ApiError 
    ? err.statusCode 
    : 500;
  
  const errorResponse = {
    error: {
      message: err.message || 'Internal Server Error',
      ...(err.details && { details: err.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  };

  // 发送响应
  res.status(statusCode).json(errorResponse);
};

// 异步路由处理包装器
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 导出默认对象
export default {
  ApiError,
  ErrorTypes,
  errorMiddleware,
  asyncHandler
};
