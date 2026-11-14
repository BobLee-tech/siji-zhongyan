// Same manifest and frame order as the exported game-ready sprite sheets.
export function connectLocomotion({getCostume,getCharacter,getSeasonName,asset,onFrame}){
  const $=s=>document.querySelector(s),ctx=$('#locomotion').getContext('2d'),strip=$('#frame-strip').getContext('2d');
  const directions={down:'朝下',left:'朝左',right:'朝右',up:'朝上'},reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let direction='down',action='walk',frame=0,speed=1,paused=reduced.matches,image=null,raf=0,last=0,generation=0;
  const spec=()=>getCostume()?.locomotion;
  function draw(){
    if(!image||!spec())return;const s=spec(),row=s.directions.indexOf(direction)+(action==='idle'?4:0);
    ctx.clearRect(0,0,192,288);ctx.imageSmoothingEnabled=false;ctx.drawImage(image,frame*32,row*64,32,64,32,16,128,256);
    strip.clearRect(0,0,192,64);strip.imageSmoothingEnabled=false;strip.drawImage(image,0,row*64,192,64,0,0,192,64);
    strip.strokeStyle='#91a17b';strip.lineWidth=1;strip.strokeRect(frame*32+.5,.5,31,63);
    $('#walk-frame').textContent=`${frame+1} / 6`;
    $('#walk-frame-download').href=asset(`${s.frameDirectory}/${action}-${direction}-${frame}.png`);
    $('#locomotion').setAttribute('aria-label',`${getCharacter().name} · ${getSeasonName()} · ${directions[direction]}${action==='walk'?'行走':'待机'} · 第${frame+1}帧`);
    onFrame?.(frame);
  }
  function tick(now){
    if(paused||!image||!spec())return;if(!last)last=now;
    const period=1000/(spec()[action].fps*speed);
    if(now-last>=period){const steps=Math.floor((now-last)/period);frame=(frame+steps)%6;last=now-(now-last)%period;draw();}
    raf=requestAnimationFrame(tick);
  }
  function pause(value){paused=value;cancelAnimationFrame(raf);last=0;$('#walk-toggle').textContent=paused?'播放':'暂停';$('#walk-toggle').setAttribute('aria-pressed',String(!paused));if(!paused&&image)raf=requestAnimationFrame(tick);}
  function controls(){
    $('#directions').replaceChildren(...Object.entries(directions).map(([key,name])=>{const b=document.createElement('button');b.type='button';b.textContent=name;b.setAttribute('aria-pressed',String(key===direction));b.onclick=()=>{direction=key;frame=0;last=0;controls();draw();};return b;}));
    document.querySelectorAll('[data-locomotion]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.locomotion===action));b.onclick=()=>{action=b.dataset.locomotion;frame=0;last=0;controls();draw();};});
  }
  $('#walk-toggle').onclick=()=>pause(!paused);
  $('#walk-step').onclick=()=>{pause(true);frame=(frame+1)%6;draw();};
  $('#walk-speed').oninput=e=>{speed=Number(e.target.value);$('#walk-speed-value').textContent=speed+'×';last=0;};
  reduced.addEventListener('change',()=>{if(reduced.matches)pause(true);});
  document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);last=0;if(!document.hidden&&!paused&&image)raf=requestAnimationFrame(tick);});
  return function render(){
    cancelAnimationFrame(raf);const own=++generation;image=null;frame=0;last=0;ctx.clearRect(0,0,192,288);strip.clearRect(0,0,192,64);controls();
    const s=spec();if(!s)return;$('#locomotion-title').textContent=`${getCharacter().name} · ${getSeasonName()}`;
    $('#walk-download').href=asset(s.sheet);$('#game-atlas-download').href=asset(s.gameAtlas);
    $('#game-preview').href='../../?clothes='+new URLSearchParams(location.search).get('clothes');
    const im=new Image();im.onload=()=>{if(own!==generation)return;image=im;draw();pause(reduced.matches);};im.onerror=()=>{$('#walk-frame').textContent='图集加载失败';};im.src=asset(s.sheet);
  };
}
