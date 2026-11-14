# 暮金 · 像素标题材质包

为《四季终焉》暮色海岛主界面设计。使用 Fusion Pixel 12px 字形，配六档月白至杏金的硬边色阶、铜色字身下缘、紫青色阴影和稀疏像素刻痕。没有模糊光晕或随机噪点。

## 字体与来源

- 原字体：TakWolf 的 [Fusion Pixel Font](https://github.com/TakWolf/fusion-pixel-font)。
- 字体文件保持原样，使用随包附带的 SIL Open Font License 1.1；详见 `FONT-LICENSE.txt`。
- 字面材质 CSS、像素纹理 SVG、配色与排版方案在本项目内设计。它们是字体的显示样式，不修改字体文件。
- `palette.json` 记录颜色与原生字号。建议以 12 的整数倍使用：60 / 72 / 96 / 120 / 144px。

## 独立使用

解压 `sea-gold-pixel-type-pack.zip` 后打开 `sample.html`，或在自己的页面中引用：

```html
<link rel="stylesheet" href="material.css">
<div class="title-heading" style="--wordmark-size:120px">
  <h1 class="title-wordmark" data-text="四季终焉" aria-label="四季终焉">四季终焉</h1>
</div>
```

真实文字与 `data-text` 保持一致。真实文字用于语义和辅助阅读；两层伪元素分别绘制铜色下缘与受光字面。

## 文件

- `material.css`：打包后的独立入口，含本地字体声明。
- `fusion-pixel-12px-proportional-zh_hans.otf.woff2`：完整原字体。
- `gold-grain.svg`：48 × 32 的稀疏方形纹理。
- `palette.json`：六档字面颜色、描边、阴影和字号。
- `FONT-LICENSE.txt`：原字体署名与完整许可。
- `sample.html`：可以直接打开的标题样张。

本项目运行时由 `v6/menu.css` 引入 `sea-gold.css`，沿用项目已加载的原字体，不重复引入字体包。修改材质后运行 `node tools/title-art/build-title-type-pack.mjs` 重建独立 ZIP。
