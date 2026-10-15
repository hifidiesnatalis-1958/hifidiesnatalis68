import artwork from '@/public/assets/kasundaan/manifest.json';
const assets=Object.fromEntries(artwork.assets.map(a=>[a.name,a]));
const motifs={rangkaian:'cloud-gold',tema:'ornament-strip',menfess:'flourish-red',undian:'diamond',cinderamata:'logo-68-illustrated','dress-code':'flower',pesan:'flourish-gold',lokasi:'cloud-red-wide'};
export default function MorphSection({id,className='',children,...props}) {
 const asset=assets[motifs[id]||'flower'];
 return <section id={id} className={`${className} morph-chapter`} {...props}>
   <svg className="chapter-surface" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true"><path d="M 70 0 C 350 0 680 0 930 0 C 1000 0 1000 360 1000 930 C 1000 1000 680 1000 70 1000 C 0 1000 0 650 0 70 C 0 20 20 0 70 0 Z"/></svg>
   <div className="chapter-ornament" aria-hidden="true"><img src={asset.src} width={asset.width} height={asset.height} alt="" loading="lazy" decoding="async"/></div>
   {children}
 </section>;
}
