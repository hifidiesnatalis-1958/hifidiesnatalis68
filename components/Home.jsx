'use client';

import {useEffect, useRef, useState} from 'react';
import defaults from '@/content/site.json';
import artwork from '@/public/assets/kasundaan/manifest.json';
import Icon from './Icon.jsx';
import CultureHero from './CultureHero.jsx';
import JourneyAtmosphere from './JourneyAtmosphere.jsx';
import MorphSection from './MorphSection.jsx';
import FestivalJourney from './FestivalJourney.jsx';
import LogoPhilosophy from './LogoPhilosophy.jsx';

const assets = Object.fromEntries(artwork.assets.map(asset => [asset.name, asset]));
export async function api(url, options = {}) {
  const response = await fetch(url, {...options, headers: {'Content-Type': 'application/json', ...options.headers}});
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Permintaan belum berhasil.');
  return data;
}
const post = (url, data) => api(url, {method: 'POST', body: JSON.stringify(data)});
const fmtDate = (date, options = {day: 'numeric', month: 'long'}) => new Date(date).toLocaleDateString('id-ID', {timeZone: 'Asia/Jakarta', ...options});

function Art({name, alt = '', className = '', eager = false, ...props}) {
  const asset = assets[name];
  return <img src={asset.src} width={asset.width} height={asset.height} alt={alt}
    className={className} loading={eager ? 'eager' : 'lazy'} decoding="async" {...props}/>;
}
function Corners({bottom = false}) {
  return <div className="art-corners" aria-hidden="true">
    <Art name="corner-top-left" className="corner tl" eager/>
    <Art name="corner-top-right" className="corner tr" eager/>
    {bottom && <><Art name="corner-bottom-left" className="corner bl"/><Art name="corner-bottom-right" className="corner br"/></>}
  </div>;
}
function Countdown({date}) {
  const [parts, setParts] = useState(null);
  useEffect(() => {
    const update = () => {
      const seconds = Math.max(0, Math.floor((new Date(date).getTime() - Date.now()) / 1000));
      setParts([Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60]);
    };
    update(); const timer = setInterval(update, 1000); return () => clearInterval(timer);
  }, [date]);
  return <div className="countdown" aria-label="Hitung mundur menuju tanggal acara">
    {['Hari', 'Jam', 'Menit', 'Detik'].map((label, i) => <div key={label}><strong>{parts ? String(parts[i]).padStart(2, '0') : '—'}</strong><span>{label}</span></div>)}
  </div>;
}
function MessageForm({kind, user, onLogin, onSuccess}) {
  const [body, setBody] = useState(''), [to, setTo] = useState(''), [anonymous, setAnonymous] = useState(true);
  const [busy, setBusy] = useState(false), [notice, setNotice] = useState(''), [error, setError] = useState('');
  const isMenfess = kind === 'menfess';
  async function submit(event) {
    event.preventDefault(); if (!user) {onLogin(); return;}
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await post(isMenfess ? '/api/menfess' : '/api/messages', {body, to, anonymous});
      setNotice(result.message); setBody(''); setTo(''); onSuccess();
    } catch (err) {setError(err.message);} finally {setBusy(false);}
  }
  return <form className="message-form" onSubmit={submit}>
    {isMenfess && <label htmlFor="menfess-to">Untuk siapa? <span className="optional">(opsional)</span>
      <input id="menfess-to" maxLength={60} value={to} onChange={e => setTo(e.target.value)} placeholder="Untuk teman, angkatan tertentu, atau seluruh keluarga HIFI"/></label>}
    <label htmlFor={`${kind}-body`}>{isMenfess ? 'Tulis Harewos kamu' : 'Pesan dan kesan kamu'}</label>
    <textarea id={`${kind}-body`} required maxLength={800} value={body} onChange={e => setBody(e.target.value)} rows={5}
      placeholder={isMenfess ? 'Tulis sapaan, apresiasi, atau cerita dengan bahasa yang santun…' : 'Tulis kesan, harapan, atau pesan untuk keluarga HIFI…'}/>
    <div className="form-meta">{isMenfess ? <span>Selalu anonim · nama tidak ditampilkan</span> :
      <label className="check-label"><input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)}/>Tampilkan sebagai anonim</label>}<span>{body.length}/800</span></div>
    <p className="form-help">{isMenfess ? 'Identitas akun tidak ditampilkan di Harewos, termasuk di panel panitia. Kata kasar disaring otomatis demi kenyamanan bersama; pesan tayang setelah disetujui.' : 'Pesan & kesan akan tayang setelah ditinjau panitia. Pilihan anonim menyembunyikan nama kamu dari pengunjung umum.'}</p>
    <button className="button" type={user ? 'submit' : 'button'} onClick={user ? undefined : onLogin} disabled={busy}>
      {busy ? 'Menyimpan…' : user ? (isMenfess ? 'Kirim Harewos' : 'Kirim pesan') : 'Masuk untuk mengirim'}<Icon name="send" size={18}/>
    </button>
    {error && <p role="alert" className="form-error">{error}</p>}{notice && <p role="status" className="form-success">{notice}</p>}
  </form>;
}

