import {createHmac, randomBytes} from 'node:crypto';
export class ApiError extends Error {
  constructor(message,status=400,code='INVALID_REQUEST') { super(message); this.status=status; this.code=code; }
}
export function backendReady() {
  return Boolean(process.env.APPS_SCRIPT_URL && process.env.APPS_SCRIPT_SECRET?.length >= 32);
}
export function signedEnvelope(action,actor,data={},now=Date.now()) {
  const secret = process.env.APPS_SCRIPT_SECRET;
  if (!secret || secret.length < 32) throw new ApiError('Layanan belum diaktifkan panitia. Silakan coba kembali nanti.',503,'SETUP_REQUIRED');
  const timestamp = now;
  const nonce = randomBytes(16).toString('hex');
  const payload = Buffer.from(JSON.stringify({action,actor,data})).toString('base64url');
  const signature = createHmac('sha256',secret).update(`${timestamp}.${nonce}.${payload}`).digest('hex');
  return {timestamp,nonce,payload,signature};
}
async function googleRequest(url,options,signal) {
  for (let attempt=0;attempt<2;attempt++) {
    try {return await fetch(url,{...options,cache:'no-store',redirect:'manual',signal});}
    catch(error) {
      // With manual redirects, this error means no HTTP request was sent.
      // A response/socket timeout may follow a successful write: never replay it.
      if(attempt || signal.aborted || error.cause?.code!=='UND_ERR_CONNECT_TIMEOUT') throw error;
    }
  }
}
export async function backend(action,actor=null,data={}) {
  if (!backendReady()) throw new ApiError('Layanan belum diaktifkan panitia. Silakan coba kembali nanti.',503,'SETUP_REQUIRED');
  const endpoint = new URL(process.env.APPS_SCRIPT_URL);
  if (endpoint.protocol !== 'https:' || endpoint.hostname !== 'script.google.com' || !/^\/macros\/s\/[^/]+\/exec$/.test(endpoint.pathname))
    throw new ApiError('Layanan sedang diperbarui panitia.',503,'SETUP_REQUIRED');
  const signal=AbortSignal.timeout(30000);
  let response;
  try {
    response = await googleRequest(endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify(signedEnvelope(action,actor,data))},signal);
    // ContentService returns a one-time GET URL after running the signed POST.
    // Retry its connection separately so a saved message/draw is never submitted twice.
    if([301,302,303].includes(response.status)) {
      const location=response.headers.get('location');
      const target=location ? new URL(location,endpoint) : null;
      if(!target || target.protocol!=='https:' || target.hostname!=='script.googleusercontent.com' || target.username || target.password)
        throw new ApiError('Layanan sedang diperbarui panitia.',503,'SETUP_REQUIRED');
      await response.body?.cancel();
      response=await googleRequest(target,{method:'GET'},signal);
    }
    if (!response.ok) throw new Error('Backend unavailable');
    const result = await response.json();
    if (!result.ok) {
      const statuses = {UNAUTHORIZED:401,FORBIDDEN:403,NOT_FOUND:404,CONFLICT:409,RATE_LIMIT:429,SETUP_REQUIRED:503,INTERNAL_ERROR:500};
      throw new ApiError(result.error?.message || 'Permintaan belum berhasil.',statuses[result.error?.code] || 400,result.error?.code);
    }
    return result.data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    const timeout=err.name==='TimeoutError' || err.cause?.code==='UND_ERR_CONNECT_TIMEOUT';
    throw new ApiError(timeout ? 'Koneksi ke Google sedang lambat. Tunggu sebentar, lalu coba lagi.' : 'Layanan belum dapat dijangkau. Silakan coba kembali.',502,'BACKEND_UNAVAILABLE');
  }
}
