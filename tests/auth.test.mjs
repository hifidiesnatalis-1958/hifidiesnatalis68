import test from 'node:test';
import assert from 'node:assert/strict';
import {hashPassword,verifyPassword} from '../lib/password.js';
import {validNpm,publicName} from '../lib/npm.js';
import {signSession,readSession,isAdmin,STUDENT_SESSION_AGE} from '../lib/session.js';
import {registerAccount,loginAccount,authClientKey} from '../lib/accounts.js';
import {backend} from '../lib/backend.js';
import {createGasRuntime} from './gas-runtime.mjs';
process.env.SESSION_SECRET='s'.repeat(64);process.env.APPS_SCRIPT_SECRET='a'.repeat(64);
process.env.APPS_SCRIPT_URL='https://script.google.com/macros/s/test-fixture/exec';
const clientKey='c'.repeat(64),npm='140310240054',name='Sandy Fauzi',password='Password pilihan 2026';
const registration=(extra={})=>({npm,name,password,passwordConfirm:password,...extra});
function bridge(t,runtime,old=false){t.mock.method(globalThis,'fetch',async(url,options)=>{
 const payload=JSON.parse(Buffer.from(JSON.parse(options.body).payload,'base64url').toString());
 assert.equal(payload.data.token,undefined);assert.equal(payload.data.password,undefined);assert.equal(payload.data.passwordConfirm,undefined);
 const result=runtime.call(JSON.parse(options.body));if(old && payload.action==='auth.checkRegister')delete result.data.accountNames;
 return new Response(JSON.stringify(result));
});}

