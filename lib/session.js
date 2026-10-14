import {createHmac, timingSafeEqual} from 'node:crypto';
import {validNickname} from './password.js';
export const SESSION_COOKIE = 'hifi68-session';
export const SESSION_AGE = 12 * 60 * 60;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error('SESSION_SECRET must contain at least 32 characters');
  return value;
}
export function signSession(user, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({id:user.id,nickname:user.nickname,role:user.role,version:2,exp:Math.floor(now/1000)+SESSION_AGE})).toString('base64url');
  return `${payload}.${createHmac('sha256',secret()).update(payload).digest('base64url')}`;
}
export function readSession(value, now = Date.now()) {
  if (!value || !process.env.SESSION_SECRET) return null;
  try {
    const [payload, signature, extra] = value.split('.');
    if (!payload || !signature || extra || value.length > 6000) return null;
    const expected = createHmac('sha256',secret()).update(payload).digest();
    const actual = Buffer.from(signature,'base64url');
    if (actual.length !== expected.length || !timingSafeEqual(actual,expected)) return null;
    const data = JSON.parse(Buffer.from(payload,'base64url').toString());
    if (data.version!==2 || !Number.isFinite(data.exp) || data.exp <= Math.floor(now/1000) ||
      !/^[A-Za-z0-9_-]{1,128}$/.test(data.id || '') || !validNickname(data.nickname) ||
      !['user','admin'].includes(data.role)) return null;
    return {id:data.id,nickname:data.nickname,name:data.nickname,role:data.role};
  } catch { return null; }
}
export function isAdmin(user) {
  return Boolean(user && user.role==='admin');
}
export function appOrigin() {
  const url = new URL(process.env.APP_URL || 'http://localhost:3068');
  if (url.protocol !== 'https:' && !['localhost','127.0.0.1'].includes(url.hostname)) throw new Error('APP_URL must use HTTPS');
  return url.origin;
}
export function cookieOptions(maxAge = SESSION_AGE) {
  return {httpOnly:true,secure:appOrigin().startsWith('https:'),sameSite:'lax',path:'/',maxAge};
}
