import { connectLocomotion } from './locomotion.js';
const BASE='../assets/characters-v2/';
const $=s=>document.querySelector(s);
const data=await fetch(BASE+'manifest.json').then(r=>{if(!r.ok)throw Error('角色清单加载失败');return r.json();});
const moodLabels=data.moodLabels??{neutral:'倾听',joy:'开心',concern:'担心',resolve:'认真'};
const selectedId=new URLSearchParams(location.search).get('character');
let current=data.characters.find(c=>c.id===selectedId)??data.characters[0],mood='neutral',filter='all';
let season=new URLSearchParams(location.search).get('clothes')??'summer';
if(!data.seasons?.[season])season='summer';
const costume=()=>current.wardrobe?.[season];
document.querySelector('[data-filter="all"]').textContent=`全部造型 ${data.characters.length}`;
document.querySelector('[data-filter="lead"]').textContent=`主角造型 ${data.characters.filter(c=>c.kind==='lead').length}`;
const asset=file=>BASE+file;
const renderLocomotion=connectLocomotion({getCostume:costume,getCharacter:()=>current,getSeasonName:()=>data.seasons?.[season]?.name??season,asset});
function castList(){
  $('#cast').replaceChildren(...data.characters.filter(c=>filter==='all'||c.kind===filter).map(c=>{
    const b=document.createElement('button');b.className='cast-card';b.setAttribute('aria-pressed',String(current.id===c.id));b.title=c.role;
    const im=new Image();im.src=asset(c.wardrobe?.[season]?.fullbody??c.fullbody);im.alt='';const label=document.createElement('span');label.textContent=c.name;b.append(im,label);
    b.onclick=()=>{current=c;mood='neutral';render();};return b;
  }));
}
function dialogue(){
  const keys=Object.keys(current.portraits),i=Math.max(0,keys.indexOf(mood));
  const faceFile=m=>m==='neutral'&&costume()?costume().portrait:(current.portraits[m]??current.portraits.neutral);
  $('#face').src=asset(faceFile(mood));$('#face').alt=`${current.name} · ${moodLabels[mood]}`;
  $('#speaker').textContent=current.name;$('#line').textContent=current.dialogue?.[mood]??current.lines[i]??current.lines[0];
  $('#download-face').href=$('#face').src;$('#mood-note').textContent=data.moodNotes?.[mood]??'';
  $('#expressions').replaceChildren(...keys.map(m=>{const b=document.createElement('button');b.className='expression';b.setAttribute('aria-pressed',String(mood===m));b.title=data.moodNotes?.[m]??moodLabels[m];const im=new Image();im.src=asset(faceFile(m));im.alt='';b.append(im,document.createTextNode(moodLabels[m]));b.onclick=()=>{mood=m;dialogue();};return b;}));
}
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let motionRequest=0,motionImage=null,motionIndex=0,motionAt=0,paused=reduced.matches,motionGeneration=0;
const motionContext=$('#motion').getContext('2d');
function drawMotion(){
  if(!motionImage||!current.animation)return;
  motionContext.clearRect(0,0,64,64);motionContext.imageSmoothingEnabled=false;motionContext.drawImage(motionImage,motionIndex*64,0,64,64,0,0,64,64);
  $('#motion-frame').textContent=`${motionIndex+1} / 4`;
  $('#motion').setAttribute('aria-label',`${current.name} · ${current.animation.name} · 第 ${motionIndex+1} 帧`);
}
function animateMotion(now){
  if(!current.animation||paused)return;
  if(!motionAt)motionAt=now;
  const a=current.animation,duration=a.durations[motionIndex]+(motionIndex===3?a.rest:0);
  if(now-motionAt>=duration){motionIndex=(motionIndex+1)%a.frames.length;motionAt=now;drawMotion();}
  motionRequest=requestAnimationFrame(animateMotion);
}
function setPaused(value){
  paused=value;$('#motion-toggle').textContent=paused?'播放':'暂停';$('#motion-toggle').setAttribute('aria-pressed',String(!paused));
  cancelAnimationFrame(motionRequest);motionAt=0;if(!paused&&motionImage)motionRequest=requestAnimationFrame(animateMotion);
}
function renderMotion(){
  cancelAnimationFrame(motionRequest);const generation=++motionGeneration;motionImage=null;motionIndex=0;motionAt=0;motionContext.clearRect(0,0,64,64);
  const a=current.animation;$('#motion-panel').hidden=!a;if(!a)return;
  $('#motion-title').textContent=a.name;$('#motion-description').textContent=a.description;$('#motion-download').href=asset(a.sheet);
  const im=new Image();im.onload=()=>{if(generation!==motionGeneration)return;motionImage=im;drawMotion();setPaused(reduced.matches);};im.src=asset(a.sheet);
}
$('#motion-toggle').onclick=()=>setPaused(!paused);
$('#motion-step').onclick=()=>{if(!motionImage||!current.animation)return;setPaused(true);motionIndex=(motionIndex+1)%current.animation.frames.length;drawMotion();};
reduced.addEventListener('change',()=>{if(reduced.matches)setPaused(true);});
document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(motionRequest);motionAt=0;if(!document.hidden&&!paused&&motionImage)motionRequest=requestAnimationFrame(animateMotion);});
function render(){
  document.body.dataset.season=season;
  const url=new URL(location.href);url.searchParams.set('character',current.id);url.searchParams.set('clothes',season);history.replaceState(null,'',url);
  castList();$('#name').textContent=current.name;$('#kind').textContent=current.kind==='lead'?'THE THREE OF US / 故事主角':'ISLAND NEIGHBORS / 岛上居民';$('#description').textContent=current.detail;$('#role').textContent=current.role;$('#serial').textContent=`PERSON ${String(data.characters.indexOf(current)+1).padStart(2,'0')}`;
  const clothes=costume();$('#body').src=asset(clothes?.fullbody??current.fullbody);$('#body').alt=`${current.name} · ${data.seasons?.[season]?.name??''}透明全身像`;$('#download-body').href=$('#body').src;$('#source').href=asset(clothes?.source??current.source);
  $('#season-note').textContent=clothes?.note??'';
  $('#seasons').replaceChildren(...Object.entries(data.seasons??{}).map(([key,s])=>{const b=document.createElement('button');b.type='button';b.textContent=s.name;b.dataset.season=key;b.setAttribute('aria-pressed',String(key===season));b.onclick=()=>{season=key;mood='neutral';render();};return b;}));
  $('#palette').replaceChildren(...current.colors.map(c=>{const i=document.createElement('i');i.style.background=c;i.title=c;return i;}));
  const labels=current.poseLabels??(current.kind==='lead'?['正面','朝左','背面','朝右',...current.actions]:['日常站姿']);
  $('#actions').replaceChildren(...current.poses.map((file,i)=>{const f=document.createElement('figure');f.className='pose';const im=new Image();im.src=asset(file);im.alt=`${current.name} · ${labels[i]}`;const caption=document.createElement('figcaption');caption.textContent=labels[i];f.append(im,caption);return f;}));
  $('#action-note').textContent=current.kind==='lead'?`4 向转面 + ${current.actions.length} 个剧情姿势 + 点头过渡`:'日常站姿 + 职业动作';
  $('#extra-sources').replaceChildren(...(current.extraSources??[]).map((s,i)=>{const a=document.createElement('a');a.href=asset(s);a.target='_blank';a.rel='noopener';a.textContent=`查看新增${current.extraSources.length>1?(i===0?'表情':'动作'):'表情与动作'}原图 ↗`;return a;}));
  dialogue();renderMotion();renderLocomotion();
}
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if(filter!=='all'&&current.kind!==filter)current=data.characters.find(c=>c.kind===filter);mood='neutral';render();});
document.querySelectorAll('[data-light]').forEach(b=>b.onclick=()=>{$('#scene').dataset.light=b.dataset.light;document.querySelectorAll('[data-light]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
render();
