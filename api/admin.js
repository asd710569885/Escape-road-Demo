import { kv } from "@vercel/kv"
import logger from './lib/logger.js'
import { ErrorTypes } from './lib/error-handler.js'
import { hashPassword, verifyPassword, generateToken } from './lib/security.js'
import { validateRequired, validatePassword } from './lib/validation.js'

// 初始化管理员账户函数
const initializeAdmin = async () => {
  try {
    // 检查是否已存在管理员账户
    const adminExists = await kv.hget('admin:users', 'admin')

    // 如果管理员账户不存在，创建默认账户
    if (!adminExists) {
      // 从环境变量获取初始密码，如果未设置则使用随机密码
      const initialPassword = process.env.ADMIN_INITIAL_PASSWORD ||
        require('crypto').randomBytes(8).toString('hex');

      const hashedPassword = await hashPassword(initialPassword)
      const adminData = {
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date().toISOString()
      }

      await kv.hset('admin:users', {
        'admin': adminData
      })

      // 记录初始密码（仅在首次创建时）
      if (process.env.NODE_ENV === 'development') {
        logger.info(`默认管理员账户创建成功，初始密码: ${initialPassword}`);
      } else {
        logger.info('默认管理员账户创建成功，请立即修改默认密码');
      }
    }
  } catch (error) {
    logger.error('初始化管理员账户时出错', error);
  }
}

// 启动时初始化管理员账户
initializeAdmin().catch(error => logger.error('初始化管理员账户失败', error));

// 管理员登录处理函数
export const adminLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body

    // 验证输入
    validateRequired(req.body, ['username', 'password'], '请输入用户名和密码');

    // 获取管理员信息
    const admin = await kv.hget('admin:users', username)

    // 用户不存在或密码错误 - 使用相同的错误消息增强安全性
    if (!admin) {
      throw ErrorTypes.UNAUTHORIZED('用户名或密码错误');
    }

    // 验证密码
    const isValidPassword = await verifyPassword(password, admin.password);
    if (!isValidPassword) {
      // 记录失败的登录尝试，但返回相同的错误消息
      logger.warn('登录失败: 密码错误', { username });
      throw ErrorTypes.UNAUTHORIZED('用户名或密码错误');
    }

    // 生成 JWT token
    const token = generateToken({
      username: admin.username,
      role: admin.role
    });

    // 更新最后登录时间
    const updatedAdmin = {
      ...admin,
      lastLoginAt: new Date().toISOString()
    }

    await kv.hset('admin:users', {
      [username]: updatedAdmin
    })

    // 记录成功登录
    logger.info('管理员登录成功', { username });

    // 返回登录成功信息
    res.status(200).json({
      token,
      message: '登录成功'
    })
  } catch (error) {
    // 使用统一的错误处理
    next(error);
  }
}

// 修改管理员密码
export const changeAdminPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const username = req.user.username

    // 验证输入
    validateRequired(req.body, ['currentPassword', 'newPassword'], '当前密码和新密码都是必填项');
    validatePassword(newPassword);

    // 获取管理员信息
    const admin = await kv.hget('admin:users', username)
    if (!admin) {
      throw ErrorTypes.NOT_FOUND('管理员账户不存在');
    }

    // 验证当前密码
    const isValidPassword = await verifyPassword(currentPassword, admin.password);
    if (!isValidPassword) {
      throw ErrorTypes.UNAUTHORIZED('当前密码错误');
    }

    // 更新密码和更新时间
    const hashedPassword = await hashPassword(newPassword);
    const updatedAdmin = {
      ...admin,
      password: hashedPassword,
      updatedAt: new Date().toISOString()
    }

    await kv.hset('admin:users', {
      [username]: updatedAdmin
    })

    logger.info('管理员密码已更新', { username });
    res.status(200).json({ message: '密码修改成功' })
  } catch (error) {
    next(error);
  }
}

// JWT token 验证中间件
export const verifyAdminToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw ErrorTypes.UNAUTHORIZED('未提供认证令牌');
    }

    // 从 security 模块导入的 verifyToken 函数会验证令牌
    const decoded = await import('./lib/security.js').then(module => module.verifyToken(token));

    // 验证用户是否存在
    const admin = await kv.hget('admin:users', decoded.username);
    if (!admin) {
      throw ErrorTypes.UNAUTHORIZED('管理员账户不存在');
    }

    // 将用户信息添加到请求对象
    req.user = decoded;
    next();
  } catch (error) {
    // 使用统一的错误处理
    next(error);
  }
}

