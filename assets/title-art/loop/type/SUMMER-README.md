# 夏日 · 海盐白像素标题资料包

用于《四季终焉》的清爽标题。24 点阵宋体字形配海盐白字面、极淡的浅青色底部投影。保留原生方形格点，不使用金属切面、厚描边、颗粒噪点或上下漂浮动画。

## 使用

打开 `sample.html` 即可查看。也可以引入 `material.css`：

```html
<h1 class="summer-title" aria-label="四季终焉">
  <img src="summer-title.svg" alt="" aria-hidden="true">
  <span>四季终焉</span>
</h1>
```

SVG 是已经排好的标题轮廓，可以直接放进游戏界面。浏览器无需加载完整中文字库。推荐宽度 348 / 464 / 580 / 696 像素。

## 字形与原始资料

字形来自 X.Org 官方分发的 ISAS Song 24px 点阵宋体。包中原样附带 `source/gb24st.bdf`、完整许可 `ISAS-LICENSE.txt`。资料来源：

- 原项目：https://gitlab.freedesktop.org/xorg/font/isas-misc
- 官方归档：https://xorg.freedesktop.org/archive/individual/font/font-isas-misc-1.0.4.tar.xz
- 字面色彩、稀疏阴影、SVG 排字和本项目的版式为本轮设计。

原字体保留全部 7,445 个 GB2312 字形；`summer-title-glyphs.json` 只记录当前标题四个字的原始 24 × 24 点阵，便于核对和再次排版。字体版权与许可全文见 `ISAS-LICENSE.txt`。

若需排出另一句标题，在解压目录运行：

```sh
node build-title.mjs '四季终焉'
```

此命令只重新导出本地 BDF 中已有的字形。若换了文字，也同步修改页面的 `aria-label` 与隐藏文字。