const posters = [
  {name: 'poster-online', title: 'Lomba online', description: 'Lomba Dress to Impress, dongeng Sunda, dan poster digital.'},
  {name: 'poster-links', title: 'Tautan & petunjuk lomba', description: 'Petunjuk teknis dan tautan pengumpulan karya peserta.'},
  {name: 'poster-performance', title: 'Open performance', description: 'Panggung apresiasi seni dan kreativitas keluarga HIFI lintas angkatan.'},
];
const colors = [
  {name: 'Oranye', className: 'orange', text: 'Semangat, kreativitas, dan keberanian dalam perjalanan HIFI.'},
  {name: 'Merah', className: 'red', text: 'Energi, keberanian, dan semangat perjuangan antargenerasi.'},
  {name: 'Biru', className: 'blue', text: 'Ilmu pengetahuan, ketenangan, dan perkembangan keilmuan fisika.'},
  {name: 'Toska', className: 'teal', text: 'Harmoni, kebersamaan, dan keseimbangan yang menyatukan berbagai unsur.'},
];
const products = [
  {name: 'T-shirt', image: 'merch-shirt', caption: 'Identitas HIFI 68 untuk dikenakan sehari-hari.'},
  {name: 'Totebag', image: 'merch-tote', caption: 'Teman membawa perlengkapan kuliah dan kegiatan sehari-hari.'},
  {name: 'Keychain', image: 'merch-keychain', caption: 'Pengingat kecil perayaan Dies Natalis HIFI ke-68.'},
  {name: 'Sticker set', image: 'merch-stickers', caption: 'Ragam hias Kasundaan untuk laptop, gawai, dan barang favoritmu.'},
];
function PosterDialog({poster, onClose}) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const opener = document.activeElement, previousScroll = window.scrollY;
    dialog.showModal();
    const previous = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => {
      dialog.close(); document.body.style.overflow = previous;
      window.scrollTo({top: previousScroll, behavior: 'instant'});
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({preventScroll: true});
    };
  }, []);
  return <dialog ref={ref} className="poster-dialog" aria-labelledby="poster-title"
    onCancel={e => {e.preventDefault(); onClose();}} onClick={e => {if (e.target === e.currentTarget) onClose();}}>
    <div className="poster-toolbar"><h2 id="poster-title">{poster.title}</h2><button className="icon-button" aria-label="Tutup poster" onClick={onClose}><Icon name="close"/></button></div>
    <div className="poster-dialog-image"><Art name={poster.name} alt={poster.title} eager/></div>
    <div className="poster-dialog-footer"><span>Poster Dies Natalis HIFI ke-68</span><a className="text-link" href={assets[poster.name].src} download={`${poster.name}-hifi68.webp`}>Unduh poster<Icon name="arrow" size={16}/></a></div>
  </dialog>;
}

