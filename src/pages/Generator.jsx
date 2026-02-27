import { useState, useRef, useCallback, useEffect } from "react";

// ══════════════════════════════════════════════════════════════
// FRAMER DEPLOYMENT: Upload alpha-theta-backing.mp3 to Framer
// assets, then paste the URL here.
// Example: "https://framerusercontent.com/assets/abc123.mp3"
// ══════════════════════════════════════════════════════════════
const BACKING_TRACK_URL = "/audio/alpha-theta-backing.mp3";

const STEPS = { RECORD: 0, REVIEW: 1, SHIFT: 2 };
const STATES = { IDLE: "idle", RECORDING: "recording", HAS_AUDIO: "has_audio", PROCESSING: "processing", DONE: "done" };
const FADE_DURATION = 2.5;
const REVERB_MIX = 0.15;
const DURATION_OPTIONS = [10, 20, 30];

const PALETTES = [
  { name:"sky",bg:["#d6e6f2","#c0d6ea","#b4cce3","#c8dced"],accent:"#7ba8c9",textMain:"#1a1a1a",textSoft:"rgba(0,0,0,0.45)",textFaint:"rgba(0,0,0,0.22)",border:"rgba(0,0,0,0.07)",glass:"rgba(255,255,255,0.28)",shadow:"rgba(120,170,210,0.35)",shadowHover:"rgba(120,170,210,0.5)",orbGlow:"rgba(255,255,255,0.7)",lineActive:"rgba(255,255,255,0.3)",lineDim:"rgba(0,0,0,0.06)",dotActive:"rgba(255,255,255,0.6)",dotCur:"#fff",pillBg:"rgba(0,0,0,0.03)" },
  { name:"dusk",bg:["#e8ddd4","#ddd0c5","#d4c4b6","#e0d3c8"],accent:"#b08d6e",textMain:"#2a2018",textSoft:"rgba(42,32,24,0.5)",textFaint:"rgba(42,32,24,0.22)",border:"rgba(42,32,24,0.07)",glass:"rgba(255,255,255,0.3)",shadow:"rgba(176,141,110,0.35)",shadowHover:"rgba(176,141,110,0.5)",orbGlow:"rgba(255,255,255,0.65)",lineActive:"rgba(255,255,255,0.3)",lineDim:"rgba(42,32,24,0.06)",dotActive:"rgba(255,255,255,0.55)",dotCur:"#fff",pillBg:"rgba(42,32,24,0.04)" },
  { name:"ocean",bg:["#0f1923","#0a1628","#0d1f35","#111e2e"],accent:"#4a8bc2",textMain:"#c8dae8",textSoft:"rgba(200,218,232,0.6)",textFaint:"rgba(200,218,232,0.3)",border:"rgba(200,218,232,0.08)",glass:"rgba(255,255,255,0.04)",shadow:"rgba(74,139,194,0.3)",shadowHover:"rgba(74,139,194,0.5)",orbGlow:"rgba(74,139,194,0.5)",lineActive:"rgba(74,139,194,0.3)",lineDim:"rgba(200,218,232,0.06)",dotActive:"rgba(74,139,194,0.5)",dotCur:"#4a8bc2",pillBg:"rgba(255,255,255,0.04)" },
  { name:"cosmos",bg:["#0d0a18","#12081f","#1a0e2a","#0f0b1e"],accent:"#9b6fdf",textMain:"#d4c8e8",textSoft:"rgba(212,200,232,0.6)",textFaint:"rgba(212,200,232,0.28)",border:"rgba(212,200,232,0.08)",glass:"rgba(255,255,255,0.03)",shadow:"rgba(155,111,223,0.3)",shadowHover:"rgba(155,111,223,0.5)",orbGlow:"rgba(155,111,223,0.5)",lineActive:"rgba(155,111,223,0.3)",lineDim:"rgba(212,200,232,0.06)",dotActive:"rgba(155,111,223,0.5)",dotCur:"#b48ef0",pillBg:"rgba(255,255,255,0.04)" },
  { name:"sage",bg:["#d4dfd6","#c5d6c9","#b8cebe","#cddad0"],accent:"#7a9e82",textMain:"#1a221c",textSoft:"rgba(26,34,28,0.5)",textFaint:"rgba(26,34,28,0.22)",border:"rgba(26,34,28,0.07)",glass:"rgba(255,255,255,0.28)",shadow:"rgba(122,158,130,0.35)",shadowHover:"rgba(122,158,130,0.5)",orbGlow:"rgba(255,255,255,0.65)",lineActive:"rgba(255,255,255,0.3)",lineDim:"rgba(26,34,28,0.06)",dotActive:"rgba(255,255,255,0.55)",dotCur:"#fff",pillBg:"rgba(0,0,0,0.03)" },
  { name:"ember",bg:["#1a0f0a","#201008","#2a1510","#1c110c"],accent:"#d4845a",textMain:"#e8d0c0",textSoft:"rgba(232,208,192,0.6)",textFaint:"rgba(232,208,192,0.28)",border:"rgba(232,208,192,0.08)",glass:"rgba(255,255,255,0.03)",shadow:"rgba(212,132,90,0.3)",shadowHover:"rgba(212,132,90,0.5)",orbGlow:"rgba(212,132,90,0.5)",lineActive:"rgba(212,132,90,0.3)",lineDim:"rgba(232,208,192,0.06)",dotActive:"rgba(212,132,90,0.5)",dotCur:"#d4845a",pillBg:"rgba(255,255,255,0.04)" },
  { name:"lavender",bg:["#ddd6e8","#d2c9e0","#c7bdd8","#d6cfe2"],accent:"#9a82b8",textMain:"#1e1a24",textSoft:"rgba(30,26,36,0.5)",textFaint:"rgba(30,26,36,0.22)",border:"rgba(30,26,36,0.07)",glass:"rgba(255,255,255,0.28)",shadow:"rgba(154,130,184,0.35)",shadowHover:"rgba(154,130,184,0.5)",orbGlow:"rgba(255,255,255,0.65)",lineActive:"rgba(255,255,255,0.3)",lineDim:"rgba(30,26,36,0.06)",dotActive:"rgba(255,255,255,0.55)",dotCur:"#fff",pillBg:"rgba(0,0,0,0.03)" },
  { name:"void",bg:["#060608","#0a0a10","#08080e","#050507"],accent:"#5a5a7a",textMain:"#a0a0b8",textSoft:"rgba(160,160,184,0.55)",textFaint:"rgba(160,160,184,0.25)",border:"rgba(160,160,184,0.06)",glass:"rgba(255,255,255,0.02)",shadow:"rgba(90,90,122,0.25)",shadowHover:"rgba(90,90,122,0.45)",orbGlow:"rgba(160,160,184,0.35)",lineActive:"rgba(160,160,184,0.2)",lineDim:"rgba(160,160,184,0.05)",dotActive:"rgba(160,160,184,0.35)",dotCur:"#8888a8",pillBg:"rgba(255,255,255,0.03)" },
];

