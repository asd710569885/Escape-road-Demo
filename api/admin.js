import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { kv } from "@vercel/kv"

// JWT 密钥，生产环境应该使用环境变量配置
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// 初始化管理员账户函数
const initializeAdmin = async () => {
  try {
    // 检查是否已存在管理员账户
    const adminExists = await kv.hget('admin:users', 'admin')
    
    // 如果管理员账户不存在，创建默认账户
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10)
      const adminData = {
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date().toISOString()
      }
      
      await kv.hset('admin:users', {
        'admin': adminData
      })
      console.log('默认管理员账户创建成功')
    }
  } catch (error) {
    console.error('初始化管理员账户时出错:', error)
  }
}

// 启动时初始化管理员账户
initializeAdmin().catch(console.error)

// 管理员登录处理函数
export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body

    // 验证输入
    if (!username || !password) {
      return res.status(400).json({ message: '请输入用户名和密码' })
    }

    // 获取管理员信息
    const admin = await kv.hget('admin:users', username)

    // 用户不存在
    if (!admin) {
      return res.status(401).json({ message: '用户名或密码错误' })
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, admin.password)
    if (!isValidPassword) {
      return res.status(401).json({ message: '用户名或密码错误' })
    }

    // 生成 JWT token，有效期24小时
    const token = jwt.sign(
      { 
        username: admin.username,
        role: admin.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // 更新最后登录时间
    const updatedAdmin = {
      ...admin,
      lastLoginAt: new Date().toISOString()
    }
    
    await kv.hset('admin:users', {
      [username]: updatedAdmin
    })

    // 返回登录成功信息
    res.status(200).json({
      token,
      message: '登录成功'
    })
  } catch (error) {
    console.error('管理员登录出错:', error)
    res.status(500).json({ message: '服务器错误，请稍后重试' })
  }
}

// 修改管理员密码
export const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const username = req.user.username

    // 获取管理员信息
    const admin = await kv.hget('admin:users', username)
    if (!admin) {
      return res.status(404).json({ message: '管理员账户不存在' })
    }

    // 验证当前密码
    const isValidPassword = await bcrypt.compare(currentPassword, admin.password)
    if (!isValidPassword) {
      return res.status(401).json({ message: '当前密码错误' })
    }

    // 更新密码和更新时间
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    const updatedAdmin = {
      ...admin,
      password: hashedPassword,
      updatedAt: new Date().toISOString()
    }
    
    await kv.hset('admin:users', {
      [username]: updatedAdmin
    })

    res.status(200).json({ message: '密码修改成功' })
  } catch (error) {
    console.error('修改密码出错:', error)
    res.status(500).json({ message: '服务器错误' })
  }
}

// JWT token 验证中间件
export const verifyAdminToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: '未提供认证令牌' })
  }

  try {
    // 验证 token
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // 验证用户是否存在
    const admin = await kv.hget('admin:users', decoded.username)
    if (!admin) {
      return res.status(401).json({ message: '管理员账户不存在' })
    }

    // 将用户信息添加到请求对象
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ message: '无效的认证令牌' })
  }
}

// 获取所有评论
export const getAllComments = async (req, res) => {
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
              console.warn(`[Admin] getAllComments: 预解析的对象缺少必要字段 (${key}, index ${index}):`, rawData);
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
                 console.warn(`[Admin] getAllComments: 解析后的对象缺少必要字段 (${key}, index ${index}):`, parsedComment);
                 return null;
              }
            } else {
              console.warn(`[Admin] getAllComments: 空字符串 (${key}, index ${index})`);
              return null;
            }
          } 
          // 处理其他意外类型
          else {
            console.warn(`[Admin] getAllComments: 意外的数据类型 (${typeof rawData}) (${key}, index ${index}):`, rawData);
            return null;
          }
        } catch (e) {
          console.error(`[Admin] getAllComments: 解析评论失败 (${key}, index ${index}):`, rawData, e)
          return null // 返回 null 表示解析失败
        }
      }).filter(c => c !== null); // 过滤掉解析失败或无效的评论
    }
    res.status(200).json(allComments)
  } catch (error) {
    console.error('获取所有评论出错:', error)
    res.status(500).json({ message: '服务器错误' })
  }
}

// 按 ID 删除评论 (使用基于索引的方法)
export const deleteCommentById = async (req, res) => {
  try {
    const { pageId, commentId } = req.params
    const listKey = `comments:${pageId}`
    console.log(`[Admin] deleteCommentById: 收到删除请求 for ${listKey}, commentId: ${commentId}`);

    const rawComments = await kv.lrange(listKey, 0, -1)
    let indexToDelete = -1

    console.log(`[Admin] deleteCommentById: 开始遍历列表 ${listKey} (共 ${rawComments.length} 项) 寻找索引`);
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
          console.log(`[Admin] deleteCommentById: 找到匹配项 at index ${indexToDelete} in ${listKey}.`);
          break;
        }
      } catch (e) {
        console.error(`处理评论时出错 (${listKey}, Index: ${i}):`, rawComment, e)
      }
    }

    // 如果找到了要删除的评论的索引
    if (indexToDelete !== -1) {
      // 1. 使用 LSET 将该索引位置的值设置为一个唯一的占位符
      const placeholder = `__TO_DELETE__${Date.now()}`;
      console.log(`[Admin] deleteCommentById: 使用 LSET 在索引 ${indexToDelete} 处设置占位符: ${placeholder}`);
      await kv.lset(listKey, indexToDelete, placeholder);
      
      // 2. 使用 LREM 删除所有等于该占位符的项 (通常只会有一个)
      console.log(`[Admin] deleteCommentById: 使用 LREM 删除占位符: ${placeholder}`);
      const removedCount = await kv.lrem(listKey, 0, placeholder); // count = 0 表示删除所有匹配项
      
      if (removedCount > 0) {
        console.log(`[Admin] 评论已成功删除 (通过索引和占位符) (${listKey}, ID: ${commentId})`);
        res.status(200).json({ message: '评论删除成功' })
      } else {
        // LSET 成功但 LREM 失败？这很奇怪，可能表示并发问题或 KV 异常
        console.error(`[Admin] LSET 成功后 LREM 未能删除占位符 (${listKey}, Placeholder: ${placeholder})`);
        res.status(500).json({ message: '评论删除过程中发生意外错误' })
      }
    } else {
      console.log(`[Admin] 未在列表中找到要删除的评论 (${listKey}, ID: ${commentId})`);
      res.status(404).json({ message: '未找到指定 ID 的评论' })
    }
  } catch (error) {
    // 需要处理 LSET 可能抛出的索引越界错误 (虽然我们先检查了 indexToDelete !== -1)
    if (error.message && error.message.includes('index out of range')) {
       console.warn(`[Admin] LSET 索引越界 (${listKey}, Index: ${indexToDelete})，可能评论已被并发删除`);
       res.status(404).json({ message: '评论可能已被删除' });
    } else {
      console.error('删除评论出错:', error)
      res.status(500).json({ message: '服务器错误' })
    }
  }
} 