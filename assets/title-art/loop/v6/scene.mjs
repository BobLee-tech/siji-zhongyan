// The live title screen and exports use this same pixel rig and timeline.
export const WIDTH=640,HEIGHT=360,FPS=16,DURATION=24;
const TAU=Math.PI*2;
const mod=(x,n)=>((x%n)+n)%n;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
const windKeys=[[0,.12],[1.2,.18],[2,.45],[3.5,1],[4.8,.65],[6,.05],[7,-.18],[8,.08],[9.5,.18],[11,.65],[12.3,.9],[13.5,.35],[15,-.12],[16,.08],[18,.18],[19.5,.8],[20.5,.65],[22,.2],[23.2,.1],[24,.12]];
function wind(time){const t=mod(time,DURATION);for(let i=1;i<windKeys.length;i++)if(t<=windKeys[i][0]){const[a,v]=windKeys[i-1],[b,w]=windKeys[i];return v+(w-v)*smooth((t-a)/(b-a))}return .12}
const isSea=(x,y)=>y>=223&&((x>=392)||(x>=305&&y<277)||(x>=205&&y>=241&&y<277)||(x>=60&&y>=249&&y<277));

function sprite(data,x,y,w,h){
  const pixels=new Uint8ClampedArray(w*h*4);
  for(let py=0;py<h;py++)for(let px=0;px<w;px++)pixels.set(data.subarray(((py+y)*WIDTH+px+x)*4,((py+y)*WIDTH+px+x)*4+4),(py*w+px)*4);
  return{x,y,w,h,pixels};
}
function sample(s,x,y){if(x<s.x||y<s.y||x>=s.x+s.w||y>=s.y+s.h)return-1;const i=((y-s.y)*s.w+x-s.x)*4;return s.pixels[i+3]?i:-1}
function runs(data){
  const out=[];
  for(let y=0;y<HEIGHT;y++){
    let start=-1;
    for(let x=0;x<=WIDTH;x++){
      if(x<WIDTH&&data[(y*WIDTH+x)*4+3]){if(start<0)start=x}
      else if(start>=0){out.push({x:start,y,length:x-start});start=-1}
    }
  }
  return out;
}