test('NPM rejects cohort 26, other departments, invalid length and zero serial',()=>{
 for(const value of ['140310240054','140310250001','140310190099','140310000001'])assert.equal(validNpm(value),true);
 for(const value of ['140310260054','140310990054','140311240054','140310240154','140310240000','1403102400541','14031024005',140310240054])assert.equal(validNpm(value),false);
 assert.equal(publicName(npm).includes(npm),false);
});
test('registration stores the chosen name and salted password hash, with no issued token',async(t)=>{
 const runtime=createGasRuntime({seedAccounts:false});bridge(t,runtime);
 const user=await registerAccount(registration({name:'  Sandy   Fauzi  ',role:'admin'}),clientKey);
 assert.equal(user.role,'user');assert.equal(user.npm,npm);assert.equal(user.name,name);assert.equal(user.token,undefined);assert.equal(user.passwordHash,undefined);
 const row=runtime.tables.get('Accounts').data[1];assert.equal(row.includes(password),false);assert.equal(JSON.parse(row[6]),name);assert.equal(await verifyPassword(password,row[2]),true);
 const second=await registerAccount(registration({npm:'140310250001'}),clientKey);assert.notEqual(second.id,user.id);assert.equal(second.name,name);
});
test('name, password length and confirmation are mandatory before writing an account',async(t)=>{
 const runtime=createGasRuntime({seedAccounts:false});bridge(t,runtime);
 for(const input of [registration({name:''}),registration({name:'A'}),registration({name:'A'.repeat(101)}),registration({password:'short',passwordConfirm:'short'}),registration({passwordConfirm:'different'}),{npm,token:'HIFI68-'+'x'.repeat(32)}])await assert.rejects(registerAccount(input,clientKey));
 assert.equal(runtime.tables.get('Accounts').data.length,1);
});
test('one NPM has one account and login reads the saved name instead of client-supplied identity',async(t)=>{
 const runtime=createGasRuntime({seedAccounts:false});bridge(t,runtime);const first=await registerAccount(registration(),clientKey);
 await assert.rejects(registerAccount(registration({name:'Nama berbeda'}),clientKey),e=>e.code==='CONFLICT');
 const user=await loginAccount({npm,password,name:'Nama palsu'},clientKey),again=await loginAccount({npm,password},clientKey);
 assert.equal(user.id,first.id);assert.equal(again.id,user.id);assert.equal(user.name,name);assert.equal(runtime.tables.get('Accounts').data.length,2);
});
test('server eligibility rejects unsupported NPMs and old nickname-only public registration',async(t)=>{
 const runtime=createGasRuntime({seedAccounts:false});bridge(t,runtime);
 for(const input of [registration({npm:'140310260001'}),registration({npm:'140310240154'}),{nickname:'random',password}])await assert.rejects(registerAccount(input,clientKey),error=>{assert.doesNotMatch(error.message,/140310\d{6}/);return true;});
 assert.equal(runtime.tables.get('Accounts').data.length,1);
});
test('an old Apps Script deployment cannot silently drop a submitted name',async(t)=>{
 const runtime=createGasRuntime({seedAccounts:false});bridge(t,runtime,true);
 await assert.rejects(registerAccount(registration(),clientKey),e=>e.code==='BACKEND_UPDATE_REQUIRED');assert.equal(runtime.tables.get('Accounts').data.length,1);
});
test('wrong passwords and unknown accounts share an error; auth rate limits remain active',async(t)=>{
 const runtime=createGasRuntime({seedAccounts:false});bridge(t,runtime);await registerAccount(registration(),clientKey);
 for(const value of [npm,'140310250001'])await assert.rejects(loginAccount({npm:value,password:'Incorrect password'},clientKey),e=>e.code==='UNAUTHORIZED');
 for(let i=0;i<4;i++)await assert.rejects(loginAccount({npm,password:'Incorrect password'},clientKey),e=>e.code==='UNAUTHORIZED');
 await assert.rejects(loginAccount({npm,password:'Incorrect password'},clientKey),e=>e.code==='RATE_LIMIT');
});
test('existing operators retain password access and student accounts cannot use their path',async(t)=>{
 const runtime=createGasRuntime({seedAccounts:false});bridge(t,runtime);
 await backend('auth.createAdmin',null,{nickname:'Panitia pilihan',passwordHash:await hashPassword('Operator password 2026')});
 const admin=await loginAccount({operator:true,nickname:'Panitia pilihan',password:'Operator password 2026'},clientKey);
 assert.equal(isAdmin(readSession(signSession(admin))),true);await registerAccount(registration(),clientKey);
 await assert.rejects(loginAccount({operator:true,nickname:npm,password},clientKey),e=>e.code==='FORBIDDEN');
});
test('one NPM receives one named raffle ticket; Harewos hides name and NPM',async(t)=>{
 const runtime=createGasRuntime();bridge(t,runtime);const user=await registerAccount(registration(),clientKey),admin={id:'90000',nickname:'Panitia',role:'admin'};
 await backend('raffle.toggle',admin,{open:true});const first=await backend('raffle.join',user,{consent:true});
 const again=await loginAccount({npm,password},clientKey);assert.equal((await backend('raffle.join',again,{consent:true})).number,first.number);
 assert.equal(runtime.tables.get('Tickets').data.length,2);assert.equal(runtime.tables.get('Tickets').data[1][3],name);
 const post=await backend('menfess.submit',user,{body:'Hatur nuhun baraya.'});await backend('admin.moderate',admin,{type:'menfess',id:post.id,status:'approved'});
 const serialized=JSON.stringify((await backend('menfess.list')).posts);assert.equal(serialized.includes(npm),false);assert.equal(serialized.includes(name),false);
});
test('student sessions preserve name, omit password and expire after 30 days',()=>{
 const user={id:'student-1',nickname:npm,name,role:'user',password},now=Date.now(),signed=signSession(user,now);
 assert.equal(readSession(signed,now).name,name);assert.equal(readSession(signed,now).npm,npm);assert.equal(readSession(signed,now+STUDENT_SESSION_AGE*1000+1),null);assert.equal(readSession(signed+'x',now),null);
 assert.equal(Buffer.from(signed.split('.')[0],'base64url').toString().includes(password),false);
});
test('Accounts migration appends only the name header, preserving all legacy values and admin access',()=>{
 const runtime=createGasRuntime(),sheet=runtime.tables.get('Accounts');sheet.data=sheet.data.map(row=>row.slice(0,6));const before=JSON.stringify(sheet.data.slice(1));
 runtime.context.setupDiesnat();assert.equal(sheet.data[0][6],'name');assert.equal(JSON.stringify(sheet.data.slice(1)),before);runtime.context.setupDiesnat();assert.equal(JSON.stringify(sheet.data.slice(1)),before);
 sheet.data[0][2]='unexpected';assert.throws(()=>runtime.context.setupDiesnat(),/Header sheet Accounts/);
});
test('forwarded headers cannot change the local auth limit identity',()=>{
 delete process.env.VERCEL;assert.equal(authClientKey(new Request('http://localhost',{headers:{'x-forwarded-for':'one'}})),authClientKey(new Request('http://localhost',{headers:{'x-forwarded-for':'two'}})));
});
