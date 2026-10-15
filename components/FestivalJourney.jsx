'use client';
import {Children,useEffect,useLayoutEffect,useRef,useState} from 'react';
import Icon from './Icon.jsx';
import WayangTheatre,{moveTheatre,WayangLogo} from './WayangTheatre.jsx';

const labels={beranda:'Beranda',rangkaian:'Rangkaian',tema:'Tema',menfess:'Harewos',undian:'Undian',cinderamata:'Cenderamata','dress-code':'Busana',pesan:'Pesan',lokasi:'Lokasi',panutup:'Penutup'};
const icons={beranda:'home',rangkaian:'calendar',tema:'sparkles',menfess:'message',undian:'ticket',cinderamata:'bag','dress-code':'shirt',pesan:'send',lokasi:'pin',panutup:'flag'};
const colors=['#eef0e2','#e9e7d5','#dce7d8','#efdcd1','#f4e8cf','#ebe0c4','#d8e6db','#f1ebdc','#dae6df','#0c575b'];
// Compatible contours for one plain interface surface; the source artwork is unchanged.
const shapes=[
 'M 100 20 C 360 -30 690 90 900 0 C 1030 10 940 390 1000 890 C 960 1030 610 940 110 1000 C -30 970 60 630 0 100 C 0 30 30 10 100 20 Z',
 'M 70 0 C 350 0 680 0 930 0 C 1000 0 1000 360 1000 930 C 1000 1000 680 1000 70 1000 C 0 1000 0 650 0 70 C 0 20 20 0 70 0 Z',
 'M 80 0 C 390 60 670 -35 930 30 C 990 50 1050 390 960 920 C 930 1000 640 1060 80 970 C -20 930 55 610 0 90 C 0 20 20 -10 80 0 Z',
].map(d=>d.match(/-?\d+/g).map(Number));
const clamp=n=>Math.max(0,Math.min(1,n));
function contour(a,b,t){const n=a.map((v,i)=>(v+(b[i]-v)*t).toFixed(2));return `M ${n.slice(0,2).join(' ')} ${[2,8,14,20,26].map(i=>'C '+n.slice(i,i+6).join(' ')).join(' ')} Z`;}
function tint(a,b,t){return '#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');}

