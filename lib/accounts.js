import {createHmac} from 'node:crypto';
import {ApiError,backend,backendReady} from './backend.js';
import {hashPassword,verifyPassword,normalizeNickname,validNickname,PASSWORD_MIN} from './password.js';
export function authReady() {return backendReady() && process.env.SESSION_SECRET?.length>=32;}
function credentials(input,register=false) {
  if(!authReady()) throw new ApiError('Layanan akun belum diaktifkan panitia. Silakan coba kembali nanti.',503,'SETUP_REQUIRED');
  const nickname=normalizeNickname(input?.nickname),password=input?.password;
  if(!validNickname(nickname)) throw new ApiError('Nickname harus 2–40 karakter. Gunakan nama pilihan kamu.');
  if(typeof password!=='string' || password.length<(register ? PASSWORD_MIN : 1) || password.length>128)
    throw new ApiError(register ? 'Password harus 10–128 karakter.' : 'Nickname atau password salah.',register ? 400 : 401,register ? 'INVALID_REQUEST' : 'UNAUTHORIZED');
  if(register && input.passwordConfirm!==password) throw new ApiError('Konfirmasi password belum sama.');
  return {nickname,password};
}
export function authClientKey(request) {
  if(!authReady()) throw new ApiError('Layanan akun belum diaktifkan panitia. Silakan coba kembali nanti.',503,'SETUP_REQUIRED');
  // Vercel supplies this header; arbitrary forwarded headers are not trusted.
  const ip=process.env.VERCEL==='1' ? request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || 'unknown' : 'local';
  return createHmac('sha256',process.env.SESSION_SECRET).update('auth-client:'+ip).digest('hex');
}
async function accountBackend(action,data) {
  try {return await backend(action,null,data);}
  catch(error) {
    if(error.code==='INVALID_REQUEST' && error.message==='Aksi tidak dikenal.')
      throw new ApiError('Pendaftaran dan login sedang disiapkan panitia. Silakan coba kembali nanti.',503,'BACKEND_UPDATE_REQUIRED');
    throw error;
  }
}
export async function registerAccount(input,clientKey) {
  const {nickname,password}=credentials(input,true);
  await accountBackend('auth.checkRegister',{nickname,clientKey});
  const passwordHash=await hashPassword(password);
  return (await accountBackend('auth.register',{nickname,passwordHash,clientKey})).user;
}
export async function loginAccount(input,clientKey) {
  const {nickname,password}=credentials(input);
  const {account}=await accountBackend('auth.lookup',{nickname,clientKey});
  const verified=await verifyPassword(password,account?.passwordHash);
  if(!verified || !account) throw new ApiError('Nickname atau password salah.',401,'UNAUTHORIZED');
  return (await accountBackend('auth.login',{id:account.id,nickname,clientKey})).user;
}
