import './globals.css';
import './culture.css';
import './journey.css';
import './festival.css';
import './immersive.css';
import './timeline.css';
export const metadata = {
  title:'Dies Natalis HIFI ke-68 · Kasundaan',
  description:'Dies Natalis HIFI FMIPA UNPAD ke-68. Jadwal acara, Harewos, tiket undian, dan cenderamata Kasundaan.',
  icons:{icon:'/assets/kasundaan/favicon.png'},
};
export const viewport = {width:'device-width',initialScale:1,themeColor:'#0c575b'};
export default function RootLayout({children}) {return <html lang="id"><body>{children}</body></html>;}
