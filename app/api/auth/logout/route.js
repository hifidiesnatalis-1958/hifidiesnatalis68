import {SESSION_COOKIE,cookieOptions} from '@/lib/session.js';
import {checkOrigin,json,failure} from '@/lib/http.js';
export async function POST(request) {
  try {
    checkOrigin(request); const response=json({ok:true}); const options=cookieOptions(0);
    response.cookies.set(SESSION_COOKIE,'',options);
    // Cookie Lax lama (sebelum Partitioned) disimpan terpisah oleh browser, jadi ikut dihapus.
    if(options.partitioned) response.headers.append('Set-Cookie',`${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
    return response;
  }
  catch(error) {return failure(error);}
}
