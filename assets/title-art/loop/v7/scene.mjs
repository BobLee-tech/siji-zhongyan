export const WIDTH=640,HEIGHT=360,FPS=24,DURATION=24;
const mod=(x,n)=>((x%n)+n)%n;
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
function unpack(image,description){
  const {width:w,height:h,frames,columns}=description;
  return Array.from({length:frames},(_,k)=>{
    const data=new Uint8ClampedArray(w*h*4),ox=k%columns*w,oy=Math.floor(k/columns)*h;
    for(let y=0;y<h;y++)data.set(image.data.subarray(((oy+y)*image.width+ox)*4,((oy+y)*image.width+ox+w)*4),y*w*4);
    return data;
  });
}
const isSea=(x,y)=>y>=223&&((x>=392)||(x>=305&&y<277)||(x>=205&&y>=241&&y<277)||(x>=60&&y>=249&&y<277));
export function createRenderer(assets){
  const meta=assets.manifest;
  const sky=unpack(assets.sky,meta.sky),water=unpack(assets.water,meta.water);
  const people=Object.fromEntries(['auri','nox'].map(n=>[n,unpack(assets[n],meta.people[n])]));
  const output=new Uint8ClampedArray(WIDTH*HEIGHT*4);
  function blit(data,box,opaque=false){
    for(let y=0;y<box.height;y++){
      if(opaque){output.set(data.subarray(y*box.width*4,(y+1)*box.width*4),((y+box.y)*WIDTH+box.x)*4);continue}
      for(let x=0;x<box.width;x++){
        const i=(y*box.width+x)*4,j=((y+box.y)*WIDTH+x+box.x)*4;
        if(data[i+3])output.set(data.subarray(i,i+4),j);
      }
    }
  }
  const sea=[];
  for(let y=223;y<360;y++)for(let x=0;x<640;x++)if(isSea(x,y)){
    const direct=x>=392,sx=direct?x-392:128+mod(x,120),sy=y-223;
    const alpha=direct?smooth((x-392)/14)*smooth((y-223)/6):.34;
    sea.push([(y*640+x)*4,(sy*248+sx)*4,alpha]);
  }
  // The chronological drawings already contain the motion. Playback changes
  // frame indices only: no position keys, sine displacement, mesh or body warp.
  function personFrame(time,lag){
    const phase=mod(time-lag,4);
    return phase<.7||phase>=2.3?0:Math.min(7,Math.floor((phase-.7)*5));
  }
  return function render(seconds){
    const time=mod(Math.floor(seconds*FPS+1e-7),FPS*DURATION)/FPS;
    output.set(assets.background.data);
    blit(sky[Math.floor(time/meta.sky.period*meta.sky.frames)%meta.sky.frames],meta.sky,true);
    const w=water[Math.floor(time/meta.water.period*meta.water.frames)%meta.water.frames];
    for(const[i,j,a]of sea)for(let c=0;c<3;c++)output[i+c]=Math.round(output[i+c]*(1-a)+w[j+c]*a);
    // The boat stays on its original mooring. The new water drawings pass around it.
    for(let i=0;i<assets.sail.data.length;i+=4)if(assets.sail.data[i+3])output.set(assets.sail.data.subarray(i,i+4),i);
    blit(people.auri[personFrame(time,0)],meta.people.auri);
    blit(people.nox[personFrame(time,.3)],meta.people.nox);
    return output;
  };
}
export async function mountScene(canvas,base=new URL('./',import.meta.url)){
  const context=canvas.getContext('2d');if(!context)throw Error('2D canvas unavailable');
  const manifest=await fetch(new URL('layers.json',base)).then(r=>{if(!r.ok)throw Error('Missing animation manifest');return r.json()});
  const names={background:'background-native.png',auri:'auri-poses.png',nox:'nox-poses.png',sky:'sky-poses.png',water:'water-poses.png',sail:'sail-native.png'};
  const loaded=await Promise.all(Object.entries(names).map(async([name,file])=>{
    const img=new Image();img.src=new URL(file,base).href;await img.decode();
    const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
    const ctx=c.getContext('2d');ctx.drawImage(img,0,0);
    return[name,{width:c.width,height:c.height,data:ctx.getImageData(0,0,c.width,c.height).data}];
  }));
  const render=createRenderer({...Object.fromEntries(loaded),manifest}),frame=new ImageData(WIDTH,HEIGHT);
  canvas.width=WIDTH;canvas.height=HEIGHT;context.imageSmoothingEnabled=false;
  let playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,disposed=false,raf=0,last=-1,elapsed=0,stamp=performance.now();
  const paint=t=>{frame.data.set(render(t));context.putImageData(frame,0,0)};paint(0);
  function tick(now){
    if(disposed)return;
    if(playing&&!document.hidden)elapsed+=Math.min((now-stamp)/1000,.25);
    stamp=now;const n=Math.floor(elapsed*FPS);
    if(n!==last){paint(elapsed);last=n}raf=requestAnimationFrame(tick);
  }
  raf=requestAnimationFrame(tick);
  return{get playing(){return playing},setPlaying(value){playing=value;stamp=performance.now()},seek(t){elapsed=t;last=-1;paint(t)},dispose(){disposed=true;cancelAnimationFrame(raf)}};
}
