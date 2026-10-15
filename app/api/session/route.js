import {currentUser,json} from '@/lib/http.js';
import {isAdmin} from '@/lib/session.js';
import {authReady} from '@/lib/accounts.js';
export async function GET() {
  const user = await currentUser();
  return json({user:user ? {...user,admin:isAdmin(user)} : null,
    loginReady:authReady(),authMode:'npm-token'});
}
