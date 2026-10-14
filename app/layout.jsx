import './globals.css';
import './culture.css';
export const metadata = {
  title:'Dies Natalis HIFI ke-68 · Kasundaan',
  description:'Ngariung bersama HIFI FMIPA UNPAD. Rangkaian acara, Harewos, undian, dan cerita Dies Natalis ke-68, 24 Oktober 2026.',
  icons:{icon:'/assets/kasundaan/favicon.png'},
};
export const viewport = {width:'device-width',initialScale:1,themeColor:'#0c575b'};
export default function RootLayout({children}) {return <html lang="id"><body>{children}</body></html>;}
