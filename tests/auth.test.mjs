import test from 'node:test';
import assert from 'node:assert/strict';
import {hashPassword,verifyPassword} from '../lib/password.js';
import {validNpm,publicName} from '../lib/npm.js';
import {signSession,readSession,isAdmin,STUDENT_SESSION_AGE} from '../lib/session.js';
import {registerAccount,loginAccount,authClientKey,recoverStudentToken} from '../lib/accounts.js';
import {backend} from '../lib/backend.js';
import {createGasRuntime} from './gas-runtime.mjs';
process.env.SESSION_SECRET='s'.repeat(64);process.env.APPS_SCRIPT_SECRET='a'.repeat(64);
process.env.APPS_SCRIPT_URL='https://script.google.com/macros/s/test-fixture/exec';
const clientKey='c'.repeat(64),npm='140310240054';
function bridge(t,runtime){t.mock.method(globalThis,'fetch',async(url,options)=>{
 const payload=JSON.parse(Buffer.from(JSON.parse(options.body).payload,'base64url').toString());
 assert.equal(payload.data.token,undefined);assert.equal(payload.data.password,undefined);
 return new Response(JSON.stringify(runtime.call(JSON.parse(options.body))));
});}
test('NPM rejects cohort 26, other departments, invalid length and zero serial',()=>{
 for(const value of ['140310240054','140310250001','140310190099','140310000001'])assert.equal(validNpm(value),true);
 for(const value of ['140310260054','140310990054','140311240054','140310240154','140310240000','1403102400541','14031024005',140310240054,' 140310240054'])assert.equal(validNpm(value),false);
 assert.equal(publicName(npm).includes(npm),false);
});
test('tokens are opaque and distinct per NPM, hashed at rest, and only returned at registration',async(t)=>{
 const runtime=createGasRuntime({seedAccounts:false});bridge(t,runtime);
 const first=await registerAccount({npm,role:'admin'},clientKey),second=await registerAccount({npm:'140310250001'},clientKey);
 assert.match(first.token,/^HIFI68-[A-Za-z0-9_-]{32}$/);assert.notEqual(first.token,second.token);
 assert.equal(first.user.role,'user');assert.equal(first.user.npm,npm);assert.equal(first.user.passwordHash,undefined);
 const row=runtime.tables.get('Accounts').data[1];assert.equal(row.includes(first.token),false);assert.match(row[2],/^scrypt\$/);
 assert.equal(await verifyPassword(first.token,row[2]),true);
});
test('one NPM has one account across repeated logins and duplicate registration cannot issue a new token',async(t)=>{
 const runtime=createGasRuntime({seedAccounts:false});bridge(t,runtime);
 const first=await registerAccount({npm},clientKey);
 await assert.rejects(registerAccount({npm},clientKey),e=>e.code==='CONFLICT');
 const user=await loginAccount({npm,token:first.token},clientKey),again=await loginAccount({npm,token:first.token},clientKey);
 assert.equal(user.id,first.user.id);assert.equal(again.id,user.id);assert.equal(runtime.tables.get('Accounts').data.length,2);
 assert.equal(user.token,undefined);assert.equal(user.passwordHash,undefined);
});
test('eligibility is checked server-side and old public nickname registration is disabled',async(t)=>{
 const runtime=createGasRuntime({seedAccounts:false});bridge(t,runtime);
 for(const input of [{npm:'140310260001'},{npm:'140310240154'},{nickname:'random',password:'Passphrase 2026'}])await assert.rejects(registerAccount(input,clientKey));
 assert.equal(runtime.tables.get('Accounts').data.length,1);
 await assert.rejects(loginAccount({nickname:'someone',password:'anything'},clientKey));
});
test('wrong and missing tokens share an error and auth rate limits remain active',async(t)=>{
 const runtime=createGasRuntime({seedAccounts:false});bridge(t,runtime);await registerAccount({npm},clientKey);
 for(const value of [npm,'140310250001'])await assert.rejects(loginAccount({npm:value,token:'HIFI68-'+'x'.repeat(32)},clientKey),e=>e.code==='UNAUTHORIZED');
 for(let i=0;i<4;i++)await assert.rejects(loginAccount({npm,token:'HIFI68-'+'x'.repeat(32)},clientKey),e=>e.code==='UNAUTHORIZED');
 await assert.rejects(loginAccount({npm,token:'HIFI68-'+'x'.repeat(32)},clientKey),e=>e.code==='RATE_LIMIT');
});
test('existing operators retain password access; NPM accounts cannot use the operator path',async(t)=>{
 const runtime=createGasRuntime({seedAccounts:false});bridge(t,runtime);
 await backend('auth.createAdmin',null,{nickname:'Panitia pilihan',passwordHash:await hashPassword('Operator password 2026')});
 const admin=await loginAccount({operator:true,nickname:'Panitia pilihan',password:'Operator password 2026'},clientKey);
 assert.equal(admin.role,'admin');assert.equal(isAdmin(readSession(signSession(admin))),true);
 const {token}=await registerAccount({npm},clientKey);
 await assert.rejects(loginAccount({operator:true,nickname:npm,password:token},clientKey),e=>e.code==='FORBIDDEN');
});
test('one NPM gets one ticket and Harewos never discloses it',async(t)=>{
 const runtime=createGasRuntime();bridge(t,runtime);
 const {user,token}=await registerAccount({npm},clientKey),admin={id:'90000',nickname:'Panitia',role:'admin'};
 await backend('raffle.toggle',admin,{open:true});const first=await backend('raffle.join',user,{consent:true});
 const again=await loginAccount({npm,token},clientKey);
 assert.equal((await backend('raffle.join',again,{consent:true})).number,first.number);assert.equal(runtime.tables.get('Tickets').data.length,2);
 const post=await backend('menfess.submit',user,{body:'Hatur nuhun baraya.'});
 await backend('admin.moderate',admin,{type:'menfess',id:post.id,status:'approved'});
 const postPublic=(await backend('menfess.list')).posts[0];assert.equal(postPublic.author,'Baraya anonim');assert.equal(JSON.stringify(postPublic).includes(npm),false);
});
test('student sessions expire after 30 days and reject tampering',()=>{
 const user={id:'student-1',nickname:npm,role:'user'},now=Date.now(),signed=signSession(user,now);
 assert.equal(readSession(signed,now).npm,npm);assert.equal(readSession(signed,now+STUDENT_SESSION_AGE*1000+1),null);assert.equal(readSession(signed+'x',now),null);
});
test('forwarded headers cannot change the local auth limit identity',()=>{
 delete process.env.VERCEL;assert.equal(authClientKey(new Request('http://localhost',{headers:{'x-forwarded-for':'one'}})),authClientKey(new Request('http://localhost',{headers:{'x-forwarded-for':'two'}})));
});

test('operator recovery returns the same token without creating another account or ticket',async(t)=>{
 const runtime=createGasRuntime({seedAccounts:false});bridge(t,runtime);const first=await registerAccount({npm},clientKey);
 const recovered=await recoverStudentToken({npm},clientKey);assert.equal(recovered.token,first.token);assert.equal(runtime.tables.get('Accounts').data.length,2);assert.equal(runtime.tables.get('Tickets').data.length,1);
});
