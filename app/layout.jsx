import './globals.css';
import './culture.css';
import './journey.css';
import './festival.css';
import './immersive.css';
export const metadata = {
  title:'Dies Natalis HIFI ke-68 · Kasundaan',
  description:'Patepung lawung keluarga besar HIFI FMIPA UNPAD. Rangkaian perayaan seni, dinding Harewos, undian baraya, dan cenderamata Kasundaan 24 Oktober 2026.',
  icons:{icon:'/assets/kasundaan/favicon.png'},
};
export const viewport = {width:'device-width',initialScale:1,themeColor:'#0c575b'};
export default function RootLayout({children}) {return <html lang="id"><body>{children}</body></html>;}