const bgGrad=p=>`linear-gradient(180deg,${p.bg[0]} 0%,${p.bg[1]} 30%,${p.bg[2]} 60%,${p.bg[3]} 100%)`;

function PortalIcon({color,size=20}){
  return(
    <svg width={size} height={size} viewBox="0 0 586 1016" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:"block",transition:"all 0.8s"}}>
      <path d="M458.41 0C388.042 0 331 227.293 331 507.664C331 788.042 388.042 1015.33 458.41 1015.33C528.781 1015.33 585.823 788.042 585.823 507.664C585.823 227.293 528.781 0 458.41 0Z" fill={color} fillOpacity="0.2"/>
      <path d="M149.672 545.109C162.203 512.453 172.526 479.01 183.693 443.927C187.625 431.536 175.76 419.984 163.469 424.224C158.427 425.953 153.469 427.479 148.427 428.62C129.911 432.839 125.516 446.979 119.672 460.776C111.156 480.922 102.599 501.047 94.0261 521.146C84.625 543.198 65.1302 552.901 45.2448 545.51C25.026 538 16.3906 518.115 25.0052 496.302C38.1979 462.885 52.1563 429.745 65.8281 396.505C72.3177 380.74 83.9427 370.458 100.615 364.693C150.115 347.563 199.417 329.849 248.896 312.635C292.854 297.333 336.875 314.365 358.063 354.693C373.464 384.016 389.026 413.255 403.766 442.88C410.412 456.24 419.25 464.172 435.396 465.635C461.323 467.984 487.104 471.901 512.891 475.536C535.641 478.75 550.281 495.745 547.833 515.323C545.141 536.714 525.865 550.328 502.349 547.521C466.521 543.24 430.755 538.422 394.849 535.005C376.031 533.219 363.141 524.724 353.724 509.62C353.661 509.542 353.62 509.438 353.563 509.359C346.495 498.052 329.422 500.12 325.208 512.776C315.224 542.818 305.625 571.781 296.771 600.984C295.323 605.74 299.641 613.958 303.839 618.193C329.182 643.682 355.005 668.724 381.234 693.37C394.708 706 402.964 720.823 407 738.297C417.583 784.047 428.448 829.755 439.01 875.531C443.771 896.156 441.542 915.417 423.385 929.677C408.245 941.563 390.896 944.135 372.479 937.224C356.13 931.083 347.234 918.99 343.359 902.844C333.5 861.891 323.198 821.042 313.74 780.01C310.224 764.745 303.115 752.677 290.766 742.193C252.349 709.615 215.401 675.411 176.542 643.339C143.427 615.964 134.292 585.177 149.672 545.109Z" fill={color}/>
      <path d="M14.1823 854.458C43.276 822.49 72.8177 790.854 102.922 759.766C115.354 746.932 123.286 732.953 126.656 715.661C129.771 699.714 133.625 683.891 137.802 666.896C140.635 655.307 154.792 650.932 163.667 658.906C183.427 676.635 202.167 693.448 220.563 710.578C222.99 712.849 223.333 718.714 222.49 722.469C218.693 739.458 214.979 756.552 209.474 773.078C206.344 782.479 201.182 791.958 194.594 799.49C159.63 839.359 124.188 878.844 88.3438 917.984C69.1823 938.896 37.8385 940.641 17.0104 923.187C-3.95312 905.573 -5.68228 876.271 14.1823 854.458Z" fill={color}/>
      <path d="M373.583 308.12C328.318 308.422 292.073 273.958 291.911 230.453C291.75 186.411 328.12 151.141 373.865 151C418.167 150.859 454.552 186.391 454.792 230.01C455.036 273.693 419.531 307.818 373.583 308.12Z" fill={color}/>
    </svg>
  );
}

function DownloadIcon({color,size=14}){
  return(<svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{display:"inline-block",verticalAlign:"middle",marginRight:6}}><path d="M8 2v8m0 0l-3-3m3 3l3-3M3 12h10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>);
}

// ── Audio Processing ──
function createReverbImpulse(ctx,d2=1.8,decay=3){const r=ctx.sampleRate,l=r*d2,imp=ctx.createBuffer(2,l,r);for(let c=0;c<2;c++){const d=imp.getChannelData(c);for(let i=0;i<l;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/l,decay);}return imp;}

