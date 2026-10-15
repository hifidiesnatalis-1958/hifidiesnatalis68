import {createHmac} from 'node:crypto';
import {validNpm} from './npm.js';
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
function npmCredentials(input,tokenRequired=false) {
  if(!authReady()) throw new ApiError('Layanan akun belum diaktifkan panitia.',503,'SETUP_REQUIRED');
  const npm=typeof input?.npm==='string' ? input.npm.trim() : '';
  if(!validNpm(npm)) throw new ApiError('NPM harus 12 digit: 140310 + dua digit angkatan (maksimal 25) + 00 + dua digit nomor. Contoh: 140310240054.');
  const token=typeof input?.token==='string' ? input.token.trim() : '';
  if(tokenRequired && !/^HIFI68-[A-Za-z0-9_-]{32}$/.test(token)) throw new ApiError('NPM atau token tidak sesuai.',401,'UNAUTHORIZED');
  return {npm,token};
}
export async function registerAccount(input,clientKey) {
  const {npm}=npmCredentials(input);
  const token=studentToken(npm);
  try {
    await accountBackend('auth.checkRegister',{nickname:npm,clientKey});
    const passwordHash=await hashPassword(token);
    const {user}=await accountBackend('auth.register',{nickname:npm,passwordHash,clientKey});
    return {user:{...user,npm},token};
  } catch(error) {
    if(error.code==='CONFLICT') throw new ApiError('NPM ini sudah terdaftar. Masuk dengan token yang sudah kamu simpan.',409,'CONFLICT');
    throw error;
  }
}
export async function loginAccount(input,clientKey) {
  if(input?.operator===true) {
    const {nickname,password}=credentials(input);
    const {account}=await accountBackend('auth.lookup',{nickname,clientKey});
    if(!await verifyPassword(password,account?.passwordHash) || !account) throw new ApiError('Nickname atau password salah.',401,'UNAUTHORIZED');
    const {user}=await accountBackend('auth.login',{id:account.id,nickname,clientKey});
    if(user.role!=='admin') throw new ApiError('Jalur ini khusus panitia.',403,'FORBIDDEN');
    return user;
  }
  const {npm,token}=npmCredentials(input,true);
  const {account}=await accountBackend('auth.lookup',{nickname:npm,clientKey});
  if(!await verifyPassword(token,account?.passwordHash) || !account) throw new ApiError('NPM atau token tidak sesuai.',401,'UNAUTHORIZED');
  const {user}=await accountBackend('auth.login',{id:account.id,nickname:npm,clientKey});
  if(user.role!=='user') throw new ApiError('Akun tidak sesuai.',403,'FORBIDDEN');
  return {...user,npm};
}

function studentToken(npm) {
  return 'HIFI68-'+createHmac('sha256',process.env.APPS_SCRIPT_SECRET).update('student-token:v1:'+npm).digest('base64url').slice(0,32);
}
export async function recoverStudentToken(input,clientKey) {
  const {npm}=npmCredentials(input);
  const {account}=await accountBackend('auth.lookup',{nickname:npm,clientKey});
  const token=studentToken(npm);
  if(!account || !await verifyPassword(token,account.passwordHash)) throw new ApiError('Akun NPM/token tidak ditemukan.',404,'NOT_FOUND');
  return {npm,token};
}
