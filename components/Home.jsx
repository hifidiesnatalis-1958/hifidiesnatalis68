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
      <input id="menfess-to" maxLength={60} value={to} onChange={e => setTo(e.target.value)} placeholder="Untuk baraya, angkatan tertentu, atau seluruh keluarga HIFI"/></label>}
    <label htmlFor={`${kind}-body`}>{isMenfess ? 'Tulis Harewos kamu' : 'Pesan dan kesan kamu'}</label>
    <textarea id={`${kind}-body`} required maxLength={800} value={body} onChange={e => setBody(e.target.value)} rows={5}
      placeholder={isMenfess ? 'Tuliskan bisikan hatimu dengan santun dan tulus…' : 'Catatan kenangan manis, harapan, atau doa terbaik untuk HIFI…'}/>
    <div className="form-meta">{isMenfess ? <span>Selalu anonim · nama tidak ditampilkan</span> :
      <label className="check-label"><input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)}/>Tampilkan sebagai anonim</label>}<span>{body.length}/800</span></div>
    <p className="form-help">{isMenfess ? 'Identitas akun tidak ditampilkan di Harewos, termasuk di panel panitia. Kata kasar disaring otomatis demi kenyamanan bersama; pesan tayang setelah disetujui.' : 'Pesan & kesan akan tayang setelah ditinjau panitia. Pilihan anonim akan menyembunyikan nama panggilan dari pengunjung umum.'}</p>
    <button className="button" type={user ? 'submit' : 'button'} onClick={user ? undefined : onLogin} disabled={busy}>
      {busy ? 'Menyimpan…' : user ? (isMenfess ? 'Kirim Harewos' : 'Kirim pesan') : 'Masuk untuk mengirim'}<Icon name="send" size={18}/>
    </button>
    {error && <p role="alert" className="form-error">{error}</p>}{notice && <p role="status" className="form-success">{notice}</p>}
  </form>;
}