async function cleanupVoice(ctx,buf){
  const oc=new OfflineAudioContext(buf.numberOfChannels,buf.length,buf.sampleRate),s=oc.createBufferSource();s.buffer=buf;
  const hp=oc.createBiquadFilter();hp.type="highpass";hp.frequency.value=80;hp.Q.value=0.7;
  const lp=oc.createBiquadFilter();lp.type="lowpass";lp.frequency.value=12000;lp.Q.value=0.7;
  const mb=oc.createBiquadFilter();mb.type="peaking";mb.frequency.value=2500;mb.gain.value=3;mb.Q.value=1.2;
  const comp=oc.createDynamicsCompressor();comp.threshold.value=-24;comp.knee.value=12;comp.ratio.value=4;comp.attack.value=0.005;comp.release.value=0.15;
  const g=oc.createGain();g.gain.value=1.8;
  s.connect(hp);hp.connect(lp);lp.connect(mb);mb.connect(comp);comp.connect(g);g.connect(oc.destination);s.start(0);
  const rendered=await oc.startRendering();
  let mx=0;for(let c=0;c<rendered.numberOfChannels;c++){const d=rendered.getChannelData(c);for(let i=0;i<d.length;i++)if(Math.abs(d[i])>mx)mx=Math.abs(d[i]);}
  if(mx>0&&mx<0.95){const ng=0.92/mx;for(let c=0;c<rendered.numberOfChannels;c++){const d=rendered.getChannelData(c);for(let i=0;i<d.length;i++)d[i]*=ng;}}
  return rendered;
}

function createLoopedBuffer(ctx,src,dur,fade=FADE_DURATION){
  const r=ctx.sampleRate,sl=src.length,tl=Math.ceil(r*dur),fl=Math.ceil(r*fade),ch=src.numberOfChannels,out=ctx.createBuffer(ch,tl,r);
  for(let c=0;c<ch;c++){const sd=src.getChannelData(c),od=out.getChannelData(c);let p=0;while(p<tl){const cl2=Math.min(sl,tl-p);for(let i=0;i<cl2;i++){let s=sd[i];if(p>0&&i<fl)s*=i/fl;if(i>=sl-fl&&p+sl<tl)s*=1-(i-(sl-fl))/fl;const gp=p+i;if(gp>=tl-fl)s*=(tl-gp)/fl;od[gp]=(od[gp]||0)+s;}p+=sl-fl;}}
  return out;
}

async function applyReverb(ctx,buf,wet=REVERB_MIX){
  const imp=createReverbImpulse(ctx),oc=new OfflineAudioContext(buf.numberOfChannels,buf.length,ctx.sampleRate);
  const ds=oc.createBufferSource();ds.buffer=buf;const dg=oc.createGain();dg.gain.value=1-wet;ds.connect(dg);dg.connect(oc.destination);
  const ws=oc.createBufferSource();ws.buffer=buf;const cv=oc.createConvolver();cv.buffer=imp;const wg=oc.createGain();wg.gain.value=wet;ws.connect(cv);cv.connect(wg);wg.connect(oc.destination);
  ds.start(0);ws.start(0);return oc.startRendering();
}

function createRichBacking(ctx,duration){
  const r=ctx.sampleRate,l=Math.ceil(r*duration),b=ctx.createBuffer(2,l,r),L=b.getChannelData(0),R=b.getChannelData(1);
  const pads=[{f:110,a:.015,d:.02,p:0},{f:165,a:.012,d:.015,p:.3},{f:220,a:.01,d:.025,p:.7},{f:330,a:.008,d:.01,p:1.2},{f:440,a:.005,d:.018,p:2.1}];
  const nL=new Float32Array(l),nR=new Float32Array(l);
  for(let i=0;i<l;i++){nL[i]=(Math.random()*2-1)*.003;nR[i]=(Math.random()*2-1)*.003;}
  for(let i=1;i<l;i++){nL[i]=nL[i-1]*.997+nL[i]*.003;nR[i]=nR[i-1]*.997+nR[i]*.003;}
  for(let i=0;i<l;i++){const t=i/r,env=Math.min(1,t/15)*Math.min(1,(duration-t)/15),br=.85+.15*Math.sin(t*.08*Math.PI*2);const bL=Math.sin(2*Math.PI*200*t)*.03,bR=Math.sin(2*Math.PI*206*t)*.03;let pL=0,pR=0;for(const p of pads){const dr=Math.sin(t*p.d+p.p)*.8,la=.7+.3*Math.sin(t*.05+p.p*2),v=Math.sin(2*Math.PI*(p.f+dr)*t)*p.a*la;pL+=v*(.8+.2*Math.sin(t*.03+p.p));pR+=v*(.8+.2*Math.cos(t*.03+p.p));}const sub=Math.sin(2*Math.PI*55*t)*.008*(.8+.2*Math.sin(t*.04));L[i]=(bL+pL+sub+nL[i]*3)*env*br;R[i]=(bR+pR+sub+nR[i]*3)*env*br;}
  return b;
}

function mixBuffers(ctx,a,b,bv=1){const l=Math.max(a.length,b.length),o=ctx.createBuffer(2,l,ctx.sampleRate);for(let c=0;c<2;c++){const od=o.getChannelData(c),ad=c<a.numberOfChannels?a.getChannelData(c):a.getChannelData(0),bd=c<b.numberOfChannels?b.getChannelData(c):b.getChannelData(0);for(let i=0;i<l;i++)od[i]=(i<a.length?ad[i]:0)+(i<b.length?bd[i]*bv:0);}return o;}

