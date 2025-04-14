<template>
  <main>
    <Headers :game-id="currentGameId" />
    <section>
      <div class="container" :style="{ background: gameData.background }">
        <div class="game-wrap">
          <div class="game-list">
            <div class="list-left">
              <div class="cr-item" v-for="game in leftGames" :key="game.id">
                <router-link :to="'/' + game.addressBar">
                  <img :src="getImageUrl(game.image)" :title="game.title" :alt="game.title" />
                  <p class="mask">{{ game.logoText }}</p>
                </router-link>
              </div>
            </div>
            <div class="content-center">
              <GameMain :game-id="currentGameId" :key="currentGameId" />
            </div>
            <div class="list-right">
              <div class="cr-item" v-for="game in rightGames" :key="game.id">
                <router-link :to="'/' + game.addressBar">
                  <img :src="getImageUrl(game.image)" :title="game.title" :alt="game.title" />
                  <p class="mask">{{ game.logoText }}</p>
                </router-link>
              </div>
            </div>
          </div>
        </div>
        <div class="below">
          <About :game-id="currentGameId" />
          <Recommend :game-id="currentGameId" />
        </div>
      </div>
    </section>
    <Foot />
  </main>
</template>

<script setup>
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { games } from '../data/games'
import Headers from '../components/Head.vue'
import About from '../components/About.vue'
import Recommend from '../components/Recommend.vue'
import GameMain from '../components/GameMain.vue'
import Foot from '../components/foot.vue'

// 获取当前路由实例
const route = useRoute()

/**
 * 根据 addressBar 查找游戏ID
 * @param {string} addressBarParam - URL中的 addressBar 参数
 * @returns {string} 游戏ID
 */
const findGameIdByAddressBar = (addressBarParam) => {
  const lowerAddressBarParam = addressBarParam?.toLowerCase();
  if (!lowerAddressBarParam) return 'game1';
  return Object.keys(games).find(id => 
    games[id].addressBar?.toLowerCase() === lowerAddressBarParam
  ) || 'game1'
}

// 获取当前游戏ID - 基于路由的 addressBar 参数
const currentGameId = computed(() => {
  const addressBarParam = route.params.addressBar
  return addressBarParam ? findGameIdByAddressBar(addressBarParam) : 'game1'
})

// 获取当前游戏数据 - 确保包含 addressBar
const gameData = computed(() => {
  const game = games[currentGameId.value]
  return {
    id: game.id,
    title: game.title,
    logoText: game.logoText,
    addressBar: game.addressBar, // 确保获取 addressBar
    image: game.image,
    iframeUrl: game.iframeUrl,
    description: game.description,
    keywords: game.keywords,
    background: game.background,
    rightContent: game.rightContent
  }
})

// 获取所有游戏列表 - 确保包含 location
const allGames = computed(() => {
  return Object.values(games).map(game => ({
    id: game.id,
    title: game.title,
    logoText: game.logoText,
    addressBar: game.addressBar, 
    image: game.image,
    location: game.location // 确保包含 location
  }))
})

// 修改：根据 location 筛选左侧游戏
const leftGames = computed(() => {
  return allGames.value.filter(game => game.location === 'left');
})

// 修改：根据 location 筛选右侧游戏
const rightGames = computed(() => {
  return allGames.value.filter(game => game.location === 'right');
})

// 获取图片URL
const getImageUrl = (imageName) => {
  if (!imageName) return ''
  // 使用 new URL() 来让 Vite 处理资源路径
  // 第一个参数是相对于当前文件(Index.vue)的路径 ../assets/images/
  // 第二个参数是当前文件的 URL 基准 import.meta.url
  try {
    return new URL(`../assets/images/${imageName}`, import.meta.url).href
  } catch (error) {
    console.error(`Error creating URL for image: ${imageName}`, error);
    return ''; // 返回空字符串或默认图片路径
  }
}

/**
 * 更新或创建 Meta 标签
 * @param {string} name - Meta 标签的 name 属性
 * @param {string} content - Meta 标签的 content 属性
 */
const updateMetaTag = (name, content) => {
  let element = document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content || ''); // 如果 content 为空则设置空字符串
}