export default function FestivalJourney({children}) {
 const nodes=Children.toArray(children),[hero,strip,...chapters]=nodes;
 const scenes=[{id:'beranda',content:<>{hero}{strip}</>},...chapters.map(node=>({id:node.props.id,content:node}))];
 const root=useRef(null),frames=useRef([]),surface=useRef(null),rail=useRef(null),activeRef=useRef(0),jump=useRef(()=>{}),objects=useRef({}),gate=useRef(null);
 const [enabled,setEnabled]=useState(false),[active,setActive]=useState(0);
 useEffect(()=>{const query=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setEnabled(!query.matches);update();query.addEventListener('change',update);return()=>query.removeEventListener('change',update);},[]);
 const ids=scenes.map(scene=>scene.id).join('|');
 useLayoutEffect(()=>{
  if(!enabled)return;
  const container=root.current,sceneIds=ids.split('|'),frameNodes=frames.current.slice(),scrollers=frameNodes.map(frame=>frame.querySelector('.scene-scroll'));let start=0,step=1,tick=0,edgeTick=0,transition=null,pausedAt=0,pausedDialog=null,initialized=false,measured=false,disposed=false,width=1,height=1,frameWidth=1,heroLayout;
  function fadeEdges(){
   edgeTick=0;
   scrollers.forEach(scroller=>{
    const top=scroller.scrollTop>2 ? 24 : 0,bottom=scroller.scrollHeight-scroller.clientHeight-scroller.scrollTop>2 ? 24 : 0;
    scroller.style.maskImage=top || bottom ? `linear-gradient(to bottom,transparent,#000 ${top}px,#000 calc(100% - ${bottom}px),transparent)` : 'none';
    scroller.style.webkitMaskImage=scroller.style.maskImage;
   });
  }
  function onInnerScroll(){if(!edgeTick)edgeTick=requestAnimationFrame(fadeEdges);}
  function measure(){
   const position=measured ? Math.max(0,Math.min(sceneIds.length-1,(window.scrollY-start)/step)) : null;
   start=container.getBoundingClientRect().top+window.scrollY;step=Math.max(600,Math.round(innerHeight*1.08));container.style.height=`${innerHeight+(sceneIds.length-1)*step}px`;
   width=container.clientWidth;height=container.firstElementChild.clientHeight;frameWidth=frameNodes[0].clientWidth;
   const first=frameNodes[0],previous=first.style.transform;first.style.transform='none';
   const stageTop=container.firstElementChild.getBoundingClientRect().top,frame=first.getBoundingClientRect(),copy=first.querySelector('.hero-copy').getBoundingClientRect(),strip=first.querySelector('.event-strip').getBoundingClientRect();
   heroLayout={left:width<=700 ? 26 : frame.left+18,right:width<=700 ? width-26 : copy.left-34,top:width<=700 ? copy.bottom-stageTop+14 : frame.top-stageTop+24,bottom:strip.top-stageTop-18,headerBottom:document.querySelector('.header').getBoundingClientRect().bottom-stageTop};
   first.style.transform=previous;
   if(position!==null)window.scrollTo({top:start+position*step,behavior:'instant'});
   measured=true;transition=null;fadeEdges();draw();
  }
  function draw(now=performance.now()){
   tick=0;
   const dialog=document.querySelector('dialog[open]');
   if(dialog){
    if(transition && !pausedAt)pausedAt=now;
    if(pausedDialog!==dialog){pausedDialog?.removeEventListener('close',onDialogClose);pausedDialog=dialog;dialog.addEventListener('close',onDialogClose,{once:true});}
    return;
   }
   const progress=Math.max(0,Math.min(sceneIds.length-1,(window.scrollY-start)/step));
   let from=Math.floor(progress),to=Math.min(from+1,sceneIds.length-1),fraction=progress-from;
   if(transition){from=transition.from;to=transition.to;fraction=clamp((now-transition.start)/1100);}
   const ease=transition ? fraction : clamp((fraction-.08)/.84),t=ease*ease*(3-2*ease),selected=t<.5 ? from : to;
   frameNodes.forEach((frame,i)=>{
    const outgoing=i===from,incoming=i===to,visible=from===to ? outgoing : outgoing && t<1 || incoming && t>0;
    frame.style.opacity=visible ? String(1-.12*Math.sin(Math.PI*t)) : '0';
    frame.style.visibility=visible ? 'visible' : 'hidden';
    frame.style.willChange=visible ? 'transform,clip-path' : 'auto';
    frame.style.zIndex=i===selected ? '2' : '1';
    // Leave the moving gunungan a clear seam: no glyphs are painted beneath it.
    const gap=Math.sin(Math.PI*t)*Math.min(250,height*.28)/frameWidth*100;
    frame.style.clipPath=from===to || t===0 || t===1 ? 'none' : outgoing ? `inset(0 ${(t*100+gap).toFixed(3)}% 0 0 round 24px)` : incoming ? `inset(0 0 0 ${((1-t)*100+gap).toFixed(3)}% round 24px)` : 'inset(0)';
    // Feather inside the reserved seam, keeping the gunungan clear of text.
    const edge=clamp(1-t+(incoming ? gap : -gap)/100)*100,feather=Math.min(64/frameWidth*100,12);
    frame.style.maskImage=visible && from!==to && t>0 && t<1 ? outgoing ? `linear-gradient(to right,#000 ${Math.max(0,edge-feather).toFixed(3)}%,transparent ${edge.toFixed(3)}%)` : `linear-gradient(to right,transparent ${edge.toFixed(3)}%,#000 ${Math.min(100,edge+feather).toFixed(3)}%)` : 'none';
    frame.style.webkitMaskImage=frame.style.maskImage;
    frame.style.transform=from===to ? 'none' : outgoing ? `perspective(1800px) translateZ(${-80*t}px) rotateY(${-6*t}deg)` : incoming ? `perspective(1800px) translateZ(${-80*(1-t)}px) rotateY(${6*(1-t)}deg)` : 'none';
   });
   surface.current.setAttribute('d',contour(shapes[from%3],shapes[to%3],t));
   surface.current.setAttribute('fill',tint(colors[from],colors[to],t));
   moveTheatre(objects.current,gate.current,from,to,t,width,height,heroLayout);
   container.style.setProperty('--journey-position',String(progress));
   container.dataset.motion=transition && fraction<1 ? 'transitioning' : 'idle';
   if(activeRef.current!==selected){activeRef.current=selected;setActive(selected);if(initialized && !transition)history.replaceState(null,'',location.pathname+location.search+'#'+sceneIds[selected]);}
   if(transition){if(fraction<1)tick=requestAnimationFrame(draw);else transition=null;}
  }
  function onScroll(){
   if(transition && Math.abs(window.scrollY-(start+transition.to*step))>2)transition=null;
   if(!tick)tick=requestAnimationFrame(draw);
  }
  function onDialogClose(){
   if(pausedAt && transition)transition.start+=performance.now()-pausedAt;
   pausedAt=0;pausedDialog=null;onScroll();
  }
  function go(index,animate=true){
   if(index<0)return;
   cancelAnimationFrame(tick);tick=0;
   transition=animate && index!==activeRef.current ? {from:activeRef.current,to:index,start:performance.now()} : null;
   frameNodes[index]?.querySelector('.scene-scroll')?.scrollTo({top:0});
   window.scrollTo({top:start+index*step,behavior:'instant'});draw();
  }
  jump.current=go;
  function onAnchor(event){
   const link=event.target.closest?.('a[href^="#"]');
   if(!link || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)return;
   const id=link.getAttribute('href').slice(1),index=sceneIds.indexOf(id);
   if(index<0)return;
   event.preventDefault();history.pushState(null,'','#'+id);go(index);
  }
  function onHash(){const index=sceneIds.indexOf(location.hash.slice(1));if(index>=0)go(index,false);}
  const edgeObserver=new ResizeObserver(onInnerScroll);
  scrollers.forEach(scroller=>{scroller.addEventListener('scroll',onInnerScroll,{passive:true});edgeObserver.observe(scroller);Array.from(scroller.children).forEach(child=>edgeObserver.observe(child));});
  measure();onHash();initialized=true;
  document.fonts.ready.then(()=>{if(!disposed)measure();});
  window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',measure);window.addEventListener('hashchange',onHash);window.addEventListener('popstate',onHash);document.addEventListener('click',onAnchor);
  return()=>{disposed=true;cancelAnimationFrame(tick);cancelAnimationFrame(edgeTick);edgeObserver.disconnect();scrollers.forEach(scroller=>{scroller.removeEventListener('scroll',onInnerScroll);scroller.style.removeProperty('mask-image');scroller.style.removeProperty('-webkit-mask-image');});pausedDialog?.removeEventListener('close',onDialogClose);window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',measure);window.removeEventListener('hashchange',onHash);window.removeEventListener('popstate',onHash);document.removeEventListener('click',onAnchor);container.style.height='';delete container.dataset.motion;frameNodes.forEach(frame=>{['opacity','visibility','transform','clip-path','mask-image','-webkit-mask-image','will-change','z-index'].forEach(key=>frame.style.removeProperty(key));});};
 },[enabled,ids]);
 useEffect(()=>{const button=rail.current?.children[active];if(button)rail.current.scrollTo({left:button.offsetLeft-rail.current.clientWidth/2+button.clientWidth/2,behavior:'smooth'});},[active]);
 function navigate(index){history.pushState(null,'','#'+scenes[index].id);jump.current(index);}
 return <main id="main" ref={root} className={`festival-journey ${enabled?'festival-immersive':''}`} data-current-scene={scenes[active].id}>
  <div className="festival-stage">
   <svg className="story-surface" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true"><path ref={surface} d={contour(shapes[0],shapes[0],0)} fill={colors[0]}/></svg>
   <WayangTheatre objects={objects} gate={gate}/>
   {scenes.map((scene,i)=><div key={scene.id} ref={el=>{frames.current[i]=el;}} className={`festival-frame scene-${scene.id}`} data-scene={scene.id} aria-hidden={enabled && active!==i ? true : undefined} inert={enabled && active!==i}><div className="scene-scroll" tabIndex={enabled && active===i ? 0 : undefined} aria-label={labels[scene.id]}>{scene.content}</div></div>)}
  </div>
  <WayangLogo objects={objects}/>
  {enabled && <nav className="journey-controls" aria-label="Bagian perayaan"><button className="journey-step" aria-label="Bagian sebelumnya" disabled={active===0} onClick={()=>navigate(active-1)}><Icon name="arrow" style={{rotate:'180deg'}} size={17}/></button><div ref={rail} className="journey-rail">{scenes.map((scene,i)=><button key={scene.id} aria-current={i===active?'step':undefined} onClick={()=>navigate(i)}><Icon name={icons[scene.id]} size={13}/>{labels[scene.id]}</button>)}</div><button className="journey-step" aria-label="Bagian berikutnya" disabled={active===scenes.length-1} onClick={()=>navigate(active+1)}><Icon name="arrow" size={17}/></button></nav>}
 </main>;
}
