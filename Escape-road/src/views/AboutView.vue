<template>
  <main class="about-page">
    <Headers /> 
    <section class="content-wrap">
      <div class="about-container">
        <h1>About Us</h1>
        <p>
            Welcome to our gaming platform! We are committed to providing fun and exciting gaming experiences.
        </p>
        <p>
            Our platform brings together various types of games, from casual puzzles to action adventures, there is always one for you. We are constantly working to update and add new games to ensure that you can always find something fresh.
        </p>
        <h2>Our mission</h2>
        <p>
            Our mission is to connect players through high-quality games and create a fun and interactive community. We believe that games are not just entertainment, but also a way to learn, socialize and relax.
        </p>
        <h2>Contact Us</h2>
        <p>
            If you have any questions, suggestions or cooperation intentions, please feel free to contact us through the contact information in the footer. We look forward to hearing from you!
        </p>
      </div>
    </section>
    <Foot />
  </main>
</template>

<script setup>
// 导入 Header 和 Footer 组件
// 假设 Header 组件路径为 ../components/Head.vue
// 假设 Footer 组件路径为 ../components/foot.vue
import Headers from '../components/Head.vue' 
import Foot from '../components/foot.vue'

</script>

<style scoped>
.about-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* 使页面至少占满整个视口高度 */
}

.content-wrap {
  flex-grow: 1; /* 让内容区域填充可用空间，将 footer 推到底部 */
  padding: 40px 20px; /* 上下、左右内边距 */
  background-color: #f4f7f6; /* 轻微的背景色 */
}

.about-container {
  max-width: 900px; /* 内容最大宽度 */
  margin: 0 auto; /* 水平居中 */
  background-color: #fff; /* 内容区域白色背景 */
  padding: 30px 40px; /* 内边距 */
  border-radius: 8px; /* 轻微圆角 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 添加阴影 */
}

.about-container h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}

.about-container h2 {
  color: #34495e;
  margin-top: 30px;
  margin-bottom: 15px;
  border-bottom: 2px solid #3498db; /* 标题下划线 */
  padding-bottom: 5px;
}

.about-container p {
  line-height: 1.8; /* 增加行高，提高可读性 */
  color: #555;
  margin-bottom: 15px;
}

/* 添加手机端样式 */
@media (max-width: 768px) {
  .content-wrap {
    padding: 20px 10px; /* 减小手机上的内边距 */
  }
  .about-container {
    padding: 20px; /* 减小内容容器内边距 */
  }
}
</style> 