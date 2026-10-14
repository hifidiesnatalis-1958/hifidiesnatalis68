import {currentUser} from '@/lib/http.js';
import {isAdmin} from '@/lib/session.js';
import Admin from '@/components/Admin.jsx';
export const metadata={title:'Panel Panitia · HIFI Dies Natalis 68'};
export default async function AdminPage() {
  const user=await currentUser();
  if(!user || !isAdmin(user)) return <main className="wrap error-page"><p>HIFI FMIPA UNPAD</p><h1>Panel khusus panitia.</h1><p>{user ? 'Akun kamu belum terdaftar sebagai panitia.' : 'Masuk dengan nickname akun panitia terlebih dahulu.'}</p><a href={user ? '/' : '/masuk?next=%2Fadmin'} className="button">{user ? 'Kembali ke beranda' : 'Masuk sebagai panitia'}</a></main>;
  return <Admin user={user}/>;
}
