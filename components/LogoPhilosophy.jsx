'use client';
import {useState} from 'react';
import artwork from '@/public/assets/kasundaan/manifest.json';
import Icon from './Icon.jsx';
const assets=Object.fromEntries(artwork.assets.map(a=>[a.name,a]));
const panels=[
 {title:'Kujang',art:'logo-kujang',page:10,lead:'Melambangkan identitas, keteguhan, dan nilai budaya Sunda.',detail:'Kujang menjadi penanda budaya Sunda dalam logo. Bentuknya menghubungkan identitas Pasundan dengan perayaan Dies Natalis HIFI.'},
 {title:'Angka 68',art:'philosophy-number',page:52,lead:'Menandai Dies Natalis HIFI ke-68 serta perjalanan dan semangat yang diwariskan antargenerasi.',detail:'Angka 68 menjadi pusat identitas perayaan. Setiap angkatan adalah bagian dari perjalanan HIFI yang diteruskan oleh generasi berikutnya.'},
 {title:'Ornamen Batik',art:'philosophy-batik',page:53,lead:'Mencerminkan kekayaan budaya dan identitas Pasundan.',detail:'Ragam hias batik melengkapi angka dan kujang dalam satu komposisi. Unsur ini membawa identitas Pasundan ke dalam perayaan HIFI.'},
 {title:'Keseluruhan',art:'philosophy-whole',page:54,lead:'Menggambarkan semangat HIFI yang terus beresonansi antargenerasi dan tetap berakar pada budaya Pasundan.',detail:'Kujang, angka 68, dan ragam hias membentuk satu identitas. Ketiganya mempertemukan perjalanan HIFI dengan budaya Sunda yang menjadi tema perayaan.'},
 {title:'Warna',art:'logo-68',page:55,lead:'Empat warna membawa makna semangat, ilmu pengetahuan, dan kebersamaan.',detail:'Oranye melambangkan semangat, kreativitas, dan keberanian. Merah membawa energi perjuangan antargenerasi. Biru mewakili ilmu pengetahuan, ketenangan, dan perkembangan; toska melambangkan harmoni, kebersamaan, dan keseimbangan.'},
];
export default function LogoPhilosophy({openPoster}) {
 const [active,setActive]=useState(0);
 return <div className="philosophy" aria-label="Lima panel filosofi logo">
  <div className="philosophy-nav" role="tablist" aria-label="Unsur filosofi logo">{panels.map((panel,i)=><button role="tab" id={`philosophy-tab-${i}`} aria-selected={active===i} aria-controls={`philosophy-panel-${i}`} tabIndex={active===i?0:-1} key={panel.title} onClick={()=>setActive(i)} onKeyDown={e=>{let next;if(e.key==='ArrowRight')next=(i+1)%5;if(e.key==='ArrowLeft')next=(i+4)%5;if(e.key==='Home')next=0;if(e.key==='End')next=4;if(next!==undefined){e.preventDefault();setActive(next);document.getElementById(`philosophy-tab-${next}`)?.focus();}}}>{panel.title}</button>)}</div>
  {panels.map((panel,i)=>{const asset=assets[panel.art];return <article className={`philosophy-panel philosophy-${i}`} role="tabpanel" aria-labelledby={`philosophy-tab-${i}`} id={`philosophy-panel-${i}`} hidden={active!==i} key={panel.title}>
   <div className="philosophy-art"><div className="philosophy-art-shape"/><img src={asset.src} width={asset.width} height={asset.height} alt={`Unsur logo: ${panel.title}`} className="theme-emblem"/></div>
   <div className="philosophy-copy"><h3>{panel.title}</h3><p>{panel.lead}</p><p className="philosophy-detail">{panel.detail}</p><button className="text-link" onClick={()=>openPoster({name:['poster-kujang','poster-logo','poster-batik','poster-whole','poster-colors'][i],title:`Filosofi ${panel.title}`})}>Lihat sumber desain<Icon name="external" size={16}/></button><div className="philosophy-controls"><button className="icon-button" aria-label="Filosofi sebelumnya" onClick={()=>setActive((active+4)%5)}><Icon name="arrow" style={{transform:'rotate(180deg)'}}/></button><span>{String(i+1).padStart(2,'0')} / 05</span><button className="icon-button" aria-label="Filosofi berikutnya" onClick={()=>setActive((active+1)%5)}><Icon name="arrow"/></button></div></div>
  </article>})}
 </div>;
}
