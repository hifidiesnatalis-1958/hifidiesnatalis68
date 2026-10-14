import {NextResponse} from 'next/server';
import {SESSION_COOKIE,signSession,cookieOptions,appOrigin,isAdmin} from '@/lib/session.js';
import {checkOrigin,readBody,json,failure} from '@/lib/http.js';
import {authClientKey,loginAccount} from '@/lib/accounts.js';
export const runtime='nodejs';
export const maxDuration=90;
export function GET() {return NextResponse.redirect(`${appOrigin()}/masuk`);}
export async function POST(request) {
  try {
    checkOrigin(request);const input=await readBody(request);
    const user=await loginAccount(input,authClientKey(request));
    const response=json({user:{...user,admin:isAdmin(user)}});
    response.cookies.set(SESSION_COOKIE,signSession(user),cookieOptions());return response;
  } catch(error) {return failure(error);}
}
