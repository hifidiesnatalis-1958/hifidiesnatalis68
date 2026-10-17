'use client';
import {useEffect,useRef,useState} from 'react';
import {api} from './Home.jsx';
import {publicName} from '@/lib/npm.js';

export default function RafflePresentation({resultId=''}) {
  const root=useRef(null),locked=useRef(true),blocked=useRef(false);
  const [stats,setStats]=useState(null),[loading,setLoading]=useState(true),[winner,setWinner]=useState(null);
  const [drawing,setDrawing]=useState(false),[error,setError]=useState(''),[rolling,setRolling]=useState('•••••');
  useEffect(()=>{
    let active=true;
    api('/api/raffle').then(result=>{
      if(!active)return;setStats(result);setWinner(result.winners.find(row=>row.id===resultId) || null);
    }).catch(err=>{if(active)setError(err.message);}).finally(()=>{if(active){setLoading(false);locked.current=false;}});
    return()=>{active=false;};
  },[resultId]);
  useEffect(()=>{
    if(!drawing || matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const update=()=>setRolling(Array.from({length:5},()=>Math.floor(Math.random()*10)).join(''));
    update();const timer=setInterval(update,80);return()=>clearInterval(timer);
  },[drawing]);
  useEffect(()=>{
    async function key(event) {
      if(event.code!=='Space' || event.repeat || event.altKey || event.ctrlKey || event.metaKey)return;
      event.preventDefault();
      if(locked.current || blocked.current)return;
      locked.current=true;let submitted=false;setError('');
      // Fullscreen needs this keyboard gesture; unsupported browsers keep the normal page.
      if(!document.fullscreenElement)root.current?.requestFullscreen?.().catch(()=>{});
      try {
        // Read current registration and saved results before each draw, including changes from the admin tab.
        const current=await api('/api/raffle');setStats(current);setLoading(false);
        if(current.open){setError('Tutup pendaftaran dari panel panitia sebelum mengundi.');return;}
        if(current.total<=current.winners.length)return;
        setDrawing(true);setWinner(null);setRolling('•••••');
        const revealAt=performance.now()+(matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 3000);
        submitted=true;
        const result=await api('/api/admin',{method:'POST',body:JSON.stringify({action:'draw'})});
        if(!result.winner?.id || !result.winner.number)throw new Error('Hasil undian belum diterima.');
        const delay=Math.max(0,revealAt-performance.now());if(delay)await new Promise(resolve=>setTimeout(resolve,delay));
        setWinner(result.winner);setStats({...current,winners:[...current.winners,result.winner]});
      } catch(err) {
        // Never replay a draw that may already be saved. Recover from the main admin panel.
        blocked.current=submitted;
        setError(submitted ? `${err.message} Periksa riwayat di panel panitia, lalu buka kembali presentasi.` : err.message);
      } finally {locked.current=false;setDrawing(false);setLoading(false);}
    }
    document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);
  },[]);
  const remaining=stats ? Math.max(0,stats.total-stats.winners.length) : 0;
  return <main ref={root} className="presentation raffle-presentation presentation-clean">
    <div className="presentation-brand"><img src="/assets/kasundaan/logo-68.webp" alt="Dies Natalis ke-68"/><div><p>HIFI FMIPA UNPAD</p><span>Doorprize</span></div><span className="presentation-count">{stats ? `${stats.total} tiket · ${remaining} belum menang` : 'Memuat tiket…'}</span></div>
    <section className="presentation-stage" aria-label="Undian yang dipresentasikan" aria-busy={drawing}>
      <div className={`raffle-stage-content ${winner && !drawing ? 'raffle-revealed' : ''}`}>
        <img className="raffle-stage-flourish" src="/assets/kasundaan/flourish-gold.webp" alt=""/>
        {drawing ? <>
          <p className="raffle-stage-label" role="status">Sedang mengundi…</p>
          <strong className="raffle-ticket-number raffle-number-rolling" aria-hidden="true">DN68-{rolling}</strong>
        </> : winner ? <div role="status" aria-live="polite">
          <p className="raffle-stage-label">Selamat kepada</p>
          <h1 className={`raffle-winner-name ${publicName(winner.name).length>60 ? 'long' : ''}`}>{publicName(winner.name)}</h1>
          <strong className="raffle-ticket-number">{winner.number}</strong>
        </div> : <>
          <p className="raffle-stage-label">Dies Natalis HIFI ke-68</p>
          <h1 className="raffle-standby-title">{loading ? 'Memuat undian…' : !stats ? 'Data undian belum tersedia.' : !stats.total ? 'Belum ada peserta undian.' : !remaining ? 'Semua peserta telah mendapat hadiah.' : 'Doorprize'}</h1>
        </>}
        {error && <p className="raffle-stage-error" role="alert">{error}</p>}
      </div>
    </section>
  </main>;
}