function encodeWAV(buf){const nc=buf.numberOfChannels,sr=buf.sampleRate,ba=nc*2,dl=buf.length*ba,tl=44+dl,ab=new ArrayBuffer(tl),v=new DataView(ab);const w=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};w(0,"RIFF");v.setUint32(4,tl-8,true);w(8,"WAVE");w(12,"fmt ");v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,nc,true);v.setUint32(24,sr,true);v.setUint32(28,sr*ba,true);v.setUint16(32,ba,true);v.setUint16(34,16,true);w(36,"data");v.setUint32(40,dl,true);const cs=[];for(let c=0;c<nc;c++)cs.push(buf.getChannelData(c));let off=44;for(let i=0;i<buf.length;i++)for(let c=0;c<nc;c++){let s=Math.max(-1,Math.min(1,cs[c][i]));v.setInt16(off,s<0?s*0x8000:s*0x7fff,true);off+=2;}return new Blob([ab],{type:"audio/wav"});}
// ── Waveform ──
function WaveVis({analyserRef,isActive,color}){const ref=useRef(null),anim=useRef(null);useEffect(()=>{if(!isActive||!analyserRef?.current||!ref.current){if(anim.current)cancelAnimationFrame(anim.current);return;}const cv=ref.current,c=cv.getContext("2d"),an=analyserRef.current,bl=an.frequencyBinCount,da=new Uint8Array(bl);function draw(){anim.current=requestAnimationFrame(draw);an.getByteTimeDomainData(da);c.clearRect(0,0,cv.width,cv.height);c.lineWidth=2;c.strokeStyle=color;c.beginPath();const sw=cv.width/bl;let x=0;for(let i=0;i<bl;i++){const y=(da[i]/128)*cv.height/2;if(i===0)c.moveTo(x,y);else c.lineTo(x,y);x+=sw;}c.lineTo(cv.width,cv.height/2);c.stroke();}draw();return()=>{if(anim.current)cancelAnimationFrame(anim.current);};},[isActive,analyserRef,color]);return <canvas ref={ref} width={600} height={60} style={{width:"100%",height:"60px",opacity:isActive?.5:.15,transition:"opacity 0.5s"}}/>;}

