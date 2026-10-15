import {SESSION_COOKIE,signSession,cookieOptions,STUDENT_SESSION_AGE} from '@/lib/session.js';
import {checkOrigin,readBody,json,failure} from '@/lib/http.js';
import {authClientKey,registerAccount} from '@/lib/accounts.js';
export const runtime='nodejs';
export const maxDuration=90;
export async function POST(request) {
  try {
    checkOrigin(request);const input=await readBody(request);
    const user=await registerAccount(input,authClientKey(request));
    const response=json({user:{...user,admin:false}},201);
    response.cookies.set(SESSION_COOKIE,signSession(user),cookieOptions(STUDENT_SESSION_AGE));return response;
  } catch(error) {return failure(error);}
}
