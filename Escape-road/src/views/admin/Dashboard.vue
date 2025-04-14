<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1>管理面板</h1>
      <button @click="handleLogout" class="logout-btn">退出登录</button>
    </header>
    <div class="dashboard-content">
      <h2>评论管理</h2>
      <div v-if="loading" class="loading">正在加载评论...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else>
        <div v-if="Object.keys(comments).length === 0">
          <p>暂无评论。</p>
        </div>
        <div v-for="(gameComments, pageId) in comments" :key="pageId" class="game-comments">
          <h3>{{ pageId }}</h3>
          <ul v-if="gameComments.length > 0" class="comment-list">
            <li v-for="comment in gameComments" :key="comment.id" class="comment-item">
              <div class="comment-info">
                <div class="comment-meta">
                  <strong>{{ comment.name }}</strong>
                  <span class="timestamp">({{ new Date(comment.timestamp).toLocaleString() }})</span>
                  <span v-if="comment.email" class="email"> - {{ comment.email }}</span>
                </div>
                <p class="comment-text">{{ comment.text }}</p>
              </div>
              <button @click="handleDeleteComment(pageId, comment.id)" class="delete-btn">删除</button>
            </li>
          </ul>
          <p v-else>此游戏暂无评论。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'AdminDashboard',
  setup() {
    const router = useRouter()
    const comments = ref({}) // 存储所有评论，按 pageId 分组
    const loading = ref(true)
    const error = ref('')
    let adminToken = ''

    // 获取所有评论
    const fetchComments = async () => {
      try {
        loading.value = true
        error.value = ''
        const response = await fetch('/api/admin/comments', {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        })

        if (!response.ok) {
          if (response.status === 401) {
             router.push('/admin/login') // Token 无效或过期，跳转登录
             return
          }
          const data = await response.json()
          throw new Error(data.message || '获取评论失败')
        }
        comments.value = await response.json()
      } catch (err) {
        console.error('获取评论时出错:', err)
        error.value = err.message || '加载评论时出错'
      } finally {
        loading.value = false
      }
    }

    // 删除评论
    const handleDeleteComment = async (pageId, commentId) => {
      console.log(`[删除请求] Page ID: ${pageId}, Comment ID: ${commentId}`);
      if (!confirm('确定要删除这条评论吗？')) {
        return
      }
      try {
        const response = await fetch(`/api/admin/comments/${pageId}/${commentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        })
        const data = await response.json()
        console.log('[删除响应] Status:', response.status, 'Data:', data);
        if (!response.ok) {
          throw new Error(data.message || '删除评论失败')
        }
        alert(data.message || '评论删除成功')
        // 刷新评论列表
        await fetchComments()
      } catch (err) {
        console.error('删除评论时出错:', err)
        alert(err.message || '删除评论时出错')
      }
    }

    // 退出登录
    const handleLogout = () => {
      localStorage.removeItem('admin_token')
      router.push('/admin/login')
    }

    onMounted(() => {
      adminToken = localStorage.getItem('admin_token')
      if (!adminToken) {
        router.push('/admin/login')
      } else {
        fetchComments() // 获取评论数据
      }
    })

    return {
      comments,
      loading,
      error,
      handleLogout,
      handleDeleteComment
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #c82333;
}

.dashboard-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading, .error {
  text-align: center;
  padding: 2rem;
}

.error {
  color: red;
}

.game-comments {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.game-comments:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.game-comments h3 {
  margin-bottom: 1rem;
}

.comment-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.comment-item {
  display: flex;
  justify-content: space-between;
  align-items: center; /* 垂直居中对齐 */
  padding: 0.6rem 1rem; /* 减少垂直内边距 */
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  margin-bottom: 0.4rem; /* 减少项间距 */
  background-color: #fafafa;
}

.comment-info {
  flex-grow: 1;
  margin-right: 1rem; /* 与删除按钮的间距 */
}

.comment-meta {
  font-size: 0.85em; /* 缩小元信息字体 */
  color: #666;
  margin-bottom: 0.2rem; /* 与评论内容的间距 */
}

.comment-meta strong {
  color: #333;
  margin-right: 0.5em;
}

.comment-meta .timestamp {
  margin-right: 0.5em;
}

.comment-meta .email {
  font-style: italic;
}

.comment-text {
  margin: 0; /* 移除默认的 p 标签边距 */
  color: #333;
  font-size: 0.95em; /* 轻微缩小评论内容字体 */
  line-height: 1.4; /* 调整行高 */
  white-space: pre-wrap; /* 保留换行 */
  word-break: break-word; /* 确保长单词换行 */
}

.delete-btn {
  padding: 0.25rem 0.5rem; /* 缩小按钮内边距 */
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.75em; /* 缩小按钮字体 */
  transition: background-color 0.2s;
  white-space: nowrap;
  flex-shrink: 0; /* 防止按钮被压缩 */
}

.delete-btn:hover {
  background-color: #d9363e;
}
</style> 