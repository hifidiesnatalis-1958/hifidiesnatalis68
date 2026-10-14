import {backend} from '@/lib/backend.js';
import {currentUser,requireUser,checkOrigin,readBody,json,failure} from '@/lib/http.js';
export async function GET(request) {
  try {return json(await backend('menfess.list',await currentUser(),{page:Number(new URL(request.url).searchParams.get('page') || 1)}));}
  catch(error) {return failure(error);}
}
export async function POST(request) {
  try {checkOrigin(request);const user=await requireUser();const body=await readBody(request);
    const action=body.action==='like' ? 'menfess.like' : 'menfess.submit';
    return json(await backend(action,user,body),action==='menfess.submit' ? 201 : 200);
  } catch(error) {return failure(error);}
}
