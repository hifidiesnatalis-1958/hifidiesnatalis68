import {backend,ApiError} from '@/lib/backend.js';
import {validNpm,publicName} from '@/lib/npm.js';
import {currentUser,requireUser,checkOrigin,readBody,json,failure} from '@/lib/http.js';
export async function GET() {
  try {
    const result=await backend('raffle.status',await currentUser());
    return json({...result,winners:result.winners.map(row=>({...row,name:publicName(row.name)}))});
  } catch(error) {return failure(error);}
}
export async function POST(request) {
  try {
    checkOrigin(request);const user=await requireUser();
    if(user.role!=='user' || !validNpm(user.nickname)) throw new ApiError('Undian hanya untuk akun NPM peserta yang memenuhi ketentuan.',403,'FORBIDDEN');
    return json(await backend('raffle.join',user,await readBody(request)),201);
  } catch(error) {return failure(error);}
}
