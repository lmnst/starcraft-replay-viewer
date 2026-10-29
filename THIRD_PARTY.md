# 第三方来源

`viewer/` 中的 HTML、Foundation 样式及脚本、图片和 `v1.4/` 播放引擎来自：

- https://github.com/dgant/openbw-replay-viewer
- 固定提交：`bb4b9a3a89b7b1c189bbc3fcaafb5c33a8ca66e8`
- OpenBW 引擎：https://github.com/OpenBW/openbw

修改：将 CDN 依赖换成本地文件；加入 `replay-lab.js` 以支持用户导入 MPQ、浏览器缓存、宿主页状态同步；关闭远程音乐列表。保留原播放器的回放操作和界面。

其他依赖：

- jQuery 2.1.0：https://jquery.org/license/ （MIT；文件头保留上游声明）
- Chart.js 2.5.0：https://github.com/chartjs/Chart.js/tree/v2.5.0 （MIT；文件头保留上游声明）
- Foundation：https://github.com/foundation/foundation-sites （MIT）
- Font Awesome 4.5.0：https://fontawesome.com/v4/license/ （字体 SIL OFL 1.1，CSS MIT；保留 CSS 中的声明）

上游播放器仓库根目录未提供独立 LICENSE 文件；这里记录来源，不给第三方代码重新声明许可证。公开发布前应核实上游代码与图片的分发许可。

不包含 Blizzard MPQ 游戏资源。用户从自己的游戏安装中提供数据。`replays/` 为本项目已有的五份对局回放副本，其胜负来自本地验证结果，不代表官方榜单成绩。