// ── Timeline ──
function StepTimeline({currentStep,isProcessing,progress,pal}){
  const w=280,y=14,dotR=4,x0=28,x1=140,x2=252,breakMid=196,gapHalf=7;
  const Dot=({x,idx})=>{const cur=idx===currentStep,act=idx<=currentStep,sz=cur?8:5;return(<div style={{position:"absolute",left:x-14,top:y-14,width:28,height:28}}><div style={{width:sz,height:sz,borderRadius:"50%",background:act?(cur?pal.dotCur:pal.dotActive):pal.lineDim,position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",transition:"all 0.6s"}}/>{cur&&<div className="ts-orb" style={{width:28,height:28,borderRadius:"50%",background:`radial-gradient(circle,${pal.orbGlow} 0%,transparent 70%)`,position:"absolute",top:0,left:0}}/>}{cur&&isProcessing&&<svg style={{position:"absolute",top:-2,left:-2,width:32,height:32}}><circle cx={16} cy={16} r={14} fill="none" stroke={pal.orbGlow} strokeWidth="1.5" strokeDasharray={`${Math.PI*28*progress} ${Math.PI*28}`} strokeLinecap="round" transform="rotate(-90 16 16)" style={{transition:"stroke-dasharray 0.3s"}}/></svg>}</div>);};
  const Lbl=({x,text,idx})=>(<span style={{position:"absolute",left:x,top:y+20,transform:"translateX(-50%)",fontSize:9,fontWeight:currentStep===idx?500:400,letterSpacing:"0.12em",textTransform:"uppercase",color:idx<=currentStep?pal.textSoft:pal.textFaint,transition:"color 0.6s",whiteSpace:"nowrap"}}>{text}</span>);
  const a1=currentStep>=1,a2=currentStep>=2,lh=1.5,lt=y-lh/2;
  return(<div style={{position:"relative",width:w,height:56,margin:"0 auto 36px"}}>
    <div style={{position:"absolute",left:x0+dotR,top:lt,width:x1-x0-dotR*2,height:lh,background:a1?pal.lineActive:pal.lineDim,transition:"background 0.6s"}}/>
    <div style={{position:"absolute",left:x1+dotR,top:lt,width:breakMid-gapHalf-x1-dotR,height:lh,background:a2?pal.lineActive:pal.lineDim,transition:"background 0.6s"}}/>
    <div style={{position:"absolute",left:breakMid-gapHalf,top:y-5,width:1.5,height:10,background:a2?pal.lineActive:pal.lineDim,borderRadius:1,transition:"background 0.6s"}}/>
    <div style={{position:"absolute",left:breakMid+gapHalf,top:y-5,width:1.5,height:10,background:a2?pal.lineActive:pal.lineDim,borderRadius:1,transition:"background 0.6s"}}/>
    <div style={{position:"absolute",left:breakMid+gapHalf+1.5,top:lt,width:x2-dotR-breakMid-gapHalf-1.5,height:lh,background:a2?pal.lineActive:pal.lineDim,transition:"background 0.6s"}}/>
    <Dot x={x0} idx={0}/><Dot x={x1} idx={1}/><Dot x={x2} idx={2}/>
    <Lbl x={x0} text="Upload" idx={0}/><Lbl x={x1} text="Review" idx={1}/><Lbl x={x2} text="Shift" idx={2}/>
  </div>);
}

// ── Audio Player ──
function AudioPlayer({src,pal}){
  const[playing,setPlaying]=useState(false),[currentTime,setCurrentTime]=useState(0),[duration,setDuration]=useState(0);
  const ctxRef=useRef(null),bufferRef=useRef(null),sourceRef=useRef(null),startTimeRef=useRef(0),offsetRef=useRef(0),rafRef=useRef(null);
  useEffect(()=>{if(!src)return;setPlaying(false);setCurrentTime(0);setDuration(0);offsetRef.current=0;const ac=new(window.AudioContext||window.webkitAudioContext)();ctxRef.current=ac;fetch(src).then(r=>r.arrayBuffer()).then(ab=>ac.decodeAudioData(ab)).then(buf=>{bufferRef.current=buf;setDuration(buf.duration);}).catch(e=>console.error(e));return()=>{ac.close().catch(()=>{});if(rafRef.current)cancelAnimationFrame(rafRef.current);};},[src]);
  const stopSource=useCallback(()=>{if(sourceRef.current){try{sourceRef.current.stop();}catch{}sourceRef.current=null;}if(rafRef.current){cancelAnimationFrame(rafRef.current);rafRef.current=null;}},[]);
  const tick=useCallback(()=>{if(ctxRef.current&&playing){const el=ctxRef.current.currentTime-startTimeRef.current+offsetRef.current;if(el>=duration){setPlaying(false);setCurrentTime(0);offsetRef.current=0;stopSource();return;}setCurrentTime(el);rafRef.current=requestAnimationFrame(tick);}},[playing,duration,stopSource]);
  useEffect(()=>{if(playing)rafRef.current=requestAnimationFrame(tick);return()=>{if(rafRef.current)cancelAnimationFrame(rafRef.current);};},[playing,tick]);
  const toggle=useCallback(()=>{if(!bufferRef.current||!ctxRef.current)return;const ac=ctxRef.current;if(ac.state==="suspended")ac.resume();if(playing){offsetRef.current+=ac.currentTime-startTimeRef.current;stopSource();setPlaying(false);}else{const s=ac.createBufferSource();s.buffer=bufferRef.current;s.connect(ac.destination);s.onended=()=>{if(offsetRef.current+(ac.currentTime-startTimeRef.current)>=duration-0.1){setPlaying(false);setCurrentTime(0);offsetRef.current=0;}};startTimeRef.current=ac.currentTime;s.start(0,offsetRef.current);sourceRef.current=s;setPlaying(true);}},[playing,duration,stopSource]);
  const handleSeek=useCallback(e=>{if(!duration||!bufferRef.current||!ctxRef.current)return;const pct=Math.max(0,Math.min(1,(e.clientX-e.currentTarget.getBoundingClientRect().left)/e.currentTarget.getBoundingClientRect().width)),nt=pct*duration,wp=playing;stopSource();offsetRef.current=nt;setCurrentTime(nt);if(wp){const ac=ctxRef.current,s=ac.createBufferSource();s.buffer=bufferRef.current;s.connect(ac.destination);s.onended=()=>{if(offsetRef.current+(ac.currentTime-startTimeRef.current)>=duration-0.1){setPlaying(false);setCurrentTime(0);offsetRef.current=0;}};startTimeRef.current=ac.currentTime;s.start(0,nt);sourceRef.current=s;setPlaying(true);}},[duration,playing,stopSource]);
  const fmt=t=>(!t||!isFinite(t))?"0:00":`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,"0")}`;
  const pct=duration>0?(currentTime/duration)*100:0;
  return(<div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:pal.glass,backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)",borderRadius:30,border:`1px solid ${pal.border}`,transition:"all 0.8s"}}>
    <button onClick={toggle} style={{width:34,height:34,borderRadius:"50%",border:"none",background:pal.border,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.8s"}}>{playing?<svg width="12" height="12" viewBox="0 0 12 12"><rect x="1" y="1" width="3.5" height="10" rx="1" fill={pal.textSoft}/><rect x="7.5" y="1" width="3.5" height="10" rx="1" fill={pal.textSoft}/></svg>:<svg width="12" height="12" viewBox="0 0 12 12"><polygon points="3,0 12,6 3,12" fill={pal.textSoft}/></svg>}</button>
    <span style={{fontSize:11,color:pal.textFaint,fontVariantNumeric:"tabular-nums",minWidth:32,flexShrink:0,transition:"color 0.8s"}}>{fmt(currentTime)}</span>
    <div onClick={handleSeek} style={{flex:1,height:24,cursor:"pointer",display:"flex",alignItems:"center"}}><div style={{width:"100%",height:3,background:pal.border,borderRadius:2,position:"relative",transition:"background 0.8s"}}><div style={{width:`${pct}%`,height:"100%",background:pal.textFaint,borderRadius:2,transition:"width 0.1s linear,background 0.8s"}}/></div></div>
    <span style={{fontSize:11,color:pal.textFaint,fontVariantNumeric:"tabular-nums",minWidth:32,flexShrink:0,textAlign:"right",transition:"color 0.8s"}}>{fmt(duration)}</span>
  </div>);
}

// ── Duration Selector ──
function DurationSelector({value,onChange,pal}){
  const idx=DURATION_OPTIONS.indexOf(value),iw=72;
  return(<div style={{margin:"20px auto 0",width:"fit-content"}}>
    <p style={{fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:pal.textFaint,marginBottom:10,textAlign:"center",transition:"color 0.8s"}}>Duration</p>
    <div style={{position:"relative",display:"flex",borderRadius:28,background:pal.pillBg,padding:3,transition:"background 0.8s"}}>
      <div style={{position:"absolute",top:3,left:3+idx*iw,width:iw,height:"calc(100% - 6px)",background:"#fff",borderRadius:25,boxShadow:`0 2px 12px ${pal.shadow},0 1px 3px rgba(0,0,0,0.04)`,transition:"left 0.35s cubic-bezier(0.4,0,0.2,1),box-shadow 0.8s"}}/>
      {DURATION_OPTIONS.map(d=>(<button key={d} onClick={()=>onChange(d)} style={{width:iw,padding:"10px 0",border:"none",cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif",fontWeight:value===d?500:400,letterSpacing:"0.02em",background:"transparent",position:"relative",zIndex:1,color:value===d?pal.accent:pal.textFaint,transition:"color 0.3s"}}>{d} min</button>))}
    </div>
  </div>);
}

// ── Portal Button (0.8 default opacity) ──
function PortalButton({onShift,pal}){
  const[hover,setHover]=useState(false);
  return(<button onClick={onShift} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} title="Shift colors"
    style={{position:"fixed",top:20,right:20,width:32,height:32,border:"none",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.4s ease",zIndex:100,opacity:hover?1:0.8,transform:hover?"scale(1.15)":"scale(1)"}}>
    <PortalIcon color={pal.accent} size={24}/>
  </button>);
}

// ── Background Crossfade (new fades IN, no flash) ──
function BgCrossfade({palIdx}){
  const[layers,setLayers]=useState([{idx:palIdx,key:0,opacity:1}]);
  const keyRef=useRef(0);
  useEffect(()=>{keyRef.current++;const nk=keyRef.current;setLayers(prev=>[...prev,{idx:palIdx,key:nk,opacity:0}]);requestAnimationFrame(()=>{requestAnimationFrame(()=>{setLayers(prev=>prev.map(l=>l.key===nk?{...l,opacity:1}:l));});});const t=setTimeout(()=>{setLayers([{idx:palIdx,key:nk,opacity:1}]);},900);return()=>clearTimeout(t);},[palIdx]);
  return(<>{layers.map(l=>(<div key={l.key} style={{position:"fixed",inset:0,zIndex:0,background:bgGrad(PALETTES[l.idx]),opacity:l.opacity,transition:"opacity 0.8s ease"}}/>))}</>);
}

// ── Main Component ──
export default function TimelineShiftsAudioGenerator(){
  const[palIdx,setPalIdx]=useState(0);const pal=PALETTES[palIdx];
  const[state,setState]=useState(STATES.IDLE);
  const[voiceBlob,setVoiceBlob]=useState(null),[voiceUrl,setVoiceUrl]=useState(null);
  const[backingBlob,setBackingBlob]=useState(null),[backingName,setBackingName]=useState("");
  const[backingStatus,setBackingStatus]=useState("");
  const[downloadUrl,setDownloadUrl]=useState(null),[progress,setProgress]=useState(0),[statusText,setStatusText]=useState("");
  const[recordingTime,setRecordingTime]=useState(0),[errorMsg,setErrorMsg]=useState(""),[shifting,setShifting]=useState(false),[targetDuration,setTargetDuration]=useState(20);
  const mediaRecorderRef=useRef(null),chunksRef=useRef([]),streamRef=useRef(null),analyserRef=useRef(null),timerRef=useRef(null);
  const backingBufferRef=useRef(null);
  const currentStep=state===STATES.IDLE||state===STATES.RECORDING?STEPS.RECORD:state===STATES.HAS_AUDIO?STEPS.REVIEW:STEPS.SHIFT;
  const cleanup=useCallback(()=>{if(streamRef.current){streamRef.current.getTracks().forEach(t=>t.stop());streamRef.current=null;}if(timerRef.current){clearInterval(timerRef.current);timerRef.current=null;}},[]);
  const shiftPalette=useCallback(()=>setPalIdx(p=>{const n=(p+1)%PALETTES.length;window.dispatchEvent(new CustomEvent('tts-palette-shift',{detail:n}));return n;}),[]);

  // Pre-load backing track from URL
  useEffect(()=>{if(!BACKING_TRACK_URL)return;setBackingStatus("loading");const ac=new(window.AudioContext||window.webkitAudioContext)();fetch(BACKING_TRACK_URL).then(r=>{if(!r.ok)throw new Error();return r.arrayBuffer();}).then(ab=>ac.decodeAudioData(ab)).then(buf=>{backingBufferRef.current=buf;setBackingStatus("loaded");}).catch(()=>setBackingStatus("fallback"));return()=>ac.close().catch(()=>{});},[]);

  const startRecording=useCallback(async()=>{setErrorMsg("");try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});streamRef.current=stream;const actx=new(window.AudioContext||window.webkitAudioContext)(),src=actx.createMediaStreamSource(stream),an=actx.createAnalyser();an.fftSize=2048;src.connect(an);analyserRef.current=an;const mr=new MediaRecorder(stream);mediaRecorderRef.current=mr;chunksRef.current=[];mr.ondataavailable=e=>{if(e.data.size>0)chunksRef.current.push(e.data);};mr.onstop=()=>{const blob=new Blob(chunksRef.current,{type:"audio/webm"});setVoiceBlob(blob);setVoiceUrl(URL.createObjectURL(blob));setState(STATES.HAS_AUDIO);cleanup();};mr.start();setState(STATES.RECORDING);setRecordingTime(0);timerRef.current=setInterval(()=>setRecordingTime(t=>t+1),1000);}catch{setErrorMsg("Microphone access needed.");}},[cleanup]);
  const stopRecording=useCallback(()=>{if(mediaRecorderRef.current?.state==="recording")mediaRecorderRef.current.stop();},[]);
  const handleVoiceUpload=useCallback(e=>{setErrorMsg("");const f=e.target.files[0];if(!f)return;if(!f.type.startsWith("audio/")){setErrorMsg("Please upload an audio file.");return;}setVoiceBlob(f);setVoiceUrl(URL.createObjectURL(f));setState(STATES.HAS_AUDIO);},[]);
  const handleBackingUpload=useCallback(e=>{const f=e.target.files[0];if(!f)return;if(!f.type.startsWith("audio/")){setErrorMsg("Backing track must be audio.");return;}setBackingBlob(f);setBackingName(f.name);},[]);

  const processAudio=useCallback(async()=>{
    if(!voiceBlob)return;const dur=targetDuration*60;
    setShifting(true);await new Promise(r=>setTimeout(r,600));setShifting(false);
    setState(STATES.PROCESSING);setProgress(0);setErrorMsg("");
    try{
      const ac=new(window.AudioContext||window.webkitAudioContext)();
      setStatusText("Decoding…");setProgress(0.05);
      const dec=await ac.decodeAudioData(await voiceBlob.arrayBuffer());
      let st;if(dec.numberOfChannels===1){st=ac.createBuffer(2,dec.length,dec.sampleRate);st.getChannelData(0).set(dec.getChannelData(0));st.getChannelData(1).set(dec.getChannelData(0));}else st=dec;
      setStatusText("Cleaning up voice…");setProgress(0.15);await new Promise(r=>setTimeout(r,50));
      const cl=await cleanupVoice(ac,st);
      setStatusText("Looping…");setProgress(0.3);await new Promise(r=>setTimeout(r,50));
      const lp=createLoopedBuffer(ac,cl,dur,FADE_DURATION);
      setStatusText("Adding reverb…");setProgress(0.45);await new Promise(r=>setTimeout(r,50));
      const rv=await applyReverb(ac,lp,REVERB_MIX);
      setStatusText("Preparing backing…");setProgress(0.6);await new Promise(r=>setTimeout(r,50));
      let bk;
      if(backingBlob){
        bk=createLoopedBuffer(ac,await ac.decodeAudioData(await backingBlob.arrayBuffer()),dur,FADE_DURATION);
      } else if(backingBufferRef.current){
        bk=createLoopedBuffer(ac,backingBufferRef.current,dur,FADE_DURATION);
      } else if(BACKING_TRACK_URL){
        try{const resp=await fetch(BACKING_TRACK_URL);bk=createLoopedBuffer(ac,await ac.decodeAudioData(await resp.arrayBuffer()),dur,FADE_DURATION);}
        catch{bk=createRichBacking(ac,dur);}
      } else {
        bk=createRichBacking(ac,dur);
      }
      setStatusText("Mixing…");setProgress(0.75);await new Promise(r=>setTimeout(r,50));
      const mx=mixBuffers(ac,rv,bk,backingBlob?0.35:0.5);
      setStatusText("Encoding…");setProgress(0.9);await new Promise(r=>setTimeout(r,50));
      setDownloadUrl(URL.createObjectURL(encodeWAV(mx)));setProgress(1);setStatusText("Shifted.");setState(STATES.DONE);ac.close();
    }catch(err){console.error(err);setErrorMsg("Something went wrong. Try a shorter recording.");setState(STATES.HAS_AUDIO);}
  },[voiceBlob,backingBlob,targetDuration]);

  const goBack=useCallback(()=>{setState(STATES.IDLE);setVoiceBlob(null);setVoiceUrl(null);setRecordingTime(0);setErrorMsg("");},[]);
  const reset=useCallback(()=>{setState(STATES.IDLE);setVoiceBlob(null);setVoiceUrl(null);setBackingBlob(null);setBackingName("");setDownloadUrl(null);setProgress(0);setStatusText("");setRecordingTime(0);setErrorMsg("");cleanup();},[cleanup]);
  const fmt=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        .ts *,.ts *::before,.ts *::after{box-sizing:border-box;margin:0;padding:0}
        .ts{font-family:'DM Sans',sans-serif;color:${pal.textMain};min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px 20px;position:relative;z-index:1;transition:color 0.8s}
        .ts-c{max-width:440px;width:100%;text-align:center}
        .ts-h1{font-family:'Livvic',sans-serif;font-weight:700;font-size:20px;letter-spacing:0.15em;text-transform:uppercase;color:${pal.textMain};margin-bottom:40px;transition:color 0.8s}
        .ts-sub{font-size:11px;font-weight:400;letter-spacing:.18em;text-transform:uppercase;color:${pal.textFaint};margin-bottom:48px;transition:color 0.8s}
        .ts-lbl{font-size:11px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:${pal.textSoft};margin-bottom:16px;transition:color 0.8s}
        .ts-btn{font-family:'DM Sans',sans-serif;font-size:13px;font-weight:400;letter-spacing:.06em;border:1.5px solid ${pal.border};background:transparent;color:${pal.textMain};padding:13px 30px;border-radius:40px;cursor:pointer;transition:all .35s ease;text-transform:uppercase;display:inline-block;text-decoration:none;line-height:1}
        .ts-btn:hover{background:${pal.glass};border-color:${pal.textFaint}}
        .ts-shift{background:#fff!important;color:${pal.accent}!important;border:none!important;font-weight:500!important;letter-spacing:.1em!important;box-shadow:0 4px 24px ${pal.shadow},0 1px 6px ${pal.shadow}!important;padding:14px 36px!important;transition:all .4s ease!important}
        .ts-shift:hover{box-shadow:0 6px 32px ${pal.shadowHover},0 2px 10px ${pal.shadow}!important;transform:translateY(-2px)}
        .ts-dl{background:#fff!important;color:${pal.accent}!important;border:none!important;font-weight:500!important;box-shadow:0 4px 24px ${pal.shadow},0 1px 6px ${pal.shadow}!important;transition:all .4s ease!important;display:inline-flex!important;align-items:center!important}
        .ts-dl:hover{box-shadow:0 6px 32px ${pal.shadowHover}!important;transform:translateY(-2px)}
        .ts-sm{font-size:11px;padding:10px 22px}
        .ts-stop{border-color:${pal.textFaint};animation:tsB 2.5s ease-in-out infinite}
        .ts-back{width:36px;height:36px;border-radius:50%;border:1.5px solid ${pal.border};background:transparent;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .3s;flex-shrink:0}
        .ts-back:hover{background:${pal.glass};border-color:${pal.textFaint}}
        .ts-or{font-size:11px;color:${pal.textFaint};margin:14px 0;letter-spacing:.1em;transition:color 0.8s}
        .ts-fl{font-size:12px;color:${pal.textSoft};cursor:pointer;border-bottom:1px solid ${pal.border};padding-bottom:2px;transition:all .3s;text-decoration:none}
        .ts-fl:hover{color:${pal.textMain};border-color:${pal.textSoft}}
        .ts-fi{display:none}
        .ts-time{font-family:'Instrument Serif',serif;font-size:42px;font-weight:400;color:${pal.textMain};margin:20px 0;transition:color 0.8s}
        .ts-hint{font-size:12px;color:${pal.textFaint};font-weight:300;line-height:1.6;transition:color 0.8s}
        .ts-acts{display:flex;gap:12px;justify-content:center;align-items:center;flex-wrap:wrap}
        .ts-stat{font-family:'Instrument Serif',serif;font-size:20px;font-weight:400;font-style:italic;color:${pal.textSoft};margin:20px 0 8px;transition:color 0.8s}
        .ts-pbar{width:180px;height:2px;background:${pal.border};border-radius:1px;margin:14px auto;overflow:hidden;transition:background 0.8s}
        .ts-pfill{height:100%;background:${pal.textFaint};border-radius:1px;transition:width .4s,background 0.8s}
        .ts-done{font-family:'Instrument Serif',serif;font-size:17px;font-weight:400;color:${pal.textSoft};line-height:1.8;margin:20px 0;transition:color 0.8s}
        .ts-hp{font-size:11px;color:${pal.textFaint};letter-spacing:.04em;margin-top:14px;transition:color 0.8s}
        .ts-err{font-size:12px;color:#c06060;margin:12px 0}
        .ts-div{width:36px;height:1px;background:${pal.border};margin:24px auto;transition:background 0.8s}
        .ts-bk{margin-top:20px;padding:18px;border:1px solid ${pal.border};border-radius:14px;background:${pal.glass};backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);transition:all 0.8s}
        .ts-bkn{font-size:12px;color:${pal.textSoft};margin-top:8px;transition:color 0.8s}
        @keyframes tsB{0%,100%{box-shadow:0 0 0 transparent}50%{box-shadow:0 0 20px ${pal.orbGlow}}}
        .ts-orb{animation:tsO 2.5s ease-in-out infinite}
        @keyframes tsO{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.4);opacity:1}}
        .ts-exit{animation:tsExit .5s cubic-bezier(.4,0,1,1) forwards}
        @keyframes tsExit{0%{opacity:1;transform:translateX(0)}100%{opacity:0;transform:translateX(-40px)}}
        .ts-enter{animation:tsEnter .6s cubic-bezier(0,0,.2,1) forwards}
        @keyframes tsEnter{0%{opacity:0;transform:translateX(40px)}100%{opacity:1;transform:translateX(0)}}
      `}</style>
      <BgCrossfade palIdx={palIdx}/>
      <PortalButton onShift={shiftPalette} pal={pal}/>
      <div className="ts">
        <div className="ts-c">
          <h1 className="ts-h1">Personal Hypnosis Generator</h1>
          <StepTimeline currentStep={currentStep} isProcessing={state===STATES.PROCESSING} progress={progress} pal={pal}/>
          {shifting&&<div className="ts-exit" style={{minHeight:200}}><p className="ts-hint">Shifting…</p></div>}
          {!shifting&&state===STATES.IDLE&&(<div className="ts-enter">
            <p className="ts-lbl">Record or upload your affirmation</p>
            <button className="ts-btn" onClick={startRecording}>Begin Recording</button>
            <p className="ts-or">or</p>
            <label className="ts-fl">Upload an audio file<input type="file" accept="audio/*" className="ts-fi" onChange={handleVoiceUpload}/></label>
            <div className="ts-div"/>
            <p className="ts-hint">Speak your vision in present tense — as if it's already true.<br/>30 seconds to 2 minutes is ideal.</p>
          </div>)}
          {!shifting&&state===STATES.RECORDING&&(<div>
            <WaveVis analyserRef={analyserRef} isActive={true} color={pal.textSoft}/>
            <div className="ts-time">{fmt(recordingTime)}</div>
            <button className="ts-btn ts-stop" onClick={stopRecording}>Stop Recording</button>
          </div>)}
          {!shifting&&state===STATES.HAS_AUDIO&&(<div className="ts-enter">
            <p className="ts-lbl">Your recording</p>
            <AudioPlayer src={voiceUrl} pal={pal}/>
            <DurationSelector value={targetDuration} onChange={setTargetDuration} pal={pal}/>
            <div className="ts-bk">
              <p className="ts-lbl" style={{marginBottom:10}}>Backing track <span style={{textTransform:"none",letterSpacing:"normal",color:pal.textFaint}}>(optional)</span></p>
              <label className="ts-fl">{backingName?"Change track":"Upload your own ambient / theta track"}<input type="file" accept="audio/*" className="ts-fi" onChange={handleBackingUpload}/></label>
              {backingName&&<p className="ts-bkn">✓ {backingName}</p>}
              {!backingName&&backingStatus==="loaded"&&<p className="ts-hint" style={{marginTop:8}}>✓ Alpha-theta music pre-loaded</p>}
              {!backingName&&backingStatus!=="loaded"&&<p className="ts-hint" style={{marginTop:8}}>Rich ambient backing will be generated if you skip this.</p>}
            </div>
            <div style={{marginTop:22}} className="ts-acts">
              <button className="ts-back" onClick={goBack} title="Go back"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={pal.textFaint} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,2 4,7 9,12"/></svg></button>
              <button className="ts-btn ts-shift" onClick={processAudio}>Shift</button>
            </div>
          </div>)}
          {!shifting&&state===STATES.PROCESSING&&(<div className="ts-enter">
            <div className="ts-stat">{statusText}</div>
            <div className="ts-pbar"><div className="ts-pfill" style={{width:`${progress*100}%`}}/></div>
            <p className="ts-hint" style={{marginTop:16}}>Building your {targetDuration}-minute track…</p>
          </div>)}
          {!shifting&&state===STATES.DONE&&(<div className="ts-enter">
            <div className="ts-stat">{statusText}</div>
            <p className="ts-done">{targetDuration} minutes. Your voice. Light reverb.{backingName?<><br/>Layered with your backing track.</>:<><br/>Rich ambient backing.</>}<br/>Listen with headphones before sleep.</p>
            <div className="ts-acts">
              <a href={downloadUrl} download="timeline-shift.wav" className="ts-btn ts-dl"><DownloadIcon color={pal.accent} size={14}/>Download Track</a>
              <button className="ts-btn ts-sm" onClick={reset}>Start Over</button>
            </div>
            <p className="ts-hp">🎧 Headphones required for binaural beats</p>
          </div>)}
          {errorMsg&&<p className="ts-err">{errorMsg}</p>}
        </div>
      </div>
    </>
  );
}
