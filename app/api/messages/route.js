import {backend} from '@/lib/backend.js';
import {publicName} from '@/lib/npm.js';
import {currentUser,requireUser,checkOrigin,readBody,json,failure} from '@/lib/http.js';
export async function GET() {
  try {
    const result=await backend('messages.list',await currentUser());
    return json({...result,messages:result.messages.map(row=>({...row,author:publicName(row.author)}))});
  } catch(error) {return failure(error);}
}
export async function POST(request) {
  try {checkOrigin(request);return json(await backend('messages.submit',await requireUser(),await readBody(request)),201);}
  catch(error) {return failure(error);}
}
