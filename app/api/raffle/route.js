import {backend} from '@/lib/backend.js';
import {currentUser,requireUser,checkOrigin,readBody,json,failure} from '@/lib/http.js';
export async function GET() {
  try {return json(await backend('raffle.status',await currentUser()));} catch(error) {return failure(error);}
}
export async function POST(request) {
  try {checkOrigin(request);return json(await backend('raffle.join',await requireUser(),await readBody(request)),201);}
  catch(error) {return failure(error);}
}
