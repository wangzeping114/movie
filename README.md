# Vue3 短视频应用

基于 Vue3 + Vite 构建的现代化短视频应用，支持视频浏览、点赞、评论、分享等功能。

[English](./README_EN.md) | 简体中文

## 项目预览

### 在线演示
访问地址：[待部署]

### 功能特点

- 🎥 短视频浏览和播放
  - 支持上下滑动切换视频
  - 自动播放/暂停
  - 视频进度条显示
  - 双击点赞动画效果
- 👍 互动功能
  - 点赞功能
  - 评论系统
  - 分享功能
- 👤 用户系统
  - 登录/注册功能
  - 用户信息管理
  - 权限控制
- 📱 移动端适配
  - 响应式设计
  - 触摸手势支持
  - 移动端优化
- 🎨 UI/UX
  - 现代化界面设计
  - 流畅动画效果
  - 良好的用户体验

## 技术栈

### 前端
- Vue 3.4.x - 渐进式 JavaScript 框架
- Vite 5.x - 下一代前端构建工具
- Vue Router - 官方路由管理器
- CSS3 - 现代化的样式和动画

### 部署
- Docker - 容器化部署
- Nginx - Web服务器
- Node.js - JavaScript 运行时

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker (可选)

### 本地开发

1. 克隆项目
```bash
git clone https://github.com/wangzeping114/movie.git
cd movie
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 在浏览器中访问 http://localhost:5173

### Docker 部署

1. 构建镜像
```bash
docker build -t vue3-movie .
```

2. 运行容器
```bash
docker run -d -p 4173:4173 vue3-movie
```

3. 访问应用：http://localhost:4173

## 项目结构

```
vue3-movie/
├── src/                    # 源代码目录
│   ├── assets/            # 静态资源
│   │   └── iconfont/     # 图标字体
│   ├── components/        # 公共组件
│   ├── router/           # 路由配置
│   ├── views/            # 页面组件
│   │   ├── ShortVideo.vue # 短视频主页
│   │   └── Login.vue     # 登录页面
│   ├── App.vue           # 根组件
│   └── main.js           # 入口文件
├── public/                # 公共资源
├── Dockerfile            # Docker 配置
├── nginx.conf           # Nginx 配置
├── package.json         # 项目配置
└── vite.config.js       # Vite 配置
```

## 核心功能实现

### 视频播放系统
- 使用浏览器原生视频播放器
- 实现上下滑动切换视频
- 自动播放/暂停控制
- 视频预加载优化

### 用户交互系统
- 点赞功能
  - 动画效果
  - 数据同步
- 评论系统
  - 评论列表
  - 发表评论
- 分享功能
  - 分享链接生成
  - 社交平台分享

### 用户认证系统
- 登录/注册
- 用户信息管理
- 权限控制
- 本地存储

## 开发指南

### 编码规范
- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 遵循 Vue 3 组合式 API 风格指南

### 组件开发
- 使用 Vue 3 组合式 API
- 组件命名采用大驼峰命名法
- 属性和方法使用小驼峰命名法

### Git 提交规范
- feat: 新功能
- fix: 修复问题
- docs: 文档修改
- style: 代码格式修改
- refactor: 代码重构
- test: 测试用例修改
- chore: 其他修改

## 部署说明

### Docker 部署
项目提供完整的 Docker 支持：
1. Dockerfile 多阶段构建
2. 基于 Nginx 的生产环境配置
3. 优化的构建流程

### 传统部署
1. 构建项目
```bash
npm run build
```

2. 部署 dist 目录到 Web 服务器

## 性能优化

- 路由懒加载
- 组件按需加载
- 图片懒加载
- 视频预加载策略
- 缓存优化

## 开发计划

- [ ] 添加用户个人中心
- [ ] 实现视频上传功能
- [ ] 添加后台管理系统
- [ ] 优化移动端体验
- [ ] 添加消息通知系统

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (git checkout -b feature/AmazingFeature)
3. 提交更改 (git commit -m 'Add some AmazingFeature')
4. 推送到分支 (git push origin feature/AmazingFeature)
5. 提交 Pull Request

## 版本历史

### v1.0.0 (2024-03)
- 🎉 初始版本发布
- ✨ 实现基础短视频功能
- 🔐 添加用户认证系统
- 🎨 完成基础UI设计

## 常见问题

### Q: 如何修改服务器端口？
A: 在 vite.config.js 中修改 server.port 配置项

### Q: 如何配置开发环境代理？
A: 在 vite.config.js 中配置 server.proxy 选项

### Q: 如何添加新的路由页面？
A: 在 src/router/index.js 中添加新的路由配置

## 许可证

本项目基于 [MIT License](LICENSE) 开源。

## 联系方式

如有问题或建议，欢迎：
- 提交 Issue
- 提交 Pull Request
- 联系开发团队
