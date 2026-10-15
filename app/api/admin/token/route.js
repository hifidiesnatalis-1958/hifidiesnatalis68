import {recoverStudentToken,authClientKey} from '@/lib/accounts.js';
import {requireUser,checkOrigin,readBody,json,failure} from '@/lib/http.js';
export const runtime='nodejs';
export const maxDuration=60;
export async function POST(request) {
 try {checkOrigin(request);await requireUser(true);return json(await recoverStudentToken(await readBody(request),authClientKey(request)));}
 catch(error){return failure(error);}
}
