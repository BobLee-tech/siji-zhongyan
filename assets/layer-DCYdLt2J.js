var e=`
.world { position: absolute; inset: 0; overflow: hidden; background: #0c1220; }
.world > canvas { position: absolute; image-rendering: pixelated; image-rendering: crisp-edges; touch-action: none; }
.world-layer { position: absolute; inset: 0; pointer-events: none; }
.world-layer #ui > *:not(#slip):not(#fade) { display: none !important; }
.world-layer #fade { position: absolute; inset: 0; background: #0c1220; opacity: 0; pointer-events: none; }
.world-layer #slip { position: absolute; left: 50%; top: 8%; width: 200px; margin-left: -100px; pointer-events: auto; cursor: pointer; z-index: 4; font-family: var(--px, 'Fusion Pixel', sans-serif); color: #2a2a3a; }
.world-layer #slip[hidden] { display: none; }
.world-layer #slip .paper { padding: 20px 18px 26px; text-align: center; background: #fffdf4; border: 3px solid #22344f; border-radius: 4px; box-shadow: 0 4px 0 rgba(10, 16, 34, .35); }
.world-layer #slip small { display: block; font-size: 12px; letter-spacing: .4em; color: #d9634c; margin-right: -.4em; }
.world-layer #slip b { display: block; font-size: 48px; line-height: 60px; font-weight: 400; margin: 10px 0 6px; letter-spacing: .2em; margin-right: -.2em; }
.world-layer #slip b.bad { color: #5b6b80; }
.world-layer #slip p { font-size: 24px; line-height: 32px; margin: 0 0 12px; }
.world-layer #slip dl { margin: 0; padding: 10px 0 0; border-top: 3px dotted #cdbd95; font-size: 12px; line-height: 20px; text-align: left; display: grid; grid-template-columns: auto 1fr; gap: 2px 10px; }
.world-layer #slip dt { color: #1b8796; letter-spacing: .1em; } .world-layer #slip dd { margin: 0; }
.world-layer #slip em { display: block; margin-top: 10px; font-size: 12px; font-style: normal; color: #8a7f6a; }
.world-rooms { position: absolute; inset: 0; visibility: hidden; pointer-events: none; }
.world-rooms.on { visibility: visible; pointer-events: auto; }
`,t=`<div id="ui"><div id="quest"><b><span id="qt"></span><em id="qn"></em></b><i></i><span id="qh"></span></div>
<div id="clock"><i></i><span id="ck"></span><small id="tide"></small></div><div id="title"><b></b><small></small></div>
<div id="prompt" hidden><kbd></kbd><span></span></div><div id="pop" hidden><div></div></div><div id="barks"></div><div id="bars"><i></i><i></i><p></p><small></small></div>
<div id="slip" hidden><div class="paper"><small>镇守社 · 御神签</small><b></b><p></p><dl></dl><em>按 E 收起来</em></div></div>
<div id="dlg" hidden><div><img class="face" alt=""><div class="name"></div><p class="text"></p><div class="opts"></div><i class="more"></i></div></div>
<div id="fade"></div></div><div id="stage"></div><div id="err" hidden></div>`;export{t as n,e as t};