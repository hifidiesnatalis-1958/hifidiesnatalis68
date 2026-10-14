import {SESSION_COOKIE,cookieOptions} from '@/lib/session.js';
import {checkOrigin,json,failure} from '@/lib/http.js';
export async function POST(request) {
  try { checkOrigin(request); const response=json({ok:true}); response.cookies.set(SESSION_COOKIE,'',cookieOptions(0)); return response; }
  catch(error) {return failure(error);}
}
