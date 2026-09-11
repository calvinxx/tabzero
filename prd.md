# tabzero — 个人导航页 PRD

## 一句话定位

自用的浏览器导航页：一个搜索框 + 分组书签网格。书签即配置文件，改文件推送即生效；个人偏好（搜索引擎）记在本机。

## 使用形态

- 纯静态网页，托管在 GitHub Pages
- 浏览器设置「启动时打开此页」+ 设为主页，作为每日入口
- 明确限制：纯网页无法接管 Chrome 新标签页（那需要扩展），可接受的妥协

## 书签工作流（核心设计）

**书签不存在数据库里，就是仓库里的一个 JSON 文件。**

```
编辑 src/bookmarks.json → git push → GitHub Actions 自动构建部署 → 约 1 分钟后生效
```

- 本地开发同理：改 JSON，Vite 热更新即时可见
- 书签随 git 走：天然有版本历史，误删可回滚，换设备无需迁移
- 构建时直接 `import` JSON 打进产物，运行时零请求

注意：repo 公开则书签公开。自用无妨；介意就 private repo + Cloudflare Pages（免费支持私有仓库）。

## 功能设计（v1）

### 1. 搜索框

- 居中大搜索框，回车跳转
- 引擎切换：Google / 百度 / Bing / DuckDuckGo（点击切换）
- URL 识别：输入内容像网址（含 `.` 或 `://`）时直接跳转该网址，不走搜索
- 快捷键：任意处按 `/` 聚焦搜索框
- 当前引擎选择记在 localStorage，下次打开记住

### 2. 书签网格

- 分组展示，如「常用 / 开发 / 娱乐」，每组一行（或一个区块）卡片
- 卡片：名称 + favicon 图标，点击新标签页打开（`target="_blank"`）
- 图标获取：`https://{domain}/favicon.ico`，加载失败回退为首字母色块（无第三方依赖，国内可用）
- 排序 = 改 JSON 里的数组顺序

### 3. 样式与动效

- shadcn/ui 组件体系（Tailwind v4），深浅色跟随系统
- 动效点（React Bits 组件，逐个挑着用）：
  - 入场：标题 / 分组名 BlurText 渐显，卡片网格错落淡入
  - 搜索框：聚焦高亮，引擎切换按钮磁吸（Magnet）
  - 卡片：hover 光效 / 微倾斜
  - 背景：渐变或 Aurora，以首屏加载快为限
- 原则：动效服务质感，不堆料；页面是每天打开几十次的入口，快是底线

## 不做（Out of Scope）

| 砍掉项 | 理由 |
|---|---|
| 页面内编辑书签 | 按设计不做：配置文件就是编辑器 |
| 导入导出 | 不需要：书签在 git 里，天然有备份和迁移 |
| 拖拽排序 | 改 JSON 数组顺序即排序 |
| 时钟 / 天气 / 壁纸 | 不做 |
| 待办 / 速记 | 不做 |
| 云同步 / 账号 / 后端 | 书签走 git，偏好走 localStorage，没有剩下的状态 |
| 浏览器扩展 | 不做 |

## 数据结构

**书签（仓库文件 `src/bookmarks.json`，构建时打包）：**

```json
[
  {
    "name": "常用",
    "links": [
      { "name": "GitHub", "url": "https://github.com" }
    ]
  }
]
```

- 无 id、无嵌套配置，能省的字段都省了（React 直接用 `url` 当 key）
- 配一个 TS interface 做类型约束

**个人偏好（localStorage）：**

```
tabzero:engine = "google"
```

就这一个键。

## 技术栈

| 项 | 选择 | 理由 |
|---|---|---|
| 框架 | React 19 + TypeScript | 自选偏好；TS 给 JSON 配置做类型检查 |
| 构建 | Vite | 秒级启动，产物纯静态，JSON 直接 import |
| 状态 | 一行 `useState(() => localStorage.getItem(...))` | 只剩引擎选择一项偏好，不值得写 hook |
| UI | shadcn/ui（Tailwind v4） | 自选：button / input / dropdown-menu / card，按需生成 |
| 动效 | React Bits（依赖 motion） | 自选：BlurText / Magnet 等，拷进仓库按需改 |
| 外部依赖 | react、motion、radix 原语（shadcn 带入） | 换取 UI 精致度的成本 |
| 部署 | GitHub Actions：push main → build → Pages | 标准模板约 20 行 |

目录预期（一个页面不需要路由）：

```
src/
  main.tsx
  App.tsx
  bookmarks.json
  components/
    SearchBox.tsx / GroupSection.tsx / LinkCard.tsx
    ui/          # shadcn 生成的组件
    effects/     # React Bits 拷入的动效组件
  lib/utils.ts   # cn()
  index.css      # Tailwind 入口
.github/workflows/deploy.yml
```

## 实现里程碑

1. 脚手架：Vite + React + TS + Tailwind v4 + shadcn init
2. `bookmarks.json` + 类型 + 一组真实默认数据
3. SearchBox：引擎切换与记忆、URL 识别、`/` 快捷键
4. 分组网格渲染
5. 接入 React Bits 动效 + 视觉打磨：深浅色、响应式、favicon 回退色块
6. GitHub Actions 部署上线