export function createRenderer(assets){
  const output=new Uint8ClampedArray(WIDTH*HEIGHT*4);
  const clouds=[],sail=[];
  for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
    const i=(y*WIDTH+x)*4;
    if(assets.clouds[i+3]){
      const p=[x,y,assets.clouds[i],assets.clouds[i+1],assets.clouds[i+2]];clouds.push(p);
      // Mirrored overscan continues volumes beyond the right/top crop. The
      // drifting banks therefore never expose a straight, clipped sky strip.
      if(x>=WIDTH-20)clouds.push([2*WIDTH-x-1,y,...p.slice(2)]);
      if(y<2)clouds.push([x,-y-1,...p.slice(2)]);
      if(x>=WIDTH-20&&y<2)clouds.push([2*WIDTH-x-1,-y-1,...p.slice(2)]);
    }
    if(assets.sail[i+3])sail.push([x,y,...assets.sail.subarray(i,i+3)]);
  }
  const gold=runs(assets.water),ripples=runs(assets.ripples);
  const auri=sprite(assets.auri,208,180,66,128),nox=sprite(assets.nox,265,178,42,130);
  const hair=sprite(assets.hair,208,180,66,128),hem=sprite(assets.hem,208,180,66,128);
  const hairPoses=Array.from({length:11},(_,step)=>{
    const s={...auri,pixels:auri.pixels.slice()},strength=step/8-.25;
    for(let i=0;i<s.pixels.length;i+=4)if(hair.pixels[i+3])s.pixels.fill(0,i,i+4);
    for(let y=207;y<243;y++)for(let x=210;x<253;x++){
      const free=smooth((249-x)/27);
      const sx=x+Math.round(strength*6*free),sy=y+Math.round(strength*1.5*free);
      const i=sample(hair,sx,sy),j=((y-s.y)*s.w+x-s.x)*4;
      if(i>=0)s.pixels.set(hair.pixels.subarray(i,i+4),j);
    }
    return s;
  });
  const working={...auri,pixels:auri.pixels.slice()};
  function put(x,y,r,g,b){
    if(x<0||x>=WIDTH||y<0||y>=HEIGHT)return;
    const i=(y*WIDTH+x)*4;output[i]=r;output[i+1]=g;output[i+2]=b;output[i+3]=255;
  }
  function blend(x,y,r,g,b,amount){
    if(!isSea(x,y)||x<0||x>=WIDTH||y<0||y>=HEIGHT)return;
    const i=(y*WIDTH+x)*4;
    put(x,y,Math.round(output[i]*(1-amount)+r*amount),Math.round(output[i+1]*(1-amount)+g*amount),Math.round(output[i+2]*(1-amount)+b*amount));
  }
  function waterRun(run,t,teal=false){
    const depth=clamp((run.y-220)/120),phase=TAU*(t/4-(run.y-223)/34)+(teal?1.2:0);
    const swell=(1+Math.sin(phase))/2;
    const dx=Math.round(Math.cos(phase)*(teal?1.5:2.5)*(.4+depth));
    const dy=Math.round(Math.sin(phase)*depth*(teal?1:1.5));
    const scale=teal?.8+swell*.25:.73+swell*.4;
    const width=Math.max(1,Math.round(run.length*scale));
    const start=Math.round(run.x+run.length/2-width/2)+dx;
    for(let k=0;k<width;k++){
      const sx=run.x+clamp(Math.floor(k/width*run.length),0,run.length-1);
      const i=(run.y*WIDTH+sx)*4,data=teal?assets.ripples:assets.water;
      blend(start+k,run.y+dy,data[i],data[i+1],data[i+2],teal?.55+swell*.35:.55+swell*.45);
    }
  }
  function drawPerson(s,t,who){
    const offset=who==='auri'?0:1.5;
    // A six-second inhale/exhale, slightly different for each person. A slow
    // weight shift shares the eight-second tide; lower legs and feet stay put.
    const breath=0;
    const sway=0;
    for(let y=s.y-2;y<s.y+s.h;y++)for(let x=s.x-2;x<s.x+s.w+2;x++){
      const upper=smooth((286-y)/65);
      const sx=x-Math.round(sway*upper),sy=y+Math.round(breath*upper);
      const i=sample(s,sx,sy);
      if(i>=0)put(x,y,s.pixels[i],s.pixels[i+1],s.pixels[i+2]);
    }
  }
  return function render(seconds){
    const t=mod(Math.floor(seconds*FPS+1e-7),FPS*DURATION)/FPS;
    output.set(assets.background);
    const drift=-Math.round((1-Math.cos(TAU*t/24))*7),lift=Math.round(Math.sin(TAU*t/24));
    for(const[x,y,r,g,b]of clouds)put(x+drift,y+lift,r,g,b);
    for(const run of ripples)waterRun(run,t,true);
    for(const run of gold)waterRun(run,t);
    // Two softly advancing crests beside the pier, with a longer quiet trough.
    for(let k=0;k<2;k++){
      const phase=mod(t/6+k*.5,1),y=312+k*12+Math.round(phase*3);
      const width=Math.round(6+Math.sin(Math.PI*phase)*9),a=Math.sin(Math.PI*phase)*.45;
      for(let x=394+k*10;x<394+k*10+width;x++)blend(x,y,106,153,148,a);
    }
    const bob=-Math.round((1-Math.cos(TAU*t/6))*.7);
    const roll=Math.sin(TAU*t/6-.45)*.035;
    for(const[x,y,r,g,b]of sail)put(x+Math.round((y-231)*roll),y+bob,r,g,b);
    const hairStep=clamp(Math.round((wind(t-.15)+.25)*8),0,10);
    working.pixels.set(hairPoses[hairStep].pixels);
    for(let i=0;i<working.pixels.length;i+=4)if(hem.pixels[i+3])working.pixels.fill(0,i,i+4);
    const hemForce=wind(t-.7);
    for(let y=252;y<279;y++)for(let x=222;x<271;x++){
      const free=smooth((y-253)/23)*smooth((269-x)/35);
      const sx=x+Math.round(hemForce*3*free),sy=y+Math.round(hemForce*free);
      const i=sample(hem,sx,sy),j=((y-working.y)*working.w+x-working.x)*4;
      if(i>=0)working.pixels.set(hem.pixels.subarray(i,i+4),j);
    }
    drawPerson(working,t,'auri');drawPerson(nox,t,'nox');
    const flight=mod(t-5,24);
    if(flight<8)for(let k=0;k<3;k++){
      const x=Math.round(355+flight*8+k*9),y=Math.round(190-k*4+Math.sin(flight*.7+k));
      const wing=[-1,0,1,0][mod(Math.floor(t*4)+k,4)];
      put(x,y,94,100,126);put(x-1,y+wing,94,100,126);put(x+1,y+wing,94,100,126);
    }
    return output;
  };
}

export async function mountScene(canvas,base=new URL('./',import.meta.url)){
  const context=canvas.getContext('2d');if(!context)throw Error('2D canvas unavailable');
  canvas.width=WIDTH;canvas.height=HEIGHT;context.imageSmoothingEnabled=false;
  let disposed=false,raf=0,last=-1,elapsed=0,stamp=performance.now();
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  let playing=!preference.matches;
  const read=async name=>{
    const img=new Image();img.src=new URL(name+'-native.png',base).href;await img.decode();
    const c=document.createElement('canvas');c.width=WIDTH;c.height=HEIGHT;
    const ctx=c.getContext('2d');ctx.drawImage(img,0,0);return ctx.getImageData(0,0,WIDTH,HEIGHT).data;
  };
  const names=['background','auri','nox','clouds','water','ripples','hair','hem','sail'];
  const data=await Promise.all(names.map(read));
  const render=createRenderer(Object.fromEntries(names.map((n,i)=>[n,data[i]]))),frame=new ImageData(WIDTH,HEIGHT);
  const paint=t=>{frame.data.set(render(t));context.putImageData(frame,0,0)};
  paint(0);
  function tick(now){
    if(disposed)return;
    if(playing&&!document.hidden)elapsed+=Math.min((now-stamp)/1000,.25);
    stamp=now;const f=Math.floor(elapsed*FPS);
    if(f!==last){paint(elapsed);last=f}raf=requestAnimationFrame(tick);
  }
  raf=requestAnimationFrame(tick);
  return{
    get playing(){return playing},
    setPlaying(value){playing=value;stamp=performance.now()},
    seek(t){elapsed=t;last=-1;paint(t)},
    dispose(){disposed=true;cancelAnimationFrame(raf)},
  };
}