const posters = [
  {name: 'poster-online', title: 'Lomba online', description: 'Ajang kreasi Dress to Impress, ngadongeng Sunda, dan poster digital.'},
  {name: 'poster-links', title: 'Tautan & petunjuk lomba', description: 'Pedoman petunjuk teknis dan tautan pengumpulan karya baraya.'},
  {name: 'poster-performance', title: 'Open performance', description: 'Panggung apresiasi seni dan kreativitas baraya HIFI lintas angkatan.'},
];
const colors = [
  {name: 'Oranye', className: 'orange', text: 'Daya cipta, keceriaan, dan keberanian bereksplorasi.'},
  {name: 'Merah', className: 'red', text: 'Gelora semangat juang, ketegasan sikap, dan energi perayaan.'},
  {name: 'Biru', className: 'blue', text: 'Kedalaman nalar ilmu fisika, kejernihan berpikir, dan keluasan wawasan.'},
  {name: 'Toska', className: 'teal', text: 'Keseimbangan rasa, ketenangan jiwa, dan kerukunan guyub persaudaraan.'},
];
const products = [
  {name: 'T-shirt', image: 'merch-shirt', caption: 'Jejak kebanggaan HIFI 68 yang nyaman dikenakan sehari-hari.'},
  {name: 'Totebag', image: 'merch-tote', caption: 'Tas kanvas serbaguna, kawan setia beraktivitas ke mana pun melangkah.'},
  {name: 'Keychain', image: 'merch-keychain', caption: 'Tanda mata mungil pengingat hangatnya momen Dies Natalis ke-68.'},
  {name: 'Sticker set', image: 'merch-stickers', caption: 'Sentuhan ragam hias Kasundaan untuk melengkapi laptop dan gawai kesayangan.'},
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
        {[['Rangkaian', '#rangkaian'], ['Tema', '#tema'], ['Harewos', '#menfess'], ['Undian', '#undian'], ['Cindra mata', '#cinderamata']].map(([label, href]) => <a key={href} href={href} onClick={() => setMenu(false)}>{label}</a>)}
        <div className="mobile-nav-more">{[['Dress code', '#dress-code'], ['Pesan & kesan', '#pesan'], ['Lokasi', '#lokasi']].map(([label, href]) => <a key={href} href={href} onClick={() => setMenu(false)}>{label}</a>)}</div>
      </div>
      <div className="account">{user ? <><span className="user-name" title={user.name || user.nickname}>{user.name || user.nickname}</span>{user.admin && <a href="/admin" className="admin-link">Panitia</a>}<button className="icon-button" aria-label="Keluar dari akun" onClick={logout}><Icon name="logout"/></button></> : <button className="login-button" onClick={login}>Masuk / Daftar<Icon name="arrow" size={16}/></button>}</div>
      <button className="menu-toggle icon-button" aria-label={menu ? 'Tutup menu' : 'Buka menu'} aria-expanded={menu} aria-controls="nav-links" onClick={() => setMenu(!menu)}><Icon name={menu ? 'close' : 'menu'}/></button>
    </nav></header>
    <FestivalJourney>
      <CultureHero theme={site.theme} date={site.date}/>
      <div className="event-strip journey-panel"><div className="wrap event-strip-inner"><div className="event-date"><Icon name="calendar" size={25}/><div><strong>{fmtDate(site.date, {day: 'numeric', month: 'long', year: 'numeric'})}</strong><span>{site.events.find(event => event.id === 'puncak')?.time || 'Acara utama'} · {site.location.mapQuery ? site.location.name : 'lokasi menyusul'}</span></div></div><span className="countdown-caption">Sampai bertemu dalam</span><Countdown date={site.date}/></div></div>

      <MorphSection id="rangkaian" className="section wrap events-section journey-scene">
        <div className="section-heading"><div><h2>Satu perayaan.<br/><em>Limpahan cerita.</em></h2><p>Dari panggung kreasi hingga hangatnya jumpa muka.<br/>Simak jadwal lengkapnya dan jadilah bagian dari setiap momen.</p></div><div className="filter" aria-label="Filter rangkaian acara">{[['all', 'Semua'], ['online', '17 Oktober'], ['main', '24 Oktober']].map(([key, label]) => <button key={key} aria-pressed={eventFilter === key} className={eventFilter === key ? 'selected' : ''} onClick={() => setEventFilter(key)}>{label}</button>)}</div></div>
        <div className="schedule-layout"><aside className="schedule-poster"><button className="poster-preview" onClick={() => setPoster(posters[0])} aria-label="Perbesar poster lomba online"><Art name="poster-online" alt="Poster lomba online Dies Natalis HIFI ke-68"/><span>Lihat poster<Icon name="external" size={15}/></span></button><p>Lomba online · 17 Oktober 2026</p></aside>
          <div className="timeline">{events.map(event => <article className="event-row" key={event.id}><div className="timeline-date"><strong>{fmtDate(event.date, {day: '2-digit'})}</strong><span>{fmtDate(event.date, {month: 'short'})}</span></div><div className="event-summary"><div className="event-meta"><span>{event.type}</span><span>{event.time}</span></div><h3>{event.title}</h3><p>{event.description}</p>{event.url ? <a className="event-link" href={event.url} target="_blank" rel="noopener noreferrer">{event.id === 'dress-to-impress' ? 'Gabung Discord' : 'Kirim karya'}<Icon name="external" size={16}/></a> : null}</div></article>)}
          <a className="text-link juknis" href={site.links.juknis} target="_blank" rel="noopener noreferrer">Petunjuk teknis lomba<Icon name="external" size={17}/></a></div>
        </div>
        <div className="poster-links"><span>Informasi dalam poster</span>{posters.map(p => <button key={p.name} onClick={() => setPoster(p)}>{p.title}<Icon name="external" size={15}/></button>)}</div>
      </MorphSection>

      <MorphSection id="tema" className="theme-section journey-scene journey-panel"><div className="wrap">
        <div className="theme-heading"><Art name="flower"/><p>Berakar kukuh di bumi Pasundan, bertumbuh bersama menembus zaman.</p></div>
        <div className="theme-introduction"><h2>{site.theme.title}<em>di setiap denyut rasa.</em></h2><p className="theme-description">{site.theme.description}</p></div>
        <LogoPhilosophy openPoster={setPoster}/>
        <details className="logo-details"><summary>Cerita di balik identitas visual<Icon name="arrow" size={17}/></summary><p>{site.theme.logoDescription}</p><p>Ragam hias batik Kasundaan mencerminkan keluhuran budi, keteduhan, serta kebanggaan identitas tanah Priangan.</p><button className="text-link" onClick={() => setPoster({name: 'poster-logo', title: 'Filosofi logo Dies Natalis HIFI ke-68'})}>Lihat poster filosofi<Icon name="external" size={16}/></button></details>
        <div className="brand-colors">{colors.map(c => <div key={c.name}><span className={`color-dot ${c.className}`}/><p><strong>{c.name}</strong><span>{c.text}</span></p></div>)}</div>
        <button className="text-link color-story-link" onClick={() => setPoster({name: 'poster-colors', title: 'Makna warna identitas HIFI 68'})}>Baca makna warna selengkapnya<Icon name="external" size={16}/></button>
      </div></MorphSection>

      <MorphSection id="menfess" className="menfess-section journey-scene journey-panel"><div className="wrap">
        <div className="section-heading"><div><h2>Harewos.<br/><em>Gemuruh rasa tanpa nama.</em></h2><p>Sampaikan apresiasi, sapaan hangat, atau cerita terpendam.<br/>Titipkan suaramu di dinding Harewos, sampai ke hati tanpa prasangka.</p></div><div className="anonymous-stamp"><Icon name="heart" size={23}/><span>Identitas terjaga rapi.<br/>Pesan tersampaikan tulus.</span></div></div>
        <div className="menfess-layout"><div className="compose-panel"><div className="letter-heading"><Art name="flower"/><h3>Dari baraya,<br/>untuk baraya.</h3></div><MessageForm kind="menfess" user={user} onLogin={login} onSuccess={() => loadMen()}/>{men.mine.length > 0 && <details className="my-submissions"><summary>Kiriman saya ({men.mine.length})</summary>{men.mine.map(p => <div key={p.id}><span>{p.status === 'pending' ? 'Menunggu persetujuan panitia' : 'Tidak ditampilkan'}</span><p>{p.body}</p></div>)}</details>}</div>
          <div className="wall">{menLoading && !men.posts.length ? <div className="loading-state" role="status"><span className="skeleton-line"/><span className="skeleton-line"/><p>Memuat warkat baraya…</p></div> : men.posts.length ? <><div className="notes">{men.posts.map((p, i) => <article className={`note note-${i % 3}`} key={p.id}>{p.to && <p className="note-to">Untuk {p.to}</p>}<p className="note-body">{p.body}</p><footer><span>{p.author}<small>{fmtDate(p.createdAt)}</small></span><button className={`like-button ${p.liked ? 'liked' : ''}`} aria-label={`Sukai Harewos untuk ${p.to || 'baraya'}`} aria-pressed={p.liked} onClick={() => like(p.id)}><Icon name="heart" size={18}/>{p.likes}</button></footer></article>)}</div>{men.more && <button className="button secondary" onClick={() => loadMen(men.page + 1)} disabled={menLoading}>{menLoading ? 'Memuat…' : 'Warkat berikutnya'}</button>}</> : <div className="wall-empty"><Art name="logo-68-illustrated"/><h3>Ada cerita yang<br/>belum sempat terucap?</h3><p>{menError ? 'Dinding Harewos belum dapat dimuat saat ini. Silakan coba kembali sebentar lagi.' : 'Belum ada warkat yang terbit. Jadilah yang pertama menitipkan bisikan hangatmu.'}</p>{menError && <button className="text-link" onClick={() => loadMen()}>Muat ulang<Icon name="arrow" size={16}/></button>}</div>}{menError && men.posts.length > 0 && <p role="alert">{menError}</p>}</div>
        </div>
      </div></MorphSection>

      <MorphSection id="undian" className="section wrap raffle-section journey-scene"><div className="raffle-copy"><Art name="flourish-red" className="section-flourish"/><h2>Raih berkah<br/><em>dan keberuntungan.</em></h2><p>Satu nomor keberuntungan untuk setiap baraya. Pendaftaran undian dibuka langsung oleh panitia.</p><div className="raffle-rules"><p><Icon name="check" size={18}/>Wajib masuk akun. Setiap baraya berhak atas satu tiket undian resmi.</p><p><Icon name="check" size={18}/>Pengundian transparan; daftar pemenang diumumkan langsung di halaman ini.</p></div>{raffle.winners.length > 0 && <div className="winners"><h3>Baraya yang beruntung</h3>{raffle.winners.map(w => <p key={w.id}><strong>{w.name}</strong><span>{w.number} · {w.prize}</span></p>)}</div>}</div>
        <div className="raffle-ticket"><div className="ticket-top"><Art name="logo-68"/><span>Dies Natalis HIFI<br/><strong>Undian Baraya ke-68</strong></span><Icon name="ticket" size={27}/></div><div className="ticket-middle"><span>{raffleTicket ? 'Tiket kamu' : 'Tiket undian'}</span><strong>{raffleTicket?.number || 'DN68–?????'}</strong><p>{raffleTicket ? 'Nomor tiket tersimpan aman. Pantau pengumuman pemenang di halaman ini.' : site.raffle.prize}</p></div><div className="ticket-bottom">{raffleTicket ? <p className="ticket-registered"><Icon name="check"/>Nomor tiketmu sudah terdaftar</p> : <><span className="status-pill">{raffleReady && raffle.open ? 'Pendaftaran dibuka' : 'Pendaftaran belum dibuka'}</span>{user ? <label className="check-label"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}/>Saya bersedia identitas yang disamarkan dan nomor tiket ditampilkan jika terpilih sebagai pemenang.</label> : <p className="form-help">Masuk dengan NPM dan password untuk mengambil tiket undian. Satu NPM mendapat satu tiket.</p>}<button className="button" onClick={join} disabled={raffleBusy || (Boolean(user) && (!raffleReady || !raffle.open || !consent))}>{raffleBusy ? 'Mendaftarkan…' : user ? 'Ambil tiket saya' : 'Masuk untuk ikut undian'}<Icon name="arrow" size={18}/></button></>}{raffleError && <p className="form-error" role="alert">{raffleError}</p>}<small>{raffleReady ? `${raffle.total} baraya telah mengambil tiket undian` : 'Waktu pembukaan pendaftaran akan diumumkan panitia'}</small></div><div className="ticket-serial" aria-hidden="true"><span>HIFI · 1958 / 2026</span><Art name="flower"/></div></div>
      </MorphSection>

      <MorphSection id="cinderamata" className="merch-section journey-scene journey-panel"><div className="wrap">
        <div className="section-heading"><div><h2>Momennya terpatri,<br/><em>kenangannya lestari.</em></h2><p>Cenderamata berbalut keelokan motif Kasundaan,<br/>persembahan keluarga besar HIFI untuk seluruh baraya.</p></div><button className="button secondary" onClick={() => setPoster({name: 'poster-merch', title: 'Katalog cindra mata HIFI 68'})}>Lihat katalog<Icon name="external" size={17}/></button></div>
        <div className="merch-feature"><div className="merch-feature-art"><Art name="merch-shirt" alt="T-shirt resmi Dies Natalis HIFI ke-68, tampak depan dan belakang"/><Art name="ornament-strip" className="merch-feature-ornament"/></div><div className="merch-feature-copy"><span className="status-pill">Cenderamata resmi HIFI 68</span><h3>Bawa pulang<br/>cerita Kasundaan.</h3><p>Pilih T-shirt, totebag, gantungan kunci, atau stiker dengan identitas perayaan kita. Lihat katalog untuk rincian produk dan pemesanan.</p><a className="button" href="https://bit.ly/CINDERAMATA_DIES68" target="_blank" rel="noopener noreferrer">Pesan cenderamata<Icon name="external" size={17}/></a></div></div>
        <div className="merch-gallery">{products.map(product => <button key={product.name} className="merch-product" onClick={() => setPoster({name: 'poster-merch', title: 'Katalog cindra mata HIFI 68'})}><div className="product-image"><Art name={product.image} alt={`Cindra mata ${product.name} bertema Kasundaan`}/></div><div className="product-caption"><h3>{product.name}</h3><Icon name="external" size={17}/></div><p>{product.caption}</p></button>)}</div>
        <div className="merch-footer"><span>Rincian produk dan harga lengkap tertera pada katalog resmi.</span><a className="text-link" href="https://bit.ly/CINDERAMATA_DIES68" target="_blank" rel="noopener noreferrer">Pesan cindra mata<Icon name="external" size={17}/></a></div>
      </div></MorphSection>

      <MorphSection id="dress-code" className="dress-section journey-scene journey-panel"><div className="wrap dress-layout"><div><Art name="logo-68-illustrated"/><h2>Hadir anggun<br/><em>dalam pesona budaya.</em></h2><p>Ketentuan Busana Dies Natalis HIFI ke-68</p></div><div className="dress-info"><span className="status-pill">{site.dressCode.items.length ? 'Ketentuan busana' : 'Informasi menyusul'}</span><h3>{site.dressCode.title}</h3><p>{site.dressCode.description}</p>{site.dressCode.items.length > 0 && <ul>{site.dressCode.items.map(item => <li key={item}>{item}</li>)}</ul>}<a className="text-link" href={`https://wa.me/${site.contact.phone}`} target="_blank" rel="noopener noreferrer">Tanya panitia<Icon name="external" size={17}/></a></div></div></MorphSection>

      <MorphSection id="pesan" className="section wrap feedback-section journey-scene"><div className="feedback-copy"><Art name="flourish-gold" className="section-flourish"/><h2>Jejak rasa<br/><em>yang abadi.</em></h2><p>Untaian kesan, doa tulus, dan harapan terbaik untuk masa depan HIFI. Tuliskan catatan kecilmu sebagai prasasti kebersamaan kita.</p>{messages.length > 0 && <div className="feedback-list">{messages.slice(0, 6).map(m => <blockquote key={m.id}><p>{m.body}</p><cite>{m.author}</cite></blockquote>)}</div>}</div><div className="feedback-form"><MessageForm kind="messages" user={user} onLogin={login} onSuccess={loadMessages}/></div></MorphSection>

      <MorphSection id="lokasi" className="location-section journey-scene journey-panel"><div className="wrap location-layout"><div className="location-copy"><Icon name="pin" size={28}/><h2>Patepung lawung<br/><em>di Bale Santika.</em></h2><h3>{site.location.name}</h3><p>{site.location.address}</p><a className="button secondary" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`} target="_blank" rel="noopener noreferrer">{site.location.mapQuery ? 'Buka rute di Maps' : 'Lihat peta kampus'}<Icon name="external" size={17}/></a><div className="contact"><span>Narahubung</span><a href={`https://wa.me/${site.contact.phone}`} target="_blank" rel="noopener noreferrer">{site.contact.name}<small>+{site.contact.phone}<Icon name="external" size={14}/></small></a></div></div><div className="map"><iframe title={site.location.mapQuery ? 'Peta lokasi Dies Natalis HIFI' : 'Peta kampus Unpad Jatinangor, lokasi acara masih menyusul'} src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/><p>{site.location.mapQuery ? site.location.name : 'Peta kampus Unpad Jatinangor · titik acara menyusul'}</p></div></div></MorphSection>
    <footer id="panutup" className="footer journey-scene"><Corners bottom/><div className="wrap footer-inner"><div><Art name="logo-physics"/><p>Sampai bertemu di perjumpaan,<br/><strong>baraya HIFI salawasna.</strong></p></div><div className="footer-links"><a href="#dress-code">Dress code</a><a href="#pesan">Pesan & kesan</a><a href="#lokasi">Lokasi acara</a><a href="#beranda">Kembali ke atas ↑</a></div><div><strong>Dies Natalis ke-68</strong><p>{site.organizer}<br/>{site.year} · {site.theme.title}</p></div></div><div className="wrap footer-bottom"><span>Himpunan Mahasiswa Fisika · Universitas Padjadjaran</span><span>Tradisi dijaga dengan khidmat. Persaudaraan dirayakan dengan hangat.</span></div></footer>
    </FestivalJourney>
    {toast && <div className="toast" role="status"><span>{toast}</span><button className="icon-button" aria-label="Tutup pemberitahuan" onClick={() => setToast('')}><Icon name="close"/></button></div>}
    {poster && <PosterDialog poster={poster} onClose={() => setPoster(null)}/>}
  </div>;
}
