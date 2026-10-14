'use client';
import {useEffect,useState} from 'react';
import {api} from './Home.jsx';
import Icon from './Icon.jsx';
export default function Auth() {
  const [mode,setMode]=useState('login'),[nickname,setNickname]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState('');
  const [visible,setVisible]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const register=mode==='register';
  useEffect(()=>{if(new URLSearchParams(window.location.search).get('mode')==='daftar') setMode('register');},[]);
  function switchMode(next) {
    setMode(next);setError('');setPassword('');setConfirm('');setVisible(false);
    const url=new URL(window.location.href);url.searchParams.set('mode',next==='register' ? 'daftar' : 'masuk');window.history.replaceState(null,'',url);
  }
  async function submit(event) {
    event.preventDefault();setError('');
    if(register && password!==confirm) {setError('Konfirmasi password belum sama.');return;}
    setBusy(true);
    try {
      const result=await api(register ? '/api/auth/register' : '/api/auth/login',{method:'POST',body:JSON.stringify({nickname,password,...(register ? {passwordConfirm:confirm} : {})})});
      const session=await api('/api/session');
      if(session.user?.id!==result.user?.id) throw new Error('Akun berhasil diproses, tetapi sesi belum tersimpan. Izinkan cookie untuk situs ini, lalu masuk kembali.');
      const requested=new URLSearchParams(window.location.search).get('next');
      const path=requested && (/^\/(?:#[a-z0-9-]*)?$/.test(requested) || ['/admin','/presentasi'].includes(requested)) ? requested : result.user.role==='admin' ? '/admin' : '/';
      const target=new URL(path,window.location.origin);if(target.pathname==='/') target.searchParams.set('welcome','1');
      window.location.assign(target.pathname+target.search+target.hash);
    } catch(err) {setError(err.message);setBusy(false);}
  }
  return <>
    <header className="auth-header wrap"><a href="/" className="brand"><img src="/assets/kasundaan/logo-68.webp" alt=""/><span>Dies Natalis <b>HIFI 68</b></span></a><a href="/" className="text-link">Kembali ke acara<Icon name="arrow" size={16}/></a></header>
    <main className="auth-page wrap">
      <div className="auth-story"><p className="small-label">HIFI FMIPA UNPAD · 2026</p><h2>Pintu sua<br/><em>keluarga HIFI.</em></h2><p>Cukup satu akun sederhana untuk menitipkan bisikan Harewos, berbagi doa, dan menjemput tiket undian baraya.</p><div className="auth-emblem"><img src="/assets/kasundaan/logo-68.webp" alt="Logo Dies Natalis HIFI ke-68"/></div><img className="auth-flourish" src="/assets/kasundaan/flourish-gold.webp" alt=""/><p className="auth-story-note">Dies Natalis 68 · Merawat Guyub Kasundaan</p></div>
      <div className="auth-panel">
        <div className="auth-switch" role="group" aria-label="Pilih masuk atau daftar"><button aria-pressed={!register} disabled={busy} onClick={()=>switchMode('login')}>Masuk</button><button aria-pressed={register} disabled={busy} onClick={()=>switchMode('register')}>Daftar</button></div>
        <h1>{register ? 'Mulai langkah ceritamu.' : 'Wilujeng sumping kembali.'}</h1><p className="auth-description">{register ? 'Tentukan nama panggilan dan kata sandi pilihanmu sendiri.' : 'Masukkan nama panggilan dan kata sandi yang telah kamu buat.'}</p>
        <form className="auth-form" onSubmit={submit}>
          <label htmlFor="auth-nickname">Nickname</label><input id="auth-nickname" name="nickname" autoComplete="username" autoCorrect="off" spellCheck={false} required minLength={2} maxLength={40} value={nickname} disabled={busy} onChange={e=>setNickname(e.target.value)} placeholder="Nickname pilihan kamu" aria-describedby={register ? 'nickname-help' : undefined}/>
          {register && <p className="auth-field-help" id="nickname-help">Bebas memilih nama panggilan (2–40 karakter). Mendukung spasi, simbol, huruf besar maupun kecil.</p>}
          <label htmlFor="auth-password">Password</label><div className="auth-password"><input id="auth-password" name="password" type={visible ? 'text' : 'password'} autoComplete={register ? 'new-password' : 'current-password'} required minLength={register ? 10 : 1} maxLength={128} value={password} disabled={busy} onChange={e=>setPassword(e.target.value)} aria-describedby={register ? 'password-help' : undefined}/><button type="button" onClick={()=>setVisible(!visible)} aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}>{visible ? 'Sembunyikan' : 'Tampilkan'}</button></div>
          {register && <><p id="password-help" className="auth-field-help">Minimal 10 karakter. Disarankan memakai frasa atau kalimat yang mudah kamu ingat.</p><label htmlFor="auth-confirm">Ulangi password</label><input id="auth-confirm" name="passwordConfirm" type={visible ? 'text' : 'password'} autoComplete="new-password" required minLength={10} maxLength={128} value={confirm} disabled={busy} onChange={e=>setConfirm(e.target.value)}/></>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button" disabled={busy}>{busy ? (register ? 'Membuat akun…' : 'Memeriksa…') : register ? 'Buat akun' : 'Masuk'}<Icon name="arrow" size={18}/></button>
        </form>
        <p className="auth-bottom">{register ? 'Sudah punya akun?' : 'Belum punya akun?'} <button type="button" disabled={busy} onClick={()=>switchMode(register ? 'login' : 'register')}>{register ? 'Masuk di sini' : 'Daftar di sini'}</button></p>
        <p className="auth-privacy">Privasi terjamin: Dinding Harewos beroperasi sepenuhnya anonim tanpa pernah menampilkan nama panggilanmu.</p>
      </div>
    </main>
  </>;
}
