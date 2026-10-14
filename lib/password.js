import {randomBytes,scrypt,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
const derive=promisify(scrypt);
const options={N:32768,r:8,p:3,maxmem:64*1024*1024};
const prefix='scrypt$32768$8$3$';
const format=/^scrypt\$32768\$8\$3\$([a-f0-9]{32})\$([a-f0-9]{128})$/;
const dummy=prefix+'0'.repeat(32)+'$'+'0'.repeat(128);
export const PASSWORD_MIN=10;
export function normalizeNickname(value) {return typeof value==='string' ? value.normalize('NFKC').trim().replace(/\s+/g,' ') : '';}
export function validNickname(value) {return typeof value==='string' && value.length>=2 && value.length<=40 && !/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/.test(value);}
export async function hashPassword(password) {
  const salt=randomBytes(16),hash=await derive(password,salt,64,options);
  return prefix+salt.toString('hex')+'$'+hash.toString('hex');
}
export async function verifyPassword(password,stored) {
  const match=format.exec(stored || ''),parts=match || format.exec(dummy);
  const actual=await derive(password,Buffer.from(parts[1],'hex'),64,options);
  return timingSafeEqual(actual,Buffer.from(parts[2],'hex')) && Boolean(match);
}
