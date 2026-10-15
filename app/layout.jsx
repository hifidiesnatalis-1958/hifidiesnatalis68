import './globals.css';
import './culture.css';
import './journey.css';
import './festival.css';
import './immersive.css';
import './timeline.css';
export const metadata = {
  title:'Dies Natalis HIFI ke-68 · Kasundaan',
  description:'Perayaan Dies Natalis HIFI FMIPA UNPAD ke-68. Temukan jadwal acara, Harewos anonim warhim, undian, dan cenderamata Kasundaan. 24 Oktober 2026 di Bale Santika.',
  icons:{icon:'/assets/kasundaan/favicon.png'},
};
export const viewport = {width:'device-width',initialScale:1,themeColor:'#0c575b'};
export default function RootLayout({children}) {return <html lang="id"><body>{children}</body></html>;}
