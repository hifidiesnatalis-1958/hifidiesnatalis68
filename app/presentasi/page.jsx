import {currentUser} from '@/lib/http.js';
import {isAdmin} from '@/lib/session.js';
import Presentation from '@/components/Presentation.jsx';
export const metadata={title:'Presentasi Harewos · Dies Natalis HIFI 68',robots:{index:false,follow:false}};
export default async function PresentationPage() {
  const user=await currentUser();
  if(!user || !isAdmin(user)) return <main className="wrap error-page"><p>HIFI FMIPA UNPAD</p><h1>Presentasi khusus operator.</h1><p>{user ? 'Akun kamu belum terdaftar sebagai operator atau panitia.' : 'Masuk dengan nickname akun panitia terlebih dahulu.'}</p><a className="button" href={user ? '/' : '/masuk?next=%2Fpresentasi'}>{user ? 'Kembali ke beranda' : 'Masuk sebagai operator'}</a></main>;
  return <Presentation/>;
}