// 获取所有评论
export const getAllComments = async (req, res, next) => {
  try {
    const commentKeys = await kv.keys('comments:*')
    const allComments = {}

    for (const key of commentKeys) {
      const pageId = key.replace('comments:', '')
      const rawDataList = await kv.lrange(key, 0, -1)
      allComments[pageId] = rawDataList.map((rawData, index) => {
        try {
          // 检查 rawData 是否已经是对象 (可能由 @vercel/kv 预解析)
          if (typeof rawData === 'object' && rawData !== null) {
            // 基础验证: 确保有 id 和 text 字段
            if (typeof rawData.id !== 'undefined' && typeof rawData.text !== 'undefined') {
              return rawData;
            } else {
              logger.warn('预解析的对象缺少必要字段', { key, index, rawData });
              return null;
            }
          }
          // 如果是字符串，尝试解析
          else if (typeof rawData === 'string') {
            const cleanedStr = rawData.trim().replace(/^\ufeff/, ''); // 移除 BOM 和空格
            if (cleanedStr) {
              const parsedComment = JSON.parse(cleanedStr);
              // 基础验证: 确保有 id 和 text 字段
              if (typeof parsedComment.id !== 'undefined' && typeof parsedComment.text !== 'undefined') {
                return parsedComment;
              } else {
                logger.warn('解析后的对象缺少必要字段', { key, index, parsedComment });
                return null;
              }
            } else {
              logger.warn('空字符串', { key, index });
              return null;
            }
          }
          // 处理其他意外类型
          else {
            logger.warn('意外的数据类型', { key, index, type: typeof rawData, rawData });
            return null;
          }
        } catch (e) {
          logger.error('解析评论失败', e, { key, index });
          return null; // 返回 null 表示解析失败
        }
      }).filter(c => c !== null); // 过滤掉解析失败或无效的评论
    }
    res.status(200).json(allComments);
  } catch (error) {
    next(error);
  }
}

// 按 ID 删除评论 (使用基于索引的方法)
export const deleteCommentById = async (req, res, next) => {
  let listKey = '';
  let indexToDelete = -1;

  try {
    const { pageId, commentId } = req.params;
    if (!pageId || !commentId) {
      throw ErrorTypes.BAD_REQUEST('页面ID和评论ID都是必需的');
    }

    listKey = `comments:${pageId}`;
    logger.info('收到删除评论请求', { listKey, commentId });

    // 从 Redis 获取评论列表
    const rawComments = await kv.lrange(listKey, 0, -1);
    if (!rawComments || rawComments.length === 0) {
      throw ErrorTypes.NOT_FOUND(`未找到页面 ${pageId} 的评论`);
    }

    logger.debug('开始遍历评论列表', { listKey, commentCount: rawComments.length });

    // 查找要删除的评论索引
    for (let i = 0; i < rawComments.length; i++) {
      const rawComment = rawComments[i];
      let parsedComment = null;

      try {
        // 尝试处理对象或解析字符串
        if (typeof rawComment === 'object' && rawComment !== null) {
          parsedComment = rawComment;
        } else if (typeof rawComment === 'string') {
          const cleanedStr = rawComment.trim().replace(/^\ufeff/, '');
          if (cleanedStr) {
            parsedComment = JSON.parse(cleanedStr);
          } else {
            continue; // 跳过空字符串
          }
        } else {
          continue; // 跳过其他无法处理的类型
        }

        if (!parsedComment || typeof parsedComment.id === 'undefined') {
           continue; // 跳过缺少 ID 的项
        }

        // 确保比较时类型一致
        if (String(parsedComment.id) === String(commentId)) {
          indexToDelete = i; // 找到索引！
          logger.info('找到要删除的评论', { listKey, commentId, index: indexToDelete });
          break;
        }
      } catch (e) {
        logger.error('处理评论时出错', e, { listKey, index: i });
      }
    }

    // 如果找到了要删除的评论的索引
    if (indexToDelete !== -1) {
      // 1. 使用 LSET 将该索引位置的值设置为一个唯一的占位符
      const placeholder = `__TO_DELETE__${Date.now()}`;
      logger.debug('设置删除占位符', { listKey, index: indexToDelete, placeholder });

      await kv.lset(listKey, indexToDelete, placeholder);

      // 2. 使用 LREM 删除所有等于该占位符的项 (通常只会有一个)
      const removedCount = await kv.lrem(listKey, 0, placeholder); // count = 0 表示删除所有匹配项

      if (removedCount > 0) {
        logger.info('评论删除成功', { listKey, commentId, removedCount });
        res.status(200).json({ message: '评论删除成功' });
      } else {
        // LSET 成功但 LREM 失败？这很奇怪，可能表示并发问题或 KV 异常
        logger.error('LREM 操作未能删除占位符', { listKey, placeholder, removedCount });
        throw ErrorTypes.INTERNAL_ERROR('评论删除过程中发生意外错误');
      }
    } else {
      logger.warn('未找到要删除的评论', { listKey, commentId });
      throw ErrorTypes.NOT_FOUND('未找到指定 ID 的评论');
    }
  } catch (error) {
    // 需要处理 LSET 可能抛出的索引越界错误 (虽然我们先检查了 indexToDelete !== -1)
    if (error.message && error.message.includes('index out of range')) {
       logger.warn('LSET 索引越界，可能评论已被并发删除', { listKey, index: indexToDelete });
       return res.status(404).json({ message: '评论可能已被删除' });
    }

    // 使用统一的错误处理
    next(error);
  }
}