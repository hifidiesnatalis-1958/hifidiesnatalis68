'use client';
import {useState} from 'react';
import artwork from '@/public/assets/kasundaan/manifest.json';
import Icon from './Icon.jsx';
const assets=Object.fromEntries(artwork.assets.map(a=>[a.name,a]));
const panels=[
 {title:'Kujang',art:'logo-kujang',page:10,lead:'Pusaka kebanggaan Pasundan yang melambangkan ketajaman nalar, keteguhan prinsip, serta keluhuran budi pekerti warga Fisika.',detail:'Bentuk kujang menempatkan jati diri Sunda di dalam lambang perayaan. Lengkungnya menyatu dengan angka, menghubungkan keteguhan nilai budaya dengan perjalanan HIFI.'},
 {title:'Angka 68',art:'philosophy-number',page:52,lead:'Menandai 68 tahun perjalanan HIFI FMIPA UNPAD; jejak dedikasi, keilmuan, dan ikatan kekeluargaan yang terus diwariskan lintas generasi.',detail:'Dua angka yang saling berdekatan menjadi pusat identitas. Perjalanan organisasi dibaca sebagai kesinambungan: setiap angkatan membawa semangat yang diteruskan kepada generasi berikutnya.'},
 {title:'Ornamen Batik',art:'philosophy-batik',page:53,lead:'Mencerminkan kekayaan budaya dan identitas Pasundan.',detail:'Ragam hias yang mengitari angka menjadi pengikat komposisi. Ornamen menegaskan bahwa perayaan dan perkembangan HIFI tetap tumbuh dari akar budaya Sunda.'},
 {title:'Keseluruhan',art:'philosophy-whole',page:54,lead:'Harmoni antara nalar ilmu alam semesta dan kearifan lokal Sunda; bergerak maju menembus zaman tanpa kehilangan akar jati diri.',detail:'Kujang, angka, dan ragam hias membentuk satu kesatuan. Dalam sumber desain, kesatuan ini menggambarkan semangat HIFI yang terus beresonansi antargenerasi dan tetap berakar pada budaya Pasundan.'},
 {title:'Warna',art:'logo-physics',page:55,lead:'Warna mengikat semangat, pengetahuan, dan kebersamaan dalam satu identitas.',detail:'Oranye membawa kreativitas dan keberanian; merah menghadirkan energi perjuangan. Biru mewakili ilmu pengetahuan dan perkembangan, sedangkan toska menyatukan harmoni, kebersamaan, dan keseimbangan.'},
];
export default function LogoPhilosophy({openPoster}) {
 const [active,setActive]=useState(0);
 return <div className="philosophy" aria-label="Lima panel filosofi logo">
  <div className="philosophy-nav" role="tablist" aria-label="Unsur filosofi logo">{panels.map((panel,i)=><button role="tab" id={`philosophy-tab-${i}`} aria-selected={active===i} aria-controls={`philosophy-panel-${i}`} tabIndex={active===i?0:-1} key={panel.title} onClick={()=>setActive(i)} onKeyDown={e=>{let next;if(e.key==='ArrowRight')next=(i+1)%5;if(e.key==='ArrowLeft')next=(i+4)%5;if(e.key==='Home')next=0;if(e.key==='End')next=4;if(next!==undefined){e.preventDefault();setActive(next);document.getElementById(`philosophy-tab-${next}`)?.focus();}}}>{panel.title}</button>)}</div>
  {panels.map((panel,i)=>{const asset=assets[panel.art];return <article className={`philosophy-panel philosophy-${i}`} role="tabpanel" aria-labelledby={`philosophy-tab-${i}`} id={`philosophy-panel-${i}`} hidden={active!==i} key={panel.title}>
   <div className="philosophy-art"><div className="philosophy-art-shape"/><img src={asset.src} width={asset.width} height={asset.height} alt={`Unsur logo: ${panel.title}`} className="theme-emblem"/><span>Filosofi logo · {i+1} / 5</span></div>
   <div className="philosophy-copy"><p className="small-label">Dies Natalis HIFI ke-68</p><h3>{panel.title}</h3><p>{panel.lead}</p><p className="philosophy-detail">{panel.detail}</p><button className="text-link" onClick={()=>openPoster({name:['poster-kujang','poster-logo','poster-batik','poster-whole','poster-colors'][i],title:`Filosofi ${panel.title}`})}>Lihat sumber desain<Icon name="external" size={16}/></button><div className="philosophy-controls"><button className="icon-button" aria-label="Filosofi sebelumnya" onClick={()=>setActive((active+4)%5)}><Icon name="arrow" style={{transform:'rotate(180deg)'}}/></button><span>{String(i+1).padStart(2,'0')} / 05</span><button className="icon-button" aria-label="Filosofi berikutnya" onClick={()=>setActive((active+1)%5)}><Icon name="arrow"/></button></div></div>
  </article>})}
 </div>;
}