export default function Home() {
  const [site, setSite] = useState(defaults), [user, setUser] = useState(null);
  const [menu, setMenu] = useState(false), [toast, setToast] = useState(''), [eventFilter, setEventFilter] = useState('all');
  const [poster, setPoster] = useState(null);
  const [men, setMen] = useState({posts: [], mine: [], more: false, page: 1}), [menLoading, setMenLoading] = useState(true), [menError, setMenError] = useState('');
  const [messages, setMessages] = useState([]), [raffle, setRaffle] = useState({open: false, total: 0, ticket: null, winners: []});
  const [consent, setConsent] = useState(false), [raffleBusy, setRaffleBusy] = useState(false), [raffleError, setRaffleError] = useState(''), [raffleReady, setRaffleReady] = useState(false);
  async function loadMen(page = 1) {
    setMenLoading(true); setMenError('');
    try {const result = await api(`/api/menfess?page=${page}`); setMen(old => ({...result, posts: page === 1 ? result.posts : [...old.posts, ...result.posts]}));}
    catch (err) {setMenError(err.message);} finally {setMenLoading(false);}
  }
  async function loadRaffle() {try {setRaffle(await api('/api/raffle')); setRaffleReady(true);} catch {setRaffleReady(false);}}
  async function loadMessages() {try {setMessages((await api('/api/messages')).messages);} catch {setMessages([]);}}
  useEffect(() => {
    api('/api/session').then(data => setUser(data.user)).catch(() => {});
    api('/api/content').then(data => setSite(data.content)).catch(() => {});
    loadMen(); loadRaffle(); loadMessages();
    if (new URLSearchParams(window.location.search).has('welcome')) {
      setToast('Wilujeng sumping! Kamu sudah masuk.'); window.history.replaceState(null, '', window.location.pathname + window.location.hash);
    }
  }, []);
  useEffect(() => {
    if (!menu) return;
    const close = e => {if (e.key === 'Escape') setMenu(false);};
    document.addEventListener('keydown', close); return () => document.removeEventListener('keydown', close);
  }, [menu]);
  function login() {window.location.assign('/masuk?next=' + encodeURIComponent('/' + window.location.hash));}
  async function logout() {try {await post('/api/auth/logout', {}); setUser(null); setConsent(false); loadMen(); loadRaffle(); setToast('Kamu sudah keluar dari akun.');} catch (err) {setToast(err.message);}}
  async function like(id) {
    if (!user) {login(); return;}
    try {const result = await post('/api/menfess', {action: 'like', id}); setMen(old => ({...old, posts: old.posts.map(p => p.id === id ? {...p, ...result} : p)}));} catch (err) {setToast(err.message);}
  }
  async function join() {
    if (!user) {login(); return;}
    setRaffleBusy(true); setRaffleError('');
    try {const result = await post('/api/raffle', {consent}); setRaffle(old => ({...old, ticket: {number: result.number}})); await loadRaffle();}
    catch (err) {setRaffleError(err.message);} finally {setRaffleBusy(false);}
  }
  const raffleTicket = user ? raffle.ticket : null;
  const mapQuery = site.location.mapQuery || 'Universitas Padjadjaran Jatinangor';
  const events = site.events.filter(e => eventFilter === 'all' || e.date === (eventFilter === 'online' ? '2026-10-17' : '2026-10-24'));
  return <div className="festival-page">
    <JourneyAtmosphere/>
    <a className="skip-link" href="#main">Lewati navigasi</a>
    <div className="festival-ribbon"><span>HIFI FMIPA UNPAD</span><Art name="diamond" eager/><span>24 Oktober 2026</span><Art name="diamond" eager/><span>Kasundaan</span></div>
    <header className="header"><nav className="nav wrap" aria-label="Navigasi utama">
      <a href="#beranda" className="brand"><Art name="logo-68" eager/><span>Dies Natalis <b>HIFI ke-68</b></span></a>
      <div className={`nav-links ${menu ? 'is-open' : ''}`} id="nav-links">
        {[['Rangkaian', '#rangkaian'], ['Tema', '#tema'], ['Harewos', '#menfess'], ['Undian', '#undian'], ['Cenderamata', '#cinderamata']].map(([label, href]) => <a key={href} href={href} onClick={() => setMenu(false)}>{label}</a>)}
        <div className="mobile-nav-more">{[['Busana', '#dress-code'], ['Pesan & kesan', '#pesan'], ['Lokasi', '#lokasi']].map(([label, href]) => <a key={href} href={href} onClick={() => setMenu(false)}>{label}</a>)}</div>
      </div>
      <div className="account">{user ? <><span className="user-name" title={user.name || user.nickname}>{user.name || user.nickname}</span>{user.admin && <a href="/admin" className="admin-link">Panitia</a>}<button className="icon-button" aria-label="Keluar dari akun" onClick={logout}><Icon name="logout"/></button></> : <button className="login-button" onClick={login}>Masuk / Daftar<Icon name="arrow" size={16}/></button>}</div>
      <button className="menu-toggle icon-button" aria-label={menu ? 'Tutup menu' : 'Buka menu'} aria-expanded={menu} aria-controls="nav-links" onClick={() => setMenu(!menu)}><Icon name={menu ? 'close' : 'menu'}/></button>
    </nav></header>
    <FestivalJourney>
      <CultureHero theme={site.theme}/>
      <div className="event-strip journey-panel"><div className="wrap event-strip-inner"><div className="event-date"><Icon name="calendar" size={25}/><div><strong>{fmtDate(site.date, {day: 'numeric', month: 'long', year: 'numeric'})}</strong><span>{site.events.find(event => event.id === 'puncak')?.time || 'Acara utama'} · {site.location.mapQuery ? site.location.name : 'lokasi menyusul'}</span></div></div><Countdown date={site.date}/></div></div>

      <MorphSection id="rangkaian" className="section wrap events-section journey-scene">
        <div className="section-heading"><div><h2>Rangkaian acara<br/><em>Dies Natalis ke-68.</em></h2></div><div className="filter" aria-label="Filter rangkaian acara">{[['all', 'Semua'], ['online', '17 Oktober'], ['main', '24 Oktober']].map(([key, label]) => <button key={key} aria-pressed={eventFilter === key} className={eventFilter === key ? 'selected' : ''} onClick={() => setEventFilter(key)}>{label}</button>)}</div></div>
        <div className="schedule-layout schedule-ribbon">
          <div className="timeline" aria-label="Linimasa rangkaian acara">{events.map(event => <article className="event-row" key={event.id} data-event={event.id}>
            <time className="timeline-date" dateTime={event.date} aria-label={fmtDate(event.date, {day: 'numeric', month: 'long', year: 'numeric'})}><strong>{fmtDate(event.date, {day: '2-digit'})}</strong><span>{fmtDate(event.date, {month: 'short'})}</span></time>
            <div className="event-summary"><div className="event-meta"><span>{event.type}</span><span>{event.time}</span></div><h3>{event.title}</h3><p>{event.description}</p>{event.url ? <a className="event-link" href={event.url} target="_blank" rel="noopener noreferrer">{event.id === 'dress-to-impress' ? 'Gabung Discord' : 'Kirim karya'}<Icon name="external" size={16}/></a> : null}</div>
          </article>)}</div>
          <aside className="schedule-poster"><button className="poster-preview" onClick={() => setPoster(posters[0])} aria-label="Perbesar poster lomba online"><Art name="poster-online" alt="Poster lomba online Dies Natalis HIFI ke-68"/><span>Lihat poster<Icon name="external" size={15}/></span></button><div className="schedule-resources"><p>Lomba online · 17 Oktober 2026</p><a className="text-link juknis" href={site.links.juknis} target="_blank" rel="noopener noreferrer">Petunjuk teknis lomba<Icon name="external" size={17}/></a></div></aside>
        </div>
        <div className="poster-links">{posters.map(p => <button key={p.name} onClick={() => setPoster(p)}>{p.title}<Icon name="external" size={15}/></button>)}</div>
      </MorphSection>

      <MorphSection id="tema" className="theme-section journey-scene journey-panel"><div className="wrap">
        <div className="theme-introduction"><h2>{site.theme.title}</h2><p className="theme-description">{site.theme.description}</p></div>
        <LogoPhilosophy openPoster={setPoster}/>
        <details className="logo-details"><summary>Cerita di balik identitas visual<Icon name="arrow" size={17}/></summary><p>{site.theme.logoDescription}</p><button className="text-link" onClick={() => setPoster({name: 'poster-logo', title: 'Filosofi logo Dies Natalis HIFI ke-68'})}>Lihat poster filosofi<Icon name="external" size={16}/></button></details>
        <div className="brand-colors">{colors.map(c => <div key={c.name}><span className={`color-dot ${c.className}`}/><p><strong>{c.name}</strong><span>{c.text}</span></p></div>)}</div>
        <button className="text-link color-story-link" onClick={() => setPoster({name: 'poster-colors', title: 'Makna warna identitas HIFI 68'})}>Baca makna warna selengkapnya<Icon name="external" size={16}/></button>
      </div></MorphSection>

      <MorphSection id="menfess" className="menfess-section journey-scene journey-panel"><div className="wrap">
        <div className="section-heading"><div><h2>Harewos.<br/><em>Cerita tanpa nama.</em></h2></div></div>
        <div className="menfess-layout"><div className="compose-panel"><MessageForm kind="menfess" user={user} onLogin={login} onSuccess={() => loadMen()}/>{men.mine.length > 0 && <details className="my-submissions"><summary>Kiriman saya ({men.mine.length})</summary>{men.mine.map(p => <div key={p.id}><span>{p.status === 'pending' ? 'Menunggu persetujuan panitia' : 'Tidak ditampilkan'}</span><p>{p.body}</p></div>)}</details>}</div>
          <div className="wall">{menLoading && !men.posts.length ? <div className="loading-state" role="status"><span className="skeleton-line"/><span className="skeleton-line"/><p>Memuat pesan Harewos…</p></div> : men.posts.length ? <><div className="notes">{men.posts.map((p, i) => <article className={`note note-${i % 3}`} key={p.id}>{p.to && <p className="note-to">Untuk {p.to}</p>}<p className="note-body">{p.body}</p><footer><span>Pengirim anonim<small>{fmtDate(p.createdAt)}</small></span><button className={`like-button ${p.liked ? 'liked' : ''}`} aria-label={`Sukai Harewos untuk ${p.to || 'keluarga HIFI'}`} aria-pressed={p.liked} onClick={() => like(p.id)}><Icon name="heart" size={18}/>{p.likes}</button></footer></article>)}</div>{men.more && <button className="button secondary" onClick={() => loadMen(men.page + 1)} disabled={menLoading}>{menLoading ? 'Memuat…' : 'Pesan berikutnya'}</button>}</> : <div className="wall-empty"><Art name="logo-68-illustrated"/><h3>Ada cerita yang<br/>belum sempat terucap?</h3><p>{menError ? 'Dinding Harewos belum dapat dimuat saat ini. Silakan coba kembali sebentar lagi.' : 'Belum ada Harewos yang ditampilkan. Kamu bisa mengirim sapaan pertama untuk keluarga HIFI.'}</p>{menError && <button className="text-link" onClick={() => loadMen()}>Muat ulang<Icon name="arrow" size={16}/></button>}</div>}{menError && men.posts.length > 0 && <p role="alert">{menError}</p>}</div>
        </div>
      </div></MorphSection>

      <MorphSection id="undian" className="section wrap raffle-section journey-scene"><div className="raffle-copy"><Art name="flourish-red" className="section-flourish"/><h2>Siapa yang<br/><em>mendapat hadiah?</em></h2><p>Satu tiket undian untuk satu NPM. Pendaftaran dibuka oleh panitia.</p>{raffle.winners.length > 0 && <div className="winners"><h3>Pemenang undian</h3>{raffle.winners.map(w => <p key={w.id}><strong>{w.name}</strong><span>{w.number} · {w.prize}</span></p>)}</div>}</div>
        <div className="raffle-ticket"><div className="ticket-top"><Art name="logo-68"/><span>Dies Natalis HIFI<br/><strong>Undian Dies Natalis ke-68</strong></span><Icon name="ticket" size={27}/></div><div className="ticket-middle"><span>{raffleTicket ? 'Tiket kamu' : 'Tiket undian'}</span><strong>{raffleTicket?.number || 'DN68–?????'}</strong><p>{raffleTicket ? 'Nomor tiket tersimpan aman. Pantau pengumuman pemenang di halaman ini.' : site.raffle.prize}</p></div><div className="ticket-bottom">{raffleTicket ? <p className="ticket-registered"><Icon name="check"/>Nomor tiketmu sudah terdaftar</p> : <><span className="status-pill">{raffleReady && raffle.open ? 'Pendaftaran dibuka' : 'Pendaftaran belum dibuka'}</span>{user ? <label className="check-label"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}/>Saya bersedia identitas yang disamarkan dan nomor tiket ditampilkan jika terpilih sebagai pemenang.</label> : <p className="form-help">Masuk dengan NPM dan kata sandi untuk mengambil tiket undian. Satu NPM mendapat satu tiket.</p>}<button className="button" onClick={join} disabled={raffleBusy || (Boolean(user) && (!raffleReady || !raffle.open || !consent))}>{raffleBusy ? 'Mendaftarkan…' : user ? 'Ambil tiket saya' : 'Masuk untuk ikut undian'}<Icon name="arrow" size={18}/></button></>}{raffleError && <p className="form-error" role="alert">{raffleError}</p>}<small>{raffleReady ? `${raffle.total} peserta telah mengambil tiket undian` : 'Waktu pembukaan pendaftaran akan diumumkan panitia'}</small></div><div className="ticket-serial" aria-hidden="true"><span>HIFI · 1958 / 2026</span><Art name="flower"/></div></div>
      </MorphSection>

      <MorphSection id="cinderamata" className="merch-section journey-scene journey-panel"><div className="wrap">
        <div className="section-heading"><div><h2>Cenderamata<br/><em>untuk keluarga HIFI.</em></h2></div><button className="button secondary" onClick={() => setPoster({name: 'poster-merch', title: 'Katalog cenderamata HIFI 68'})}>Lihat katalog<Icon name="external" size={17}/></button></div>
        <div className="merch-feature"><div className="merch-feature-art"><Art name="merch-shirt" alt="T-shirt resmi Dies Natalis HIFI ke-68, tampak depan dan belakang"/><Art name="ornament-strip" className="merch-feature-ornament"/></div><div className="merch-feature-copy"><h3>T-shirt HIFI 68</h3><p>T-shirt, totebag, gantungan kunci, dan stiker Dies Natalis HIFI ke-68.</p><a className="button" href="https://bit.ly/CINDERAMATA_DIES68" target="_blank" rel="noopener noreferrer">Pesan cenderamata<Icon name="external" size={17}/></a></div></div>
        <div className="merch-gallery">{products.map(product => <button key={product.name} className="merch-product" onClick={() => setPoster({name: 'poster-merch', title: 'Katalog cenderamata HIFI 68'})}><div className="product-image"><Art name={product.image} alt={`Cenderamata ${product.name} bertema Kasundaan`}/></div><div className="product-caption"><h3>{product.name}</h3><Icon name="external" size={17}/></div><p>{product.caption}</p></button>)}</div>
        <div className="merch-footer"><a className="text-link" href="https://bit.ly/CINDERAMATA_DIES68" target="_blank" rel="noopener noreferrer">Pesan cenderamata<Icon name="external" size={17}/></a></div>
      </div></MorphSection>

      <MorphSection id="dress-code" className="dress-section journey-scene journey-panel"><div className="wrap dress-layout"><div><Art name="logo-68-illustrated"/><h2>Rayakan dengan<br/><em>busana Sunda.</em></h2></div><div className="dress-info">{!site.dressCode.items.length && <span className="status-pill">Informasi menyusul</span>}<h3>{site.dressCode.title}</h3><p>{site.dressCode.description}</p>{site.dressCode.items.length > 0 && <ul>{site.dressCode.items.map(item => <li key={item}>{item}</li>)}</ul>}<a className="text-link" href={`https://wa.me/${site.contact.phone}`} target="_blank" rel="noopener noreferrer">Tanya panitia<Icon name="external" size={17}/></a></div></div></MorphSection>

      <MorphSection id="pesan" className="section wrap feedback-section journey-scene"><div className="feedback-copy"><Art name="flourish-gold" className="section-flourish"/><h2>Kesan dan harapan<br/><em>untuk HIFI.</em></h2><p>Apa yang paling kamu ingat dari perayaan ini? Bagikan kesan dan harapanmu untuk keluarga besar HIFI.</p>{messages.length > 0 && <div className="feedback-list">{messages.slice(0, 6).map(m => <blockquote key={m.id}><p>{m.body}</p><cite>{m.author==='Baraya anonim' ? 'Pengirim anonim' : m.author}</cite></blockquote>)}</div>}</div><div className="feedback-form"><MessageForm kind="messages" user={user} onLogin={login} onSuccess={loadMessages}/></div></MorphSection>

      <MorphSection id="lokasi" className="location-section journey-scene journey-panel"><div className="wrap location-layout"><div className="location-copy"><Icon name="pin" size={28}/><h2>Sampai bertemu<br/><em>di Bale Santika.</em></h2><h3>{site.location.name}</h3><p>{site.location.address}</p><a className="button secondary" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`} target="_blank" rel="noopener noreferrer">{site.location.mapQuery ? 'Buka rute di Maps' : 'Lihat peta kampus'}<Icon name="external" size={17}/></a><div className="contact"><span>Narahubung</span><a href={`https://wa.me/${site.contact.phone}`} target="_blank" rel="noopener noreferrer">{site.contact.name}<small>+{site.contact.phone}<Icon name="external" size={14}/></small></a></div></div><div className="map"><iframe title={site.location.mapQuery ? 'Peta lokasi Dies Natalis HIFI' : 'Peta kampus Unpad Jatinangor, lokasi acara masih menyusul'} src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/><p>{site.location.mapQuery ? site.location.name : 'Peta kampus Unpad Jatinangor · titik acara menyusul'}</p></div></div></MorphSection>
    <footer id="panutup" className="footer journey-scene"><Corners bottom/><div className="wrap footer-inner"><div><Art name="logo-68"/><p>Hatur nuhun.<br/><strong>Sampai bertemu kembali.</strong></p></div><div className="footer-links"><a href="#dress-code">Busana</a><a href="#pesan">Pesan & kesan</a><a href="#lokasi">Lokasi acara</a><a href="#beranda">Kembali ke atas ↑</a></div><div><strong>Dies Natalis ke-68</strong><p>{site.organizer}<br/>{site.year} · {site.theme.title}</p></div></div><div className="wrap footer-bottom"><span>Himpunan Mahasiswa Fisika · Universitas Padjadjaran</span></div></footer>
    </FestivalJourney>
    {toast && <div className="toast" role="status"><span>{toast}</span><button className="icon-button" aria-label="Tutup pemberitahuan" onClick={() => setToast('')}><Icon name="close"/></button></div>}
    {poster && <PosterDialog poster={poster} onClose={() => setPoster(null)}/>}
  </div>;
}
