'use client';
import {Children,useEffect,useLayoutEffect,useRef,useState} from 'react';
import Icon from './Icon.jsx';

const labels={beranda:'Beranda',rangkaian:'Rangkaian',tema:'Tema',menfess:'Harewos',undian:'Undian',cinderamata:'Cenderamata','dress-code':'Busana',pesan:'Pesan',lokasi:'Lokasi',panutup:'Panutup'};
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
 const root=useRef(null),frames=useRef([]),surface=useRef(null),rail=useRef(null),activeRef=useRef(0),jump=useRef(()=>{});
 const [enabled,setEnabled]=useState(false),[active,setActive]=useState(0);
 useEffect(()=>{const query=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setEnabled(!query.matches);update();query.addEventListener('change',update);return()=>query.removeEventListener('change',update);},[]);
 const ids=scenes.map(scene=>scene.id).join('|');
 useLayoutEffect(()=>{
  if(!enabled)return;
  const container=root.current,sceneIds=ids.split('|'),frameNodes=frames.current.slice();let start=0,step=1,tick=0,jumpTimer,initialized=false,measured=false;
  function measure(){
   const position=measured ? Math.max(0,Math.min(sceneIds.length-1,(window.scrollY-start)/step)) : null;
   start=container.getBoundingClientRect().top+window.scrollY;step=Math.max(600,Math.round(innerHeight*1.08));container.style.height=`${innerHeight+(sceneIds.length-1)*step}px`;
   if(position!==null)window.scrollTo({top:start+position*step,behavior:'instant'});
   measured=true;draw();
  }
  function draw(){
   tick=0;
   if(document.querySelector('dialog[open]'))return;
   const progress=Math.max(0,Math.min(sceneIds.length-1,(window.scrollY-start)/step));
   const from=Math.floor(progress),to=Math.min(from+1,sceneIds.length-1),fraction=progress-from;
   const ease=clamp((fraction-.25)/.5),t=ease*ease*(3-2*ease),selected=t<.5 ? from : to;
   frameNodes.forEach((frame,i)=>{
    const opacity=i===from ? 1-t : i===to ? t : 0;
    frame.style.opacity=String(from===to && i===from ? 1 : opacity);
    frame.style.visibility=opacity>0 || i===selected ? 'visible' : 'hidden';
    frame.style.transform=i===from ? `translateX(${-20*t}px) scale(${1-.025*t})` : i===to ? `translateX(${20*(1-t)}px) scale(${1.025-.025*t})` : 'none';
   });
   surface.current.setAttribute('d',contour(shapes[from%3],shapes[to%3],t));
   surface.current.setAttribute('fill',tint(colors[from],colors[to],t));
   container.style.setProperty('--journey-position',String(progress));
   if(activeRef.current!==selected){activeRef.current=selected;setActive(selected);if(initialized)history.replaceState(null,'',location.pathname+location.search+'#'+sceneIds[selected]);}
  }
  function onScroll(){if(!tick)tick=requestAnimationFrame(draw);}
  function go(index,animate=true){
   if(index<0)return;
   clearTimeout(jumpTimer);container.classList.toggle('scene-jump',animate);
   if(animate)jumpTimer=setTimeout(()=>container.classList.remove('scene-jump'),650);
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
  measure();onHash();initialized=true;
  window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',measure);window.addEventListener('hashchange',onHash);window.addEventListener('popstate',onHash);document.addEventListener('click',onAnchor);
  return()=>{cancelAnimationFrame(tick);clearTimeout(jumpTimer);container.classList.remove('scene-jump');window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',measure);window.removeEventListener('hashchange',onHash);window.removeEventListener('popstate',onHash);document.removeEventListener('click',onAnchor);container.style.height='';frameNodes.forEach(frame=>{frame.style.opacity='';frame.style.visibility='';frame.style.transform='';});};
 },[enabled,ids]);
 useEffect(()=>{const button=rail.current?.children[active];if(button)rail.current.scrollTo({left:button.offsetLeft-rail.current.clientWidth/2+button.clientWidth/2,behavior:'smooth'});},[active]);
 function navigate(index){history.pushState(null,'','#'+scenes[index].id);jump.current(index);}
 return <main id="main" ref={root} className={`festival-journey ${enabled?'festival-immersive':''}`} data-current-scene={scenes[active].id}>
  <div className="festival-stage">
   <svg className="story-surface" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true"><path ref={surface} d={contour(shapes[0],shapes[0],0)} fill={colors[0]}/></svg>
   {scenes.map((scene,i)=><div key={scene.id} ref={el=>{frames.current[i]=el;}} className={`festival-frame scene-${scene.id}`} data-scene={scene.id} aria-hidden={enabled && active!==i ? true : undefined} inert={enabled && active!==i}><div className="scene-scroll" tabIndex={enabled && active===i ? 0 : undefined} aria-label={labels[scene.id]}>{scene.content}</div></div>)}
  </div>
  {enabled && <nav className="journey-controls" aria-label="Bagian perayaan"><button className="journey-step" aria-label="Bagian sebelumnya" disabled={active===0} onClick={()=>navigate(active-1)}><Icon name="arrow" style={{rotate:'180deg'}} size={17}/></button><div ref={rail} className="journey-rail">{scenes.map((scene,i)=><button key={scene.id} aria-current={i===active?'step':undefined} onClick={()=>navigate(i)}>{labels[scene.id]}</button>)}</div><button className="journey-step" aria-label="Bagian berikutnya" disabled={active===scenes.length-1} onClick={()=>navigate(active+1)}><Icon name="arrow" size={17}/></button></nav>}
 </main>;
}
