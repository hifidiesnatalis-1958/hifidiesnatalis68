import {backend} from '@/lib/backend.js';
import {requireUser,json,failure} from '@/lib/http.js';
export const runtime='nodejs';
export async function GET() {
  try {return json(await backend('menfess.presentation',await requireUser(true)));}
  catch(error) {return failure(error);}
}
