import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {hashPassword,verifyPassword,normalizeNickname,validNickname} from '../lib/password.js';
import {signSession,readSession,isAdmin,SESSION_AGE} from '../lib/session.js';
import {registerAccount,loginAccount,authClientKey} from '../lib/accounts.js';
import {signedEnvelope,backend} from '../lib/backend.js';
import {createGasRuntime} from './gas-runtime.mjs';
process.env.SESSION_SECRET='s'.repeat(64);
process.env.APPS_SCRIPT_SECRET='a'.repeat(64);
process.env.APPS_SCRIPT_URL='https://script.google.com/macros/s/test-fixture/exec';
const clientKey='c'.repeat(64),password='Password bebas 2026!';
const request=(runtime,action,data={})=>runtime.call(signedEnvelope(action,null,data));
function bridge(t,runtime) {
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    assert.equal(String(url),process.env.APPS_SCRIPT_URL);
    assert.equal(JSON.parse(Buffer.from(JSON.parse(options.body).payload,'base64url').toString()).data.password,undefined);
    return new Response(JSON.stringify(runtime.call(JSON.parse(options.body))),{status:200});
  });
}
test('custom nicknames support spaces, Unicode and symbols without fixed names',()=>{
  assert.equal(normalizeNickname('  Akang   Éko 😊 '),'Akang Éko 😊');
  for(const nickname of ['Akang Éko 😊','Nama Saya','@sandzh','admin','=SUM(A1:A2)','Ａｋａｎｇ']) assert.equal(validNickname(normalizeNickname(nickname)),true);
  for(const nickname of ['x','a'.repeat(41),'ab\u202ecd']) assert.equal(validNickname(nickname),false);
});
test('scrypt uses unique salts and verifies passwords without truncation or plain storage',async()=>{
  const first=await hashPassword(password),second=await hashPassword(password);
  assert.notEqual(first,second);assert.equal(first.includes(password),false);
  assert.equal(await verifyPassword(password,first),true);
  assert.equal(await verifyPassword(password+' ',first),false);
  assert.equal(await verifyPassword(password,'broken hash'),false);
});
test('sessions expire, reject edits and legacy Google sessions, and strip password fields',()=>{
  const now=1760000000000,user={id:'12345',nickname:'Nama Saya',role:'user',admin:true,password:'leak',passwordHash:'leak'};
  const token=signSession(user,now),decoded=JSON.parse(Buffer.from(token.split('.')[0],'base64url').toString());
  assert.equal(decoded.password,undefined);assert.equal(decoded.passwordHash,undefined);assert.equal(decoded.admin,undefined);
  assert.equal(readSession(token,now).nickname,user.nickname);assert.equal(isAdmin(readSession(token,now)),false);
  assert.equal(readSession(token,now+(SESSION_AGE+1)*1000),null);
  const [body,signature]=token.split('.');
  const edited=Buffer.from(JSON.stringify({...decoded,role:'admin'})).toString('base64url');
  assert.equal(readSession(`${edited}.${signature}`,now),null);
  const legacy=Buffer.from(JSON.stringify({id:'12345',email:'legacy@gmail.com',exp:Math.floor(now/1000)+1000})).toString('base64url');
  assert.equal(readSession(`${legacy}.${createHmac('sha256',process.env.SESSION_SECRET).update(legacy).digest('base64url')}`,now),null);
  assert.equal(readSession('broken',now),null);
});
test('registration and case-insensitive login persist a custom account and never return its hash to the browser',async(t)=>{
  const runtime=createGasRuntime({seedAccounts:false});bridge(t,runtime);
  const user=await registerAccount({nickname:'Akang Éko 😊',password,passwordConfirm:password,role:'admin'},clientKey);
  assert.equal(user.nickname,'Akang Éko 😊');assert.equal(user.role,'user');assert.equal(user.passwordHash,undefined);
  const row=runtime.tables.get('Accounts').data[1];assert.match(row[2],/^scrypt\$/);assert.equal(row.includes(password),false);
  const loggedIn=await loginAccount({nickname:'akang éko 😊',password},clientKey);assert.equal(loggedIn.id,user.id);
  assert.equal(loggedIn.passwordHash,undefined);
  await assert.rejects(registerAccount({nickname:'AKANG ÉKO 😊',password,passwordConfirm:password},clientKey),err=>err.code==='CONFLICT');
  assert.equal(runtime.tables.get('Accounts').data.length,2);
});
test('wrong and missing accounts share the login error, and retries are limited despite nickname case changes',async(t)=>{
  const runtime=createGasRuntime({seedAccounts:false});bridge(t,runtime);
  await registerAccount({nickname:'Sandi Saya',password,passwordConfirm:password},clientKey);
  for(const nickname of ['Sandi Saya','Tidak Ada']) await assert.rejects(loginAccount({nickname,password:'salah'},clientKey),err=>err.code==='UNAUTHORIZED' && err.message==='Nickname atau password salah.');
  for(let i=0;i<4;i++) await assert.rejects(loginAccount({nickname:i%2 ? 'SANDI SAYA' : 'sandi saya',password:'salah'},clientKey),err=>err.code==='UNAUTHORIZED');
  await assert.rejects(loginAccount({nickname:'Sandi Saya',password},clientKey),err=>err.code==='RATE_LIMIT');
});
test('server validates confirmation and length before storage and literal formula nicknames round-trip',async(t)=>{
  const runtime=createGasRuntime({seedAccounts:false});bridge(t,runtime);
  await assert.rejects(registerAccount({nickname:'Nama Bebas',password,passwordConfirm:'beda'},clientKey),/Konfirmasi/);
  await assert.rejects(registerAccount({nickname:'Nama Bebas',password:'pendek',passwordConfirm:'pendek'},clientKey),/10–128/);
  const user=await registerAccount({nickname:'=SUM(A1:A2)',password,passwordConfirm:password},clientKey);
  assert.equal(runtime.tables.get('Accounts').data[1][1],JSON.stringify(user.nickname));
  assert.equal((await loginAccount({nickname:user.nickname,password},clientKey)).id,user.id);
});
test('public registration cannot grant operator privileges; Apps Script checks stored role and account',async(t)=>{
  const runtime=createGasRuntime({seedAccounts:false});bridge(t,runtime);
  const user=await registerAccount({nickname:'admin',password,passwordConfirm:password,role:'admin',admin:true},clientKey);
  await assert.rejects(backend('admin.overview',{...user,role:'admin'}),err=>err.code==='FORBIDDEN');
  const created=await backend('auth.createAdmin',null,{nickname:'Operator pilihan',passwordHash:await hashPassword(password)});
  assert.equal(created.user.role,'admin');
  const admin=await loginAccount({nickname:'operator pilihan',password},clientKey);
  assert.equal(isAdmin(readSession(signSession(admin))),true);
  assert.equal((await backend('admin.overview',admin)).totalTickets,0);
  await assert.rejects(backend('menfess.submit',{...admin,id:'made-up'},{body:'Halo'}),err=>err.code==='UNAUTHORIZED');
});
test('custom accounts can enter raffle once and menfess never discloses their nickname',async(t)=>{
  const runtime=createGasRuntime();bridge(t,runtime);
  const user=await registerAccount({nickname:'Nama panjang bebas 😊',password,passwordConfirm:password},clientKey);
  const admin={id:'90000',nickname:'Panitia',role:'admin'};
  const post=await backend('menfess.submit',user,{body:'Hatur nuhun untuk acara ini.',anonymous:false});
  await backend('admin.moderate',admin,{type:'menfess',id:post.id,status:'approved'});
  const publicPost=(await backend('menfess.list')).posts[0];assert.equal(publicPost.author,'Baraya anonim');assert.equal(publicPost.nickname,undefined);
  await backend('raffle.toggle',admin,{open:true});
  const ticket=await backend('raffle.join',user,{consent:true});assert.equal((await backend('raffle.join',user,{consent:true})).number,ticket.number);
  assert.equal(runtime.tables.get('Tickets').data.length,2);
  assert.equal(runtime.tables.get('Tickets').data[1][3],user.nickname);
});
test('untrusted forwarded headers cannot change the local auth rate-limit identity',()=>{
  delete process.env.VERCEL;
  assert.equal(authClientKey(new Request('http://localhost',{headers:{'x-forwarded-for':'one'}})),authClientKey(new Request('http://localhost',{headers:{'x-forwarded-for':'two'}})));
});