// 使用 watchEffect 监听 gameData 的变化，并更新 meta 标签
watchEffect(() => {
  const currentDescription = gameData.value.description;
  const currentKeywords = gameData.value.keywords;

  // 更新 description meta 标签
  updateMetaTag('description', currentDescription);
  // 更新 keywords meta 标签
  updateMetaTag('keywords', currentKeywords);

  // (可选) 同时更新页面标题，可以替代 router.js 中的逻辑
  // document.title = gameData.value.title || 'Default Title';
});

console.log('Current game:', gameData.value)
console.log('Other games:', allGames.value)

</script>

<style scoped>
.container {
  transition: background-color 0.3s ease;
  background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
  /* background: url('../assets/images/game-01.webp') no-repeat center center; */
  background-size: cover;
  padding: 100px 0;
}

.game-wrap {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 100px;
}

.game-list {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.list-left, .list-right {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.content-center {
  width: 1200px;
  margin: 0 20px;
}

.cr-item {
  width: 100px;
  height: 100px;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  background: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.cr-item a {
  display: block;
  width: 100%;
  height: 100%;
}

.cr-item img {
  width: 100%;
  height: 100%;
  object-fit: cover; 
  transition: all 0.5s ease;
}

.cr-item .mask{
  position: absolute;
  left: 0;
  bottom: 5px;
  width: 100%;
  text-align: center;
  font-size: 14px;
  color: #fff;
  z-index: 9;
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
  padding: 0 5px;
}

.cr-item:hover {
  transform: scale(1.05) rotate(3deg);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.cr-item:hover img {
  transform: scale(1.1);
}

.cr-item:hover a::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0));
  border-radius: 10px;
}

.cr-item:nth-child(odd):hover {
  transform: scale(1.05) rotate(-3deg);
}

.below {
  display: flex;
  justify-content: space-between;
  padding: 0 50px;
}

/* 平板样式 (例如：宽度 <= 1024px) */
@media (max-width: 1024px) {
  .game-list {
    max-width: 960px; /* 稍微减小最大宽度 */
    padding: 0 15px;
  }
  .content-center {
    width: calc(100% - 2 * 100px - 40px); /* 根据列表宽度和间距调整 */
  }
  .cr-item {
    width: 90px; /* 稍微减小图标尺寸 */
    height: 90px;
  }
  .below {
     padding: 0 20px;
  }
}

/* 手机样式 (例如：宽度 <= 768px) */
@media (max-width: 768px) {
  .container {
      padding: 50px 0 20px; /* 调整容器内边距 */
  }
  .game-wrap {
      margin-bottom: 30px;
  }
  .game-list {
    flex-direction: column; /* 垂直堆叠 */
    align-items: center; /* 居中对齐 */
    max-width: 100%;
    padding: 0 10px;
  }
  .list-left, .list-right {
    flex-direction: row; /* 将图标改为水平排列 */
    flex-wrap: wrap; /* 允许换行 */
    justify-content: center; /* 水平居中 */
    width: 100%;
    margin-bottom: 20px; /* 在列表和中间内容间添加间距 */
    order: 1; /* 将左右列表默认放在下方 */
  }
  .list-left {
      order: 0; /* 将左列表放在最上方 */
      margin-bottom: 15px;
  }
  .content-center {
    width: 100%; /* 中间内容占满宽度 */
    margin: 0 0 20px 0; /* 移除左右外边距，添加下方外边距 */
    order: 2; /* 将中间内容放在中间 */
    height: auto; /* 允许高度自适应 */
    min-height: 400px; /* 设置一个最小高度 */
  }
  .cr-item {
    width: 70px; /* 进一步减小图标尺寸 */
    height: 70px;
  }
  .below {
    flex-direction: column; /* 垂直堆叠 About 和 Recommend */
    align-items: center; /* 居中 */
    padding: 0 15px;
    gap: 20px; /* 增加堆叠时的间距 */
  }
  /* About 和 Recommend 组件在下方单独调整宽度 */

  /* 可以在这里为 Index.vue 特有的文本元素（如果未来添加）设置字体大小 */
  /* 例如： */
  /* .index-specific-text { font-size: 14px; } */
}
</style> 
