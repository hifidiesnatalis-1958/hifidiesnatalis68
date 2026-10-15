'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {api} from './Home.jsx';

function shuffled(posts) {
  const result=[...posts];
  for(let i=result.length-1;i>0;i--) {const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
export default function Presentation() {
  const root=useRef(null);
  const [posts,setPosts]=useState([]),[index,setIndex]=useState(0),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const [auto,setAuto]=useState(false),[seconds,setSeconds]=useState(12),[controls,setControls]=useState(true),[fullscreen,setFullscreen]=useState(false),[blocked,setBlocked]=useState(0);
  const load=useCallback(async()=>{
    setLoading(true);setError('');setAuto(false);
    try {const result=await api('/api/presentation');setPosts(shuffled(result.posts));setIndex(0);setBlocked(result.blocked || 0);}
    catch(err) {setError(err.message);setPosts([]);setIndex(0);}
    finally {setLoading(false);}
  },[]);
  useEffect(()=>{load();},[load]);
  const next=useCallback(()=>setIndex(current=>Math.min(current+1,Math.max(0,posts.length-1))),[posts.length]);
  const previous=useCallback(()=>setIndex(current=>Math.max(0,current-1)),[]);
  const toggleFullscreen=useCallback(async()=>{
    try {if(document.fullscreenElement) await document.exitFullscreen();else if(root.current?.requestFullscreen) await root.current.requestFullscreen();else setError('Peramban ini belum mendukung layar penuh.');}
    catch {setError('Layar penuh belum dapat dibuka. Coba gunakan tombol layar penuh pada peramban.');}
  },[]);
  useEffect(()=>{
    const change=()=>setFullscreen(Boolean(document.fullscreenElement));document.addEventListener('fullscreenchange',change);
    return ()=>document.removeEventListener('fullscreenchange',change);
  },[]);
  useEffect(()=>{
    const key=e=>{
      if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable || e.altKey || e.ctrlKey || e.metaKey) return;
      if(e.key==='ArrowRight') {e.preventDefault();next();}
      if(e.key==='ArrowLeft') {e.preventDefault();previous();}
      if(e.code==='Space' && !['BUTTON','A'].includes(e.target.tagName) && posts.length>1) {e.preventDefault();setAuto(value=>!value);}
      if(e.key.toLowerCase()==='f') {e.preventDefault();toggleFullscreen();}
      if(e.key.toLowerCase()==='h') {e.preventDefault();setControls(value=>!value);}
    };
    document.addEventListener('keydown',key);return ()=>document.removeEventListener('keydown',key);
  },[next,previous,toggleFullscreen,posts.length]);
  useEffect(()=>{
    if(!auto) return;
    if(index>=posts.length-1) {setAuto(false);return;}
    const timer=setTimeout(next,seconds*1000);return ()=>clearTimeout(timer);
  },[auto,index,posts.length,seconds,next]);
  const post=posts[index];
  function reshuffle() {setAuto(false);setPosts(old=>shuffled(old));setIndex(0);}
  return <main ref={root} className={`presentation ${controls ? '' : 'presentation-clean'}`}>
    <div className="presentation-brand"><img src="/assets/kasundaan/logo-68.webp" alt="Dies Natalis ke-68"/><div><p>HIFI FMIPA UNPAD</p><span>Harewos · Pesan anonim warhim</span></div><span className="presentation-count">{posts.length ? index+1 : 0} / {posts.length}</span></div>
    <section className="presentation-stage" aria-label="Harewos yang dipresentasikan" aria-live="polite">
      {loading ? <p role="status">Memuat pesan yang sudah disetujui…</p> : post ? <article className="presentation-card" key={post.id}>{post.to && <p className="presentation-to">Untuk {post.to}</p>}<p className={`presentation-body ${post.body.length>450 ? 'long' : ''}`}>{post.body}</p><footer><strong>Pengirim anonim</strong></footer></article> : <div className="presentation-empty"><img src="/assets/kasundaan/flourish-gold.webp" alt=""/><h1>Belum ada pesan<br/>yang siap ditayangkan.</h1><p>{error || 'Tinjau dan setujui kiriman Harewos di panel panitia terlebih dahulu.'}</p></div>}
    </section>
    {controls ? <div className="presentation-controls"><div className="presentation-status"><span>Penyaringan kata aktif · Hanya pesan yang sudah disetujui</span>{blocked>0 && <span>{blocked} pesan tersaring</span>}{error && posts.length>0 && <p role="alert">{error}</p>}</div><div className="presentation-buttons"><a href="/admin" className="button secondary">Panel panitia</a><button className="button secondary" onClick={load} disabled={loading}>Muat ulang</button><button className="button secondary" onClick={reshuffle} disabled={loading || posts.length<2}>Acak ulang</button><button className="button secondary" onClick={previous} disabled={loading || index===0}>← Sebelumnya</button><button className="button" onClick={next} disabled={loading || index>=posts.length-1}>Berikutnya →</button><button className="button secondary" aria-pressed={auto} disabled={loading || posts.length<2 || index>=posts.length-1} onClick={()=>setAuto(value=>!value)}>{auto ? 'Jeda otomatis' : 'Putar otomatis'}</button><label className="presentation-duration">Durasi<select aria-label="Durasi tiap pesan" value={seconds} onChange={e=>setSeconds(Number(e.target.value))}>{[8,12,20,30].map(n=><option key={n} value={n}>{n} detik</option>)}</select></label><button className="button secondary" onClick={toggleFullscreen}>{fullscreen ? 'Keluar layar penuh' : 'Layar penuh'}</button><button className="button secondary" onClick={()=>setControls(false)}>Sembunyikan kontrol</button></div><p className="presentation-shortcuts">← → ganti pesan · Spasi putar/jeda · F layar penuh · H tampilkan/sembunyikan kontrol</p></div> : <button className="presentation-show-controls" onClick={()=>setControls(true)}>Tampilkan kontrol</button>}
  </main>;
}
