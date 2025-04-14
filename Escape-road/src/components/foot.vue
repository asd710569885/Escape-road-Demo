<template>
    <footer class="footer">
        <div class="footer-content">
            <div class="footer-nav">
                <ul>
                    <li><router-link to="/">Games</router-link></li>
                    <li><router-link to="/about">About</router-link></li>
                    <li><router-link to="/dmca">DMCA</router-link></li>
                    <li><router-link to="/privacy-policy">Privacy Policy</router-link></li>
                    <li><router-link to="/terms-of-service">Terms of Service</router-link></li>
                </ul>
            </div>
            <div class="footer-copyright">
                &copy; 2025 Azgames.io. All rights reserved.
            </div>
        </div>
    </footer>
</template>

<style scoped>
.footer {
    background-color: #2c3e50; /* 深色背景，可以根据整体风格调整 */
    color: #ecf0f1; /* 浅色文字 */
    padding: 20px 0;
    width: 100%;
}

.footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column; /* 改为垂直排列 */
    align-items: center; /* 水平居中对齐 */
    text-align: center; /* 文本居中 */
    padding: 0 20px;
    gap: 10px; /* 设置项目之间的垂直间距 */
}

.footer-nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap; /* 允许导航项换行 */
    justify-content: center; /* 导航项水平居中 */
    gap: 20px; /* 导航项之间的间距 */
}

.footer-nav li {
    display: inline-block; /* 或者保持 flex 默认 */
}

.footer-nav a {
    color: #ecf0f1; /* 链接文字颜色 */
    text-decoration: none;
    transition: color 0.3s ease;
}

.footer-nav a:hover {
    color: #3498db; /* 鼠标悬停时改变颜色 */
}

.footer-copyright {
    font-size: 0.9em;
    color: #bdc3c7; /* 版权文字稍暗 */
    text-align: right; /* 默认靠右 */
}

/* 响应式处理可以简化或移除，因为默认就是垂直堆叠 */
/* @media (max-width: 768px) { ... } */
</style>
