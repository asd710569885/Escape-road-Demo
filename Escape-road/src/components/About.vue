<template>
    <div class="about">
        <h2 class="below-title">{{ gameData.aboutTitle1 }}</h2>
        <div 
          class="about-content"
          :class="{ 'is-collapsed': !isExpanded }"
          ref="contentRef"
          :style="contentMaxHeightStyle"
          v-html="processedContent">
        </div>
        <button @click="toggleExpand" class="toggle-button">
            {{ isExpanded ? 'Show less' : 'Show More' }}
        </button>

        <!-- Comments 组件已移除 -->

    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { games } from '../data/games'
// import GameImage from './GameImage.vue'  // 移除未使用的导入
// import Comments from './Comments.vue' // 移除导入

const props = defineProps({
  gameId: {
    type: String,
    required: true,
    validator: (value) => {
      return Object.keys(games).includes(value)
    }
  }
})

// 获取当前游戏数据
const gameData = computed(() => {
  return games[props.gameId] || games.game1
})

// 处理内容中的图片路径
const processedContent = computed(() => {
  if (!gameData.value.aboutContent) return ''
  return gameData.value.aboutContent.replace(
    /@\/assets\/images\//g,
    '/images/'
  )
})

// 控制展开/收起的状态
const isExpanded = ref(false)
// 内容区域的 DOM 引用
const contentRef = ref(null)
// 动态计算的 max-height 样式
const contentMaxHeightStyle = ref({ maxHeight: '800px' }) // 初始折叠高度

// 切换展开/收起状态的函数
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// 监听 isExpanded 变化来更新 max-height
watch(isExpanded, async (newValue) => {
  await nextTick(); // 等待 DOM 更新
  if (contentRef.value) {
    if (newValue) {
      // 展开时，设置为内容的实际滚动高度
      contentMaxHeightStyle.value = { maxHeight: `${contentRef.value.scrollHeight}px` };
    } else {
      // 收起时，恢复初始高度
      contentMaxHeightStyle.value = { maxHeight: '800px' }; // 确保与 CSS 初始值一致
    }
  }
}, { immediate: false }) // immediate: false 避免初始计算问题

// 监听 gameId 变化，重置展开状态和高度
watch(() => props.gameId, () => {
  isExpanded.value = false; // 切换游戏时总是折叠
  contentMaxHeightStyle.value = { maxHeight: '800px' }; // 重置高度
}, { immediate: true })

</script>

<style scoped>
.about {
    width: 47%;
    border: 5px solid #00d9ff;
    border-radius: 20px;
    background-color: #fff;
    padding: 20px;
    overflow: hidden; /* 保持 overflow hidden */
    position: relative; /* 用于按钮定位和伪元素 */
}

.about .below-title {
    text-align: center;
    margin-bottom: 15px;
}

.about-content {
    overflow: hidden; /* 隐藏超出部分 */
    transition: max-height 0.5s ease-out; /* 平滑过渡效果 */
    position: relative; /* 用于伪元素定位 */
    padding-bottom: 30px; /* 为按钮和渐变留出空间 */
}

/* 折叠时的样式 */
.about-content.is-collapsed {
    /* max-height 由 JS 控制 */
    /* 添加底部渐变效果，提示有更多内容 */
    position: relative;
}

.about-content.is-collapsed::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px; /* 渐变高度 */
    background: linear-gradient(to bottom, transparent, white);
    pointer-events: none; /* 允许点击穿透 */
}

.toggle-button {
    display: block; /* 让按钮独占一行 */
    margin: 15px auto 0; /* 上方间距，水平居中 */
    padding: 8px 16px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.toggle-button:hover {
    background-color: #2980b9;
}

/* v-html 内容样式 */
.about-content :deep(h3) {
    margin-bottom: 15px;
}

.about-content :deep(h4) {
    margin-bottom: 15px;
}

.about-content :deep(p) {
    margin-bottom: 15px;
    line-height: 1.8;
}

.about-content :deep(ul) {
    margin-bottom: 15px;
    line-height: 1.8;
    padding-left: 20px;
}

.about-content :deep(img) {
    margin-bottom: 15px;
    max-width: 100%;
}

.about-content :deep(img.game-content-image) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1rem 0;
    display: block;
}

/* 添加手机端样式 */
@media (max-width: 768px) {
  .about {
    width: 100%; 
    max-width: 500px; 
    padding: 15px; /* 减小内边距 */
  }
  .about .below-title {
    font-size: 1.1rem; /* 缩小标题字体 */
    margin-bottom: 10px;
  }
  /* 缩小 v-html 内容字体 */
  .about-content :deep(h3) {
      font-size: 1rem; /* 调整标题大小 */
      margin-bottom: 10px;
  }
  .about-content :deep(h4) {
      font-size: 0.9rem; /* 调整标题大小 */
      margin-bottom: 10px;
  }
  .about-content :deep(p),
  .about-content :deep(ul) {
    font-size: 0.9rem; /* 调整段落和列表字体 */
    line-height: 1.7;
    margin-bottom: 10px;
  }
  .about-content :deep(ul) {
      padding-left: 15px; /* 调整列表缩进 */
  }
  .toggle-button {
      padding: 6px 12px;
      font-size: 0.9rem; /* 调整按钮字体 */
  }
}

/* 移除之前为评论区添加的样式 */
/* .about > :deep(.comments-section) {
    margin-top: 2rem;
} */

</style>
