import {randomBytes} from 'node:crypto';
import {backend,ApiError} from '@/lib/backend.js';
import {requireUser,checkOrigin,readBody,json,failure} from '@/lib/http.js';
export async function GET() {
  try {return json(await backend('admin.overview',await requireUser(true)));} catch(error) {return failure(error);}
}
export async function POST(request) {
  try {
    checkOrigin(request);const user=await requireUser(true);const body=await readBody(request);
    const actions={moderate:'admin.moderate',content:'content.update',raffleOpen:'raffle.toggle',draw:'raffle.draw'};
    if (!actions[body.action]) throw new ApiError('Aksi tidak dikenal.');
    if (body.action==='draw') {const bytes=randomBytes(64);body.entropy=Array.from({length:16},(_,i)=>bytes.readUInt32BE(i*4));}
    return json(await backend(actions[body.action],user,body));
  } catch(error) {return failure(error);}
}
