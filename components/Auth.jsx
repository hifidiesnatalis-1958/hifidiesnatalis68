'use client';
import {useEffect,useState} from 'react';
import {api} from './Home.jsx';
import Icon from './Icon.jsx';
export default function Auth() {
  const [mode,setMode]=useState('login'),[identity,setIdentity]=useState(''),[key,setKey]=useState('');
  const [visible,setVisible]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const [issued,setIssued]=useState(null),[saved,setSaved]=useState(false),[copied,setCopied]=useState(false),[consent,setConsent]=useState(false);
  const register=mode==='register',operator=mode==='operator';
  useEffect(()=>{const mode=new URLSearchParams(location.search).get('mode');if(mode==='daftar')setMode('register');if(mode==='panitia')setMode('operator');},[]);
  function switchMode(next){setMode(next);setError('');setIdentity('');setKey('');setVisible(false);setConsent(false);}
  function continueTo(user){
    const requested=new URLSearchParams(location.search).get('next');
    const path=requested && (/^\/(?:#[a-z0-9-]*)?$/.test(requested) || ['/admin','/presentasi'].includes(requested)) ? requested : user.role==='admin' ? '/admin' : '/';
    const target=new URL(path,location.origin);if(target.pathname==='/')target.searchParams.set('welcome','1');
    location.assign(target.pathname+target.search+target.hash);
  }
  async function submit(event){
    event.preventDefault();setError('');setBusy(true);
    try{
      const data=operator ? {operator:true,nickname:identity,password:key} : {npm:identity,...(register ? {} : {token:key})};
      const result=await api(register ? '/api/auth/register' : '/api/auth/login',{method:'POST',body:JSON.stringify(data)});
      if(register){setIssued({npm:identity,token:result.token,user:result.user});return;}
      const session=await api('/api/session');
      if(session.user?.id!==result.user?.id)throw new Error('Sesi belum tersimpan. Buka website langsung di tab baru dan izinkan cookie, lalu masuk kembali.');
      continueTo(result.user);
    }catch(err){setError(err.message);}finally{setBusy(false);}
  }
  async function copyToken(){try{await navigator.clipboard.writeText(issued.token);setCopied(true);}catch{setError('Token belum dapat disalin. Gunakan tombol Unduh token.');}}
  async function finishRegistration(){
    setBusy(true);setError('');
    try{const session=await api('/api/session');if(session.user?.id!==issued.user?.id)throw new Error('Sesi belum tersimpan. Simpan token, buka website di tab baru, lalu masuk dengan NPM dan token tersebut.');continueTo(issued.user);}
    catch(err){setError(err.message);}finally{setBusy(false);}
  }
  function downloadToken(){const blob=new Blob([`Dies Natalis HIFI 68\nNPM: ${issued.npm}\nToken: ${issued.token}\nSimpan secara pribadi.\n`],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`token-hifi68-${issued.npm}.txt`;a.click();URL.revokeObjectURL(url);}
  return <>
    <header className="auth-header wrap"><a href="/" className="brand"><img src="/assets/kasundaan/logo-68.webp" alt=""/><span>Dies Natalis <b>HIFI 68</b></span></a><a href="/" className="text-link">Kembali ke acara<Icon name="arrow" size={16}/></a></header>
    <main className="auth-page wrap">
      <div className="auth-story"><p className="small-label">HIFI FMIPA UNPAD · 2026</p><h2>Pintu sua<br/><em>keluarga HIFI.</em></h2><p>Cukup satu akun sederhana untuk menitipkan bisikan Harewos, berbagi doa, dan menjemput tiket undian baraya.</p><div className="auth-emblem"><img src="/assets/kasundaan/logo-68.webp" alt="Logo Dies Natalis HIFI ke-68"/></div><img className="auth-flourish" src="/assets/kasundaan/flourish-gold.webp" alt=""/><p className="auth-story-note">Dies Natalis 68 · Merawat Guyub Kasundaan</p></div>

      <div className="auth-panel">
        <div className="auth-switch" role="group" aria-label="Pilih masuk atau daftar">
          <button aria-pressed={mode==='login'} disabled={busy || Boolean(issued)} onClick={()=>switchMode('login')}>Masuk</button>
          <button aria-pressed={register} disabled={busy || Boolean(issued)} onClick={()=>switchMode('register')}>Daftar NPM</button>
          <button aria-pressed={operator} disabled={busy || Boolean(issued)} onClick={()=>switchMode('operator')}>Panitia</button>
        </div>
        <h1>{issued ? 'Simpan tokenmu.' : register ? 'Satu NPM, satu akun.' : operator ? 'Pintu masuk panitia.' : 'Wilujeng sumping kembali.'}</h1>
        <p className="auth-description">{issued ? 'Token ini hanya ditampilkan saat pendaftaran. Simpan untuk masuk kembali ke akun yang sama.' : register ? 'Terbuka untuk mahasiswa Fisika Unpad sampai angkatan 25. Satu NPM hanya mendapat satu akun dan satu tiket undian.' : operator ? 'Gunakan akun panitia yang sudah terdaftar.' : 'Masuk dengan NPM dan token yang kamu simpan saat mendaftar.'}</p>
        {issued ? <div className="token-receipt">
          <span>NPM {issued.npm}</span><code>{issued.token}</code>
          <div className="token-actions"><button className="button secondary" onClick={copyToken}>{copied ? 'Tersalin' : 'Salin token'}</button><button className="button secondary" onClick={downloadToken}>Unduh token</button></div>
          <label className="check-label"><input type="checkbox" checked={saved} onChange={e=>setSaved(e.target.checked)}/>Saya sudah menyimpan token di tempat pribadi.</label>
          <button className="button" disabled={!saved || busy} onClick={finishRegistration}>{busy ? 'Memeriksa sesi...' : 'Lanjut ke perayaan'}<Icon name="arrow" size={18}/></button>
          <p className="auth-field-help">Jangan bagikan token. Token membuka akun dan tiket undian yang terhubung dengan NPM kamu.</p>
          {error && <p className="form-error" role="alert">{error}</p>}
        </div> : <form className="auth-form" onSubmit={submit}>
          <label htmlFor="auth-identity">{operator ? 'Nickname' : 'NPM'}</label>
          <input id="auth-identity" name={operator ? 'nickname' : 'npm'} type="text" inputMode={operator ? 'text' : 'numeric'} autoComplete="username" autoCorrect="off" spellCheck={false} required minLength={operator ? 2 : 12} maxLength={operator ? 40 : 12} pattern={operator ? undefined : '140310(0[0-9]|1[0-9]|2[0-5])00[0-9]{2}'} value={identity} disabled={busy} onChange={e=>setIdentity(e.target.value)} placeholder={operator ? 'Nickname panitia' : '140310240054'} aria-describedby={operator ? undefined : 'npm-help'}/>
          {!operator && <p className="auth-field-help" id="npm-help">12 digit, diawali 140310. Angkatan maksimal 25; angkatan 26 belum dapat mendaftar.</p>}
          {!register && <><label htmlFor="auth-key">{operator ? 'Password' : 'Token'}</label><div className="auth-password"><input id="auth-key" name={operator ? 'password' : 'token'} type={visible ? 'text' : 'password'} autoComplete="current-password" required maxLength={128} value={key} disabled={busy} onChange={e=>setKey(e.target.value)} placeholder={operator ? undefined : 'HIFI68-...'} autoCapitalize="none" spellCheck={false}/><button type="button" onClick={()=>setVisible(!visible)} aria-label={visible ? 'Sembunyikan kunci masuk' : 'Tampilkan kunci masuk'}>{visible ? 'Sembunyikan' : 'Tampilkan'}</button></div></>}
          {register && <label className="check-label"><input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)}/>Saya menggunakan NPM milik sendiri dan akan menyimpan token akun.</label>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button" disabled={busy}>{busy ? 'Memeriksa...' : register ? 'Buat akun NPM' : 'Masuk'}<Icon name="arrow" size={18}/></button>
        </form>}
        {!issued && <p className="auth-bottom">{register ? 'Sudah terdaftar?' : 'Belum punya token?'} <button type="button" disabled={busy} onClick={()=>switchMode(register ? 'login' : 'register')}>{register ? 'Masuk di sini' : 'Daftar NPM'}</button></p>}
        {!issued && !operator && <p className="auth-field-help">Token hilang? Hubungi panitia untuk pemulihan akses akun yang sama.</p>}
        <p className="auth-privacy">Privasi terjamin: Dinding Harewos beroperasi sepenuhnya anonim tanpa pernah menampilkan nama panggilanmu.</p>
      </div>
    </main>
  </>;
}
