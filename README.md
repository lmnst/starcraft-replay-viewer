# Replay Lab · 星际回放

纯静态网页，基于 OpenBW，在浏览器里播放 StarCraft 1.16.1 `.rep` 回放。无 npm 安装或构建步骤，无数据库和后端服务。

## 本机运行

从项目根目录运行：

```powershell
.\web-replay-viewer\start.ps1
```

打开 http://127.0.0.1:8765 ，点击「读取本项目游戏数据」，再选择一份回放。此按钮仅在 localhost 显示，本地服务器只映射 `assets/mpq/` 内指定的三份文件。服务只监听本机，终端 Ctrl+C 停止。

也可以用普通静态服务器：

```powershell
python -m http.server 8765 --bind 127.0.0.1 --directory web-replay-viewer
```

普通静态服务器不提供本项目游戏数据接口，请点击「导入 MPQ 文件」，同时选择 `StarDat.mpq`、`BrooDat.mpq`、`Patch_rt.mpq`。数据只在浏览器里读取，并用 IndexedDB 缓存；浏览器禁止或清除缓存时需要重新导入。使用 1.16.1 游戏数据，不支持内置 AI 回放。不建议直接双击 HTML，以免 WASM 加载受 `file://` 限制。

## 发布 GitHub Pages

将**此目录的内容**放到独立 GitHub 仓库根目录，不要上传整个研究工作区。先核实 [第三方分发许可](THIRD_PARTY.md)。仓库中不包含 MPQ，发布后由访客自行导入游戏数据。

1. 提交此目录的文件，保留 `.nojekyll`。
2. GitHub 仓库 Settings → Pages → Deploy from a branch。
3. 选择 `main` 分支和 `/ (root)`，保存。
4. 部署完成后使用 GitHub 显示的网站地址，通常为 `https://用户名.github.io/仓库名/`。

仅上传仓库不会自动启用 Pages。网页使用相对路径，支持仓库子路径。也可以将此目录内容放到已有仓库的 `docs/`，再把 Pages 发布目录改为 `/docs`。

## 文件和存储

- 引擎 JS/WASM、界面、图片和内置回放由静态托管提供。
- 用户选取的本地回放不上传，不永久保存；刷新后需重新选择。
- 三份 MPQ 只缓存在访问者的浏览器中，不放入公开仓库。
- 项目回放可以通过 `?replay=01-win-heartbreak` 这样的链接定位。
- 暂无访客上传、账户和云端回放库；如果以后需要上传并分享任意回放，再增加对象存储和上传接口。

自包含依赖保存在 `viewer/`，无需运行时 CDN。上游自带的视频导出功能可能按需请求其编码器依赖，本项目没有验证该功能。来源见 [THIRD_PARTY.md](THIRD_PARTY.md)。
