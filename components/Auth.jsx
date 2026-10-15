'use client';
import {useEffect,useState} from 'react';
import {api} from './Home.jsx';
import Icon from './Icon.jsx';
export default function Auth() {
  const [mode,setMode]=useState('login'),[identity,setIdentity]=useState(''),[name,setName]=useState('');
  const [password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[visible,setVisible]=useState(false);
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[consent,setConsent]=useState(false);
  const register=mode==='register',operator=mode==='operator';
  useEffect(()=>{const mode=new URLSearchParams(location.search).get('mode');if(mode==='daftar')setMode('register');if(mode==='panitia')setMode('operator');},[]);
  function switchMode(next){setMode(next);setError('');setIdentity('');setName('');setPassword('');setConfirm('');setVisible(false);setConsent(false);}
  function continueTo(user){
    const requested=new URLSearchParams(location.search).get('next');
    const path=requested && (/^\/(?:#[a-z0-9-]*)?$/.test(requested) || ['/admin','/presentasi'].includes(requested)) ? requested : user.role==='admin' ? '/admin' : '/';
    const target=new URL(path,location.origin);if(target.pathname==='/')target.searchParams.set('welcome','1');
    location.assign(target.pathname+target.search+target.hash);
  }
  async function submit(event){
    event.preventDefault();setError('');
    if(register && password!==confirm){setError('Konfirmasi kata sandi belum sama.');return;}
    setBusy(true);
    try{
      const data=operator ? {operator:true,nickname:identity,password} : {npm:identity,password,...(register ? {name,passwordConfirm:confirm} : {})};
      const result=await api(register ? '/api/auth/register' : '/api/auth/login',{method:'POST',body:JSON.stringify(data)});
      const session=await api('/api/session');
      if(session.user?.id!==result.user?.id)throw new Error('Sesi belum tersimpan. Buka situs langsung di tab baru dan izinkan cookie, lalu masuk kembali.');
      continueTo(result.user);
    }catch(err){setError(err.message);}finally{setBusy(false);}
  }
  return <>
    <header className="auth-header wrap"><a href="/" className="brand"><img src="/assets/kasundaan/logo-68.webp" alt=""/><span>Dies Natalis <b>HIFI 68</b></span></a><a href="/" className="text-link">Kembali ke acara<Icon name="arrow" size={16}/></a></header>
    <main className="auth-page wrap">
      <div className="auth-story"><p className="small-label">HIFI FMIPA UNPAD · 2026</p><h2>Akun warhim<br/><em>Dies Natalis HIFI.</em></h2><p>Gunakan satu akun NPM untuk mengirim Harewos, menulis pesan dan kesan, serta mengambil tiket undian.</p><div className="auth-emblem"><img src="/assets/kasundaan/logo-68.webp" alt="Logo Dies Natalis HIFI ke-68"/></div><img className="auth-flourish" src="/assets/kasundaan/flourish-gold.webp" alt=""/></div>
      <div className="auth-panel">
        <div className="auth-switch" role="group" aria-label="Pilih masuk atau daftar">
          <button aria-pressed={mode==='login'} disabled={busy} onClick={()=>switchMode('login')}>Masuk</button>
          <button aria-pressed={register} disabled={busy} onClick={()=>switchMode('register')}>Daftar</button>
          <button aria-pressed={operator} disabled={busy} onClick={()=>switchMode('operator')}>Panitia</button>
        </div>
        <h1>{register ? 'Satu NPM, satu akun.' : operator ? 'Masuk sebagai panitia.' : 'Selamat datang kembali.'}</h1>
        <p className="auth-description">{register ? 'Isi nama, NPM, dan kata sandi pilihanmu. Terbuka untuk warhim Fisika Unpad sampai angkatan 25.' : operator ? 'Gunakan akun panitia yang sudah terdaftar.' : 'Masuk dengan NPM dan kata sandi pilihanmu.'}</p>
        <form className="auth-form" onSubmit={submit}>
          {register && <><label htmlFor="auth-name">Nama lengkap</label><input id="auth-name" name="name" autoComplete="name" required minLength={2} maxLength={100} value={name} disabled={busy} onChange={e=>setName(e.target.value)} placeholder="Nama kamu"/></>}
          <label htmlFor="auth-identity">{operator ? 'Nama pengguna' : 'NPM'}</label>
          <input id="auth-identity" name={operator ? 'nickname' : 'npm'} type="text" inputMode={operator ? 'text' : 'numeric'} autoComplete="username" autoCorrect="off" spellCheck={false} required minLength={operator ? 2 : 12} maxLength={operator ? 40 : 12} pattern={operator ? undefined : '140310(0[0-9]|1[0-9]|2[0-5])00[0-9]{2}'} value={identity} disabled={busy} onChange={e=>setIdentity(e.target.value)} placeholder={operator ? 'Nama pengguna panitia' : 'Masukkan 12 digit NPM'} aria-describedby={operator ? undefined : 'npm-help'}/>
          {!operator && <p className="auth-field-help" id="npm-help">12 digit, diawali 140310. Terbuka sampai angkatan 25. Satu NPM untuk satu akun dan satu tiket undian.</p>}
          <label htmlFor="auth-password">Kata sandi</label>
          <div className="auth-password"><input id="auth-password" name="password" type={visible ? 'text' : 'password'} autoComplete={register ? 'new-password' : 'current-password'} required minLength={register ? 10 : 1} maxLength={128} value={password} disabled={busy} onChange={e=>setPassword(e.target.value)} aria-describedby={register ? 'password-help' : undefined}/><button type="button" onClick={()=>setVisible(!visible)} aria-label={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>{visible ? 'Sembunyikan' : 'Tampilkan'}</button></div>
          {register && <><p className="auth-field-help" id="password-help">10–128 karakter. Gunakan kata sandi pilihanmu sendiri.</p><label htmlFor="auth-confirm">Ulangi kata sandi</label><input id="auth-confirm" name="passwordConfirm" type={visible ? 'text' : 'password'} autoComplete="new-password" required minLength={10} maxLength={128} value={confirm} disabled={busy} onChange={e=>setConfirm(e.target.value)}/><label className="check-label"><input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)}/>Saya menggunakan NPM milik sendiri.</label></>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button" disabled={busy}>{busy ? 'Memeriksa...' : register ? 'Buat akun' : 'Masuk'}<Icon name="arrow" size={18}/></button>
        </form>
        <p className="auth-bottom">{register ? 'Sudah terdaftar?' : 'Belum punya akun?'} <button type="button" disabled={busy} onClick={()=>switchMode(register ? 'login' : 'register')}>{register ? 'Masuk di sini' : 'Daftar di sini'}</button></p>
        <p className="auth-privacy">Identitas pengirim Harewos tetap anonim, termasuk untuk panitia.</p>
      </div>
    </main>
  </>;
}
