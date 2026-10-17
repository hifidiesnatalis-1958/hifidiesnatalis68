'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {api} from './Home.jsx';
import {publicName} from '@/lib/npm.js';

export default function RafflePresentation() {
  const root=useRef(null),locked=useRef(false);
  const [stats,setStats]=useState(null),[ready,setReady]=useState(false),[loading,setLoading]=useState(true);
  const [prize,setPrize]=useState(''),[winner,setWinner]=useState(null),[drawPrize,setDrawPrize]=useState('');
  const [busy,setBusy]=useState(''),[error,setError]=useState(''),[rolling,setRolling]=useState('•••••');
  const [controls,setControls]=useState(true),[fullscreen,setFullscreen]=useState(false);
  const load=useCallback(async(clearError=true)=>{
    setLoading(true);setReady(false);if(clearError)setError('');
    try {const result=await api('/api/raffle');setStats(result);setReady(true);}
    catch(err) {setError(err.message);}
    finally {setLoading(false);}
  },[]);
  useEffect(()=>{load();},[load]);
  const drawing=busy==='draw',remaining=stats ? Math.max(0,stats.total-stats.winners.length) : 0;
  useEffect(()=>{
    if(!drawing || matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const update=()=>setRolling(Array.from({length:5},()=>Math.floor(Math.random()*10)).join(''));
    update();const timer=setInterval(update,80);return()=>clearInterval(timer);
  },[drawing]);
  const toggleFullscreen=useCallback(async()=>{
    try {
      if(document.fullscreenElement)await document.exitFullscreen();
      else if(root.current?.requestFullscreen)await root.current.requestFullscreen();
      else setError('Peramban ini belum mendukung layar penuh.');
    } catch {setError('Layar penuh belum dapat dibuka. Coba gunakan tombol layar penuh pada peramban.');}
  },[]);
  useEffect(()=>{
    const change=()=>setFullscreen(Boolean(document.fullscreenElement));
    const key=event=>{
      if(['INPUT','SELECT','TEXTAREA'].includes(event.target.tagName) || event.target.isContentEditable || event.altKey || event.ctrlKey || event.metaKey)return;
      if(event.key.toLowerCase()==='f'){event.preventDefault();toggleFullscreen();}
      if(event.key.toLowerCase()==='h'){event.preventDefault();setControls(value=>!value);}
    };
    document.addEventListener('fullscreenchange',change);document.addEventListener('keydown',key);
    return()=>{document.removeEventListener('fullscreenchange',change);document.removeEventListener('keydown',key);};
  },[toggleFullscreen]);
  async function draw(event) {
    event.preventDefault();
    if(locked.current || !ready || stats.open || !remaining || !prize.trim())return;
    locked.current=true;setBusy('draw');setError('');setWinner(null);setDrawPrize(prize.trim());setRolling('•••••');
    const revealAt=performance.now()+(matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 3000);
    try {
      // The server selects and stores the winner once; rolling digits are only a visual effect.
      const result=await api('/api/admin',{method:'POST',body:JSON.stringify({action:'draw',prize:prize.trim()})});
      if(!result.winner?.id || !result.winner.number)throw new Error('Hasil undian belum diterima. Muat ulang riwayat sebelum mengundi kembali.');
      const delay=Math.max(0,revealAt-performance.now());if(delay)await new Promise(resolve=>setTimeout(resolve,delay));
      setWinner(result.winner);
      setStats(old=>({...old,winners:[...old.winners.filter(row=>row.id!==result.winner.id),result.winner]}));
      await load(false);
    } catch(err) {
      // Do not replay an ambiguous POST. Require a fresh read of saved results before another draw.
      setReady(false);setError(err.message);
    } finally {locked.current=false;setBusy('');}
  }
  async function closeRegistration() {
    if(locked.current || !ready)return;
    locked.current=true;setBusy('close');setError('');
    try {await api('/api/admin',{method:'POST',body:JSON.stringify({action:'raffleOpen',open:false})});await load(false);}
    catch(err){setReady(false);setError(err.message);}
    finally {locked.current=false;setBusy('');}
  }
  function showWinner(row) {if(locked.current)return;setWinner(row);setDrawPrize(row.prize);}
  const shownPrize=winner?.prize || drawPrize || prize.trim();
  return <main ref={root} className={`presentation raffle-presentation ${controls ? '' : 'presentation-clean'}`}>
    <div className="presentation-brand"><img src="/assets/kasundaan/logo-68.webp" alt="Dies Natalis ke-68"/><div><p>HIFI FMIPA UNPAD</p><span>Undian berhadiah</span></div><span className="presentation-count">{stats ? `${stats.total} tiket · ${remaining} belum menang` : 'Memuat tiket…'}</span></div>
    <section className="presentation-stage" aria-label="Undian yang dipresentasikan" aria-busy={drawing}>
      <div className={`raffle-stage-content ${winner && !drawing ? 'raffle-revealed' : ''}`}>
        <img className="raffle-stage-flourish" src="/assets/kasundaan/flourish-gold.webp" alt=""/>
        {drawing ? <>
          <p className="raffle-stage-label" role="status">Sedang mengundi…</p>
          <strong className="raffle-ticket-number raffle-number-rolling" aria-hidden="true">DN68-{rolling}</strong>
          <p className="raffle-stage-prize">{shownPrize}</p>
        </> : winner ? <div role="status" aria-live="polite">
          <p className="raffle-stage-label">Selamat kepada</p>
          <h1 className={`raffle-winner-name ${publicName(winner.name).length>60 ? 'long' : ''}`}>{publicName(winner.name)}</h1>
          <strong className="raffle-ticket-number">{winner.number}</strong>
          <p className="raffle-stage-prize">{winner.prize}</p>
        </div> : <>
          <p className="raffle-stage-label">Dies Natalis HIFI ke-68</p>
          <h1 className="raffle-standby-title">{loading ? 'Memuat undian…' : !ready ? 'Data undian belum tersedia.' : !stats.total ? 'Belum ada peserta undian.' : !remaining ? 'Semua peserta telah mendapat hadiah.' : 'Undian berhadiah.'}</h1>
          {shownPrize && <p className="raffle-stage-prize">{shownPrize}</p>}
        </>}
      </div>
    </section>
    {controls ? <div className="presentation-controls">
      <div className="presentation-status"><span>{stats ? `Pendaftaran ${stats.open ? 'dibuka' : 'ditutup'}` : 'Menunggu data undian'}</span>{stats?.open && <span>Tutup pendaftaran sebelum mengundi.</span>}{winner && <span>Hasil tersimpan · {winner.number}</span>}</div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <form className="raffle-presentation-form" onSubmit={draw}>
        <label htmlFor="presentation-prize">Hadiah yang diundi<input id="presentation-prize" required maxLength={120} value={prize} onChange={event=>setPrize(event.target.value)} disabled={Boolean(busy)}/></label>
        <button className="button" disabled={Boolean(busy) || !ready || stats?.open || !remaining || !prize.trim()}>{drawing ? 'Sedang mengundi…' : 'Undi pemenang'}</button>
        {stats?.open && <button type="button" className="button secondary" disabled={Boolean(busy) || !ready} onClick={closeRegistration}>{busy==='close' ? 'Menutup…' : 'Tutup pendaftaran'}</button>}
      </form>
      <div className="presentation-buttons">
        <a className="button secondary" href="/admin">Buka panel panitia</a><a className="button secondary" href="/presentasi">Presentasi Harewos</a>
        <button className="button secondary" onClick={()=>load()} disabled={Boolean(busy) || loading}>Muat ulang</button>
        <button className="button secondary" onClick={toggleFullscreen}>{fullscreen ? 'Keluar layar penuh' : 'Layar penuh'}</button>
        <button className="button secondary" onClick={()=>setControls(false)}>Sembunyikan kontrol</button>
      </div>
      {stats?.winners.length>0 && <details className="raffle-presentation-history"><summary>Riwayat pemenang ({stats.winners.length})</summary><ol>{[...stats.winners].reverse().map(row=><li key={row.id}><span><strong>{publicName(row.name)}</strong><small>{row.number} · {row.prize}</small></span><button type="button" className="button secondary" disabled={Boolean(busy)} aria-pressed={winner?.id===row.id} onClick={()=>showWinner(row)}>Tampilkan hasil</button></li>)}</ol></details>}
      <p className="presentation-shortcuts">F layar penuh · H tampilkan/sembunyikan kontrol</p>
    </div> : <button className="presentation-show-controls" onClick={()=>setControls(true)}>Tampilkan kontrol</button>}
  </main>;
}
