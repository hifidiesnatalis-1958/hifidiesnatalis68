'use client';
import {useState} from 'react';
import artwork from '@/public/assets/kasundaan/manifest.json';
import Icon from './Icon.jsx';
const assets=Object.fromEntries(artwork.assets.map(a=>[a.name,a]));
const panels=[
 {title:'Kujang',art:'logo-kujang',page:10,lead:'Kujang melambangkan pusaka Pasundan yang menyimpan kekuatan dan keteguhan.',detail:'Pusaka ini menegaskan akar budaya Sunda dalam perayaan 68 tahun HIFI.'},
 {title:'Angka 68',art:'philosophy-number',page:52,lead:'Angka ini menandai 68 tahun perjalanan HIFI FMIPA UNPAD sejak tahun 1958.',detail:'Bentuknya merangkum kebersamaan serta kesinambungan antargenerasi warga himpunan.'},
 {title:'Ornamen Batik',art:'philosophy-batik',page:53,lead:'Ornamen batik mengangkat ragam hias khas Priangan yang anggun.',detail:'Sentuhan motif ini mempertegas identitas visual bertema Kasundaan.'},
 {title:'Keseluruhan',art:'philosophy-whole',page:54,lead:'Logo ini memadukan tradisi Pasundan dengan semangat keilmuan HIFI.',detail:'Kujang, angka 68, dan motif batik berpadu membentuk satu kesatuan visual yang utuh.'},
 {title:'Warna',art:'logo-68',page:55,lead:'Empat warna utama membawa makna identitas perayaan tahun ini.',detail:'Warna oranye dan merah melambangkan daya juang, sedangkan biru dan toska melambangkan keilmuan fisika serta kebersamaan.'},
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
