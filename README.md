# tabzero

个人导航页：搜索 + 分组书签。React 19、TypeScript、Vite、Tailwind CSS v4、shadcn/ui 和 React Bits。

## 本地运行

需要 Node.js 22.13+（建议 Node 22 LTS）。

```sh
npm ci
npm run dev
```

打开终端显示的本地地址。`npm test` 验证搜索规则与书签数据；`npm run build` 检查类型并生成 `dist/`；`npm run preview` 预览产物。

## 修改书签

编辑 `src/bookmarks.json`，保持以下结构；数组顺序就是显示顺序。保存后开发服务器自动刷新。

```json
[{ "name": "常用", "links": [{ "name": "GitHub", "url": "https://github.com" }] }]
```

分组名需唯一，同组 URL 不可重复，名称不可为空，网址必须包含 `http://` 或 `https://`。提交前运行 `npm test`。书签构建时打包，无运行时数据请求；图标依次尝试 `apple-touch-icon.png`、`/favicon.ico`、Google 图标缓存，失败显示首字母；目标站 favicon 损坏时可在链接上加可选 `icon` 字段指定图标网址。公开仓库及公开部署中的书签均可被他人查看。

## 使用

- 右上角可选「跟随系统 / 浅色 / 深色」。默认跟随系统，选择保存到本机 `tabzero:theme`；切回跟随系统后会随系统主题即时更新。

- 日期、时间、搜索框和主题按钮固定，书签区域独立滚动，不循环。

- 输入时按名称和域名匹配书签，最多显示 5 条。点击结果或方向键选择后回车打开书签；直接回车仍联网搜索或前往网址，Esc 收起结果。

- 搜索框上方显示设备本地日期、星期和时间，每秒更新。

- 按 `/` 聚焦搜索框，输入时不会拦截斜杠；回车搜索或前往网址，均在新标签页打开。
- 支持 Google、百度、Bing、DuckDuckGo，选择仅保存到 `localStorage` 的 `tabzero:engine`。存储不可用时仍可使用搜索。
- 合法 HTTP(S) 地址、明确域名、localhost、IP 直接打开；其他内容搜索，例如 `React 19.2` 和 `3.14`。裸域名默认 HTTPS，本机地址默认 HTTP；其他协议不执行。
- 书签在新标签页打开，深浅色可切换，减少动画偏好生效。
- 可设为浏览器主页和启动页；纯网页不能接管 Chrome 新标签页。

## GitHub Pages

项目包含 `.github/workflows/deploy.yml`，尚未创建远程仓库或发布。

1. 将本项目推送到目标 GitHub 仓库的 `main` 分支。
2. 在仓库 **Settings → Pages → Source** 选择 **GitHub Actions**。
3. 在 Actions 中运行 **Deploy to GitHub Pages**，或再次推送 main。构建和验证成功后自动发布。

Vite 使用相对资源路径，同时支持 `username.github.io` 根路径和 `/tabzero/` 项目路径。以后修改 JSON 并推送 main 即更新网站，耗时取决于 Actions 排队和部署。

组件来源和许可见 `THIRD_PARTY_NOTICES.md`。
