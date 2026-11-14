# 夏日 · 手写标题与轻界面资料包

《四季终焉》当前主界面的标题与 UI 样张。标题采用 Long Cang 手写字体，海盐白字面、很淡的青色阴影，居中融入天空。桌面入口放到画面下方，以轻字、间距与一粒细光作区分；手机改为画面下方的纵向入口。

## 文件

- `long-cang-title-subset.ttf`：Google Fonts 官方服务提供的标题、菜单用字子集，约 15 KB，已保存到项目本地。
- `long-cang-OFL.txt`：原字体的完整版权与 SIL Open Font License 1.1。
- `material.css`：手写字面、居中排版、菜单与响应式样式。
- `background.png`：本项目补帧画面的静态参考，用于排字样张。
- `sample.html`：可独立打开的样张；链接仅展示样式。

字体来源与作者信息：[Google Fonts 原始元数据](https://github.com/google/fonts/blob/main/ofl/longcang/METADATA.pb)。字库仅包含当前标题与菜单的字，改成其他文案时需按需要扩展子集或使用完整原字体。

本项目主界面由 `v8/menu.css` 使用这套排版；整幅帧图动画继续使用 `v7/scene.mjs`。本包没有改写字体的字形数据，也不包含整幅动画播放器。

```html
<header class="title-heading">
  <h1 class="title-wordmark">四季终焉</h1>
</header>
<nav class="title-menu">
  <button class="title-action primary">开始旅程</button>
  <button class="title-action">选择旅伴</button>
  <button class="title-action">静静看海</button>
</nav>
```
