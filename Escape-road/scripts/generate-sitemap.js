import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

// 这里我们假设脚本在项目根目录下的 scripts/ 文件夹中
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..'); // 获取项目根目录
const gamesPath = path.join(projectRoot, 'src', 'data', 'games.js');

// 使用 pathToFileURL 将文件路径转换为 file:// URL
const gamesURL = pathToFileURL(gamesPath).href;
const { games } = await import(gamesURL);

const hostname = 'https://escape-road-online.com';

// 需要包含在站点地图中的静态路由
const staticRoutes = [
  '/',          // 首页
  '/about',
  '/dmca',
  '/privacy-policy',
  '/terms-of-service'
];

// 从游戏数据生成动态路由
const dynamicGameRoutes = Object.values(games)
  .map(game => game.addressBar ? `/${game.addressBar.trim()}` : null)
  .filter(route => route !== null); // 过滤掉没有 addressBar 的游戏

// 合并所有路由
const allRoutes = [...staticRoutes, ...dynamicGameRoutes];

// 生成 sitemap.xml 内容
const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(route => {
    const fullUrl = `${hostname}${route}`;
    // 你可以根据需要为不同路由设置 lastmod, changefreq, priority
    // 例如：首页可能更新不频繁，游戏页可能更频繁
    let lastmod = new Date().toISOString().split('T')[0]; // 默认为今天
    let changefreq = 'weekly';
    let priority = '0.8';

    if (route === '/') {
      priority = '1.0';
      changefreq = 'daily';
    }

    return `
  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join('')}
</urlset>`;

// 将内容写入 public/sitemap.xml
const outputPath = path.join(projectRoot, 'public', 'sitemap.xml');
try {
  fs.writeFileSync(outputPath, sitemapContent.trim());
  console.log(`✅ Sitemap 生成成功: ${outputPath}`);
} catch (error) {
  console.error(`❌ Sitemap 生成失败:`, error);
  process.exit(1); // 生成失败时退出，阻止后续构建
} 