/**
 * 日志模块
 * 提供统一的日志记录功能
 */

// 日志级别
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// 当前环境
const isDev = process.env.NODE_ENV === 'development';

// 格式化日志消息
const formatLogMessage = (level, message, context = {}) => {
  const timestamp = new Date().toISOString();
  const contextStr = Object.keys(context).length > 0 
    ? ` | ${JSON.stringify(context)}`
    : '';
  
  return `[${timestamp}] [${level}] ${message}${contextStr}`;
};

// 日志记录器
const logger = {
  error(message, error = null, context = {}) {
    const errorContext = error ? {
      ...context,
      errorName: error.name,
      errorMessage: error.message,
      ...(isDev && { stack: error.stack })
    } : context;
    
    console.error(formatLogMessage(LOG_LEVELS.ERROR, message, errorContext));
  },
  
  warn(message, context = {}) {
    console.warn(formatLogMessage(LOG_LEVELS.WARN, message, context));
  },
  
  info(message, context = {}) {
    console.log(formatLogMessage(LOG_LEVELS.INFO, message, context));
  },
  
  debug(message, context = {}) {
    if (isDev) {
      console.log(formatLogMessage(LOG_LEVELS.DEBUG, message, context));
    }
  },
  
  // 请求日志中间件
  requestLogger(req, res, next) {
    const startTime = Date.now();
    
    // 请求完成后记录
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const logContext = {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip || req.headers['x-forwarded-for'] || 'unknown'
      };
      
      if (res.statusCode >= 400) {
        logger.warn(`HTTP ${res.statusCode}`, logContext);
      } else {
        logger.info(`HTTP ${res.statusCode}`, logContext);
      }
    });
    
    next();
  }
};

export default logger;
