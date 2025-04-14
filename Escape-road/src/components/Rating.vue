<template>
  <div class="rating-container">
    <div class="rating-row">
      <!-- 平均分和星星显示 -->
      <div class="rating-display" v-if="!isLoading">
        <span class="average-score">{{ averageRating.toFixed(1) }}</span>
        <div class="stars-display">
          <i v-for="star in 5" 
             :key="'display-' + star" 
             class="fas fa-star"
             :class="{ 
               'full': star <= Math.floor(averageRating),
               'half': star === Math.ceil(averageRating) && averageRating % 1 >= 0.5
             }"
          ></i>
        </div>
        <span class="count">({{ ratingCount }} ratings)</span>
      </div>
    </div>

    <!-- 用户评分部分 -->
    <div class="rating-row" v-if="!hasRated">
      <span class="rate-label">Rate this game:</span>
      <div class="stars-input">
        <span 
          v-for="star in 5" 
          :key="star" 
          class="star" 
          @click="submitRating(star)"
          @mouseover="hoverRating = star"
          @mouseleave="hoverRating = 0"
        >
          <i :class="[
            'fas fa-star',
            { 
              'selected': (hoverRating || currentSelection) >= star,
              'disabled': isSubmitting || hasRated
            }
          ]"></i>
        </span>
      </div>
    </div>

    <div v-if="isLoading" class="loading">
      <span>Loading...</span>
    </div>

    <transition name="fade">
      <div v-if="submitMessage" :class="['message', submitMessage.type]">
        {{ submitMessage.text }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

const props = defineProps({
  pageId: {
    type: String,
    required: true
  }
});

// API 配置
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://escape-road-demo-01.vercel.app/api'  // 生产环境 API URL
  : 'http://localhost:3000/api';  // 开发环境 API URL

const API_URL = `${API_BASE_URL}/ratings`;

// 配置 axios 默认值
axios.defaults.withCredentials = true;

const averageRating = ref(0); // 初始值设为 0 而不是 null
const ratingCount = ref(0);
const hoverRating = ref(0); // 用户鼠标悬停的星级
const currentSelection = ref(0); // 用户当前选择或已提交的星级
const hasRated = ref(false); // 用户是否已评分 (简单本地状态)
const isSubmitting = ref(false);
const submitMessage = ref(null);
const isLoading = ref(true); // 用于初始加载

// 获取当前评分信息
const fetchRating = async () => {
  if (!props.pageId) return;
  isLoading.value = true;
  try {
    const response = await axios.get(`${API_URL}`, { 
      params: { pageId: props.pageId }
    });
    console.log('Rating response:', response.data);
    averageRating.value = response.data.average || 0;
    ratingCount.value = response.data.count || 0;
  } catch (error) {
    console.error('Error fetching rating:', error);
    averageRating.value = 0;
    ratingCount.value = 0;
  } finally {
    isLoading.value = false;
  }
};

// 提交用户评分
const submitRating = async (ratingValue) => {
  if (isSubmitting.value || hasRated.value) return;

  isSubmitting.value = true;
  submitMessage.value = null;
  currentSelection.value = ratingValue;

  try {
    const response = await axios.post(API_URL, {
      pageId: props.pageId,
      rating: ratingValue
    });
    console.log('Submit rating response:', response.data);
    averageRating.value = response.data.average || 0;
    ratingCount.value = response.data.count || 0;
    hasRated.value = true;
    submitMessage.value = {
      type: 'success',
      text: 'Thank you for your rating!'
    };
  } catch (error) {
    console.log('Rating submission error:', error);
    currentSelection.value = 0;
    if (error.response?.status === 429) {
      submitMessage.value = {
        type: 'info',
        text: error.response.data.message
      };
    } else {
      submitMessage.value = {
        type: 'info',
        text: 'Unable to submit rating. Please try again later.'
      };
    }
  } finally {
    isSubmitting.value = false;
    // 3秒后清除消息
    if (submitMessage.value) {
      setTimeout(() => {
        submitMessage.value = null;
      }, 3000);
    }
  }
};

// 挂载时获取评分
onMounted(fetchRating);

// 监听 pageId 变化，重新获取评分
watch(() => props.pageId, (newPageId, oldPageId) => {
  if (newPageId && newPageId !== oldPageId) {
    // 重置状态
    averageRating.value = 0;
    ratingCount.value = 0;
    hoverRating.value = 0;
    currentSelection.value = 0;
    hasRated.value = false; // 重置评分状态
    submitMessage.value = null;
    fetchRating(); // 获取新页面的评分
  }
}, { immediate: false });

</script>

<style scoped>
.rating-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.average-score {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.stars-display {
  display: flex;
  gap: 0.15rem;
}

.stars-display i {
  font-size: 1.1rem;
  color: #ddd;
}

.stars-display i.full {
  color: #ffd700;
}

.stars-display i.half {
  background: linear-gradient(90deg, #ffd700 50%, #ddd 50%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.rate-label {
  color: #666;
  font-size: 0.9rem;
}

.stars-input {
  display: flex;
  gap: 0.15rem;
}

.star {
  cursor: pointer;
  font-size: 1.1rem;
  transition: transform 0.1s ease;
}

.star:hover {
  transform: scale(1.1);
}

.star i {
  color: #ddd;
  transition: color 0.2s ease;
}

.star i.selected {
  color: #ffd700;
}

.star.disabled {
  cursor: not-allowed;
  opacity: 0.7;
  transform: none;
}

.count {
  color: #666;
  font-size: 0.9rem;
}

.loading {
  color: #666;
  font-style: italic;
  font-size: 0.9rem;
}

.message {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  text-align: center;
  max-width: 300px;
}

.message.success {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.message.info {
  background-color: #e3f2fd;
  color: #1976d2;
  border: 1px solid #90caf9;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
