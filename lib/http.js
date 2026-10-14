import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {SESSION_COOKIE, readSession, isAdmin, appOrigin} from './session.js';
import {ApiError} from './backend.js';
export async function currentUser() {
  return readSession((await cookies()).get(SESSION_COOKIE)?.value);
}
export async function requireUser(admin=false) {
  const user = await currentUser();
  if (!user) throw new ApiError('Masuk dengan nickname dan password terlebih dahulu.',401,'UNAUTHORIZED');
  if (admin && !isAdmin(user)) throw new ApiError('Halaman ini khusus panitia.',403,'FORBIDDEN');
  return user;
}
export function checkOrigin(request) {
  if (request.headers.get('origin') !== appOrigin()) throw new ApiError('Permintaan tidak diizinkan.',403,'FORBIDDEN');
}
export async function readBody(request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new ApiError('Format permintaan tidak sesuai.',415);
  const text = await request.text();
  if (Buffer.byteLength(text) > 12000) throw new ApiError('Pesan terlalu panjang.',413);
  try { return JSON.parse(text); } catch { throw new ApiError('Permintaan tidak dapat dibaca.'); }
}
export function json(data,status=200) {
  return NextResponse.json(data,{status,headers:{'Cache-Control':'no-store'}});
}
export function failure(error) {
  return json({error:{code:error.code || 'INTERNAL_ERROR',message:error instanceof ApiError ? error.message : 'Permintaan belum berhasil. Silakan coba kembali.'}},error.status || 500);
}
