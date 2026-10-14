import test from 'node:test';
import assert from 'node:assert/strict';
import {signedEnvelope,backend} from '../lib/backend.js';
import {createGasRuntime} from './gas-runtime.mjs';
process.env.APPS_SCRIPT_SECRET='a'.repeat(64);
const user={id:'10001',nickname:'Sandy',name:'Sandy',role:'user'};
const other={id:'10002',nickname:'Baraya',name:'Baraya',role:'user'};
const admin={id:'90000',nickname:'Panitia',name:'Panitia',role:'admin'};
const request=(runtime,action,actor=null,data={})=>runtime.call(signedEnvelope(action,actor,data));

test('setup targets the provided existing spreadsheet and respects an explicit property override',()=>{
  const runtime=createGasRuntime({spreadsheetId:null});
  const id='1p4-ieKHatSnqblBdOP219ohSOD5jWhK-Xg3z1mWhoMA';
  assert.equal(runtime.openedIds[0],id);assert.equal(runtime.props.get('SPREADSHEET_ID'),id);
  assert.deepEqual([...runtime.tables.keys()],['Accounts','Users','Menfess','Likes','Messages','Tickets','Draws','Settings']);
  assert.equal(createGasRuntime({spreadsheetId:'configured-spreadsheet'}).openedIds[0],'configured-spreadsheet');
});

test('Apps Script rejects unsigned, forged, expired and replayed requests',()=>{
  const runtime=createGasRuntime();
  assert.equal(runtime.call({}).error.code,'UNAUTHORIZED');
  const envelope=signedEnvelope('content.get',null);
  assert.equal(runtime.call({...envelope,signature:'0'.repeat(64)}).error.code,'UNAUTHORIZED');
  assert.equal(runtime.call(envelope).ok,true);
  assert.equal(runtime.call(envelope).error.code,'UNAUTHORIZED');
  assert.equal(runtime.call(signedEnvelope('content.get',null,{},Date.now()-400000)).error.code,'UNAUTHORIZED');
});
test('menfess requires a registered account, moderation hides pending messages and author identity',()=>{
  const runtime=createGasRuntime();
  assert.equal(request(runtime,'menfess.submit',null,{body:'Halo'}).error.code,'UNAUTHORIZED');
  assert.equal(request(runtime,'menfess.submit',{...user,id:'unregistered'},{body:'Halo'}).error.code,'UNAUTHORIZED');
  const result=request(runtime,'menfess.submit',user,{body:'Semoga perayaan ini menyenangkan.',to:'Baraya',anonymous:false});
  assert.equal(result.data.status,'pending');
  assert.notEqual(runtime.tables.get('Menfess').data[1][1],user.id);
  assert.equal(runtime.tables.get('Menfess').data[1][5],'Baraya anonim');
  assert.equal(request(runtime,'admin.overview',admin).data.pending[0].name,'Baraya anonim');
  assert.equal(request(runtime,'menfess.list').data.posts.length,0);
  assert.equal(request(runtime,'menfess.list',user).data.mine.length,1);
  assert.equal(request(runtime,'menfess.submit',user,{body:'Terlalu cepat'}).error.code,'RATE_LIMIT');
  assert.equal(request(runtime,'admin.moderate',user,{type:'menfess',id:result.data.id,status:'approved'}).error.code,'FORBIDDEN');
  assert.equal(request(runtime,'admin.moderate',admin,{type:'menfess',id:result.data.id,status:'approved'}).ok,true);
  const list=request(runtime,'menfess.list').data.posts;
  assert.equal(list[0].author,'Baraya anonim');assert.equal(list[0].userId,undefined);assert.equal(list[0].email,undefined);
  assert.equal(request(runtime,'menfess.like',other,{id:result.data.id}).data.likes,1);
  assert.equal(request(runtime,'menfess.like',other,{id:result.data.id}).data.likes,0);
});
test('Vercel bridge and real app.gs agree on request signing, errors, and anonymous storage',async(t)=>{
  const runtime=createGasRuntime();
  process.env.APPS_SCRIPT_URL='https://script.google.com/macros/s/test-fixture/exec';
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    assert.equal(String(url),process.env.APPS_SCRIPT_URL);
    assert.equal(options.method,'POST');
    return new Response(JSON.stringify(runtime.call(JSON.parse(options.body))),{status:200});
  });
  const result=await backend('menfess.submit',user,{body:'Terhubung dari Vercel.',anonymous:false});
  assert.equal(result.status,'pending');
  assert.equal((await backend('menfess.list',user)).mine.length,1);
  await assert.rejects(backend('menfess.submit',other,{body:''}),error=>error.status===400);
  await assert.rejects(backend('admin.overview',user),error=>error.status===403);
});
test('raffle is idempotent, locked during registration, and never awards the same account twice',()=>{
  const runtime=createGasRuntime();
  assert.equal(request(runtime,'raffle.join',user,{consent:true}).error.code,'CONFLICT');
  assert.equal(request(runtime,'raffle.toggle',admin,{open:true}).ok,true);
  assert.equal(request(runtime,'raffle.join',null,{consent:true}).error.code,'UNAUTHORIZED');
  assert.equal(request(runtime,'raffle.join',{...user,id:'unregistered'},{consent:true}).error.code,'UNAUTHORIZED');
  assert.equal(runtime.tables.get('Tickets').data.length,1);
  assert.equal(request(runtime,'raffle.join',user,{consent:false}).error.code,'INVALID_REQUEST');
  const first=request(runtime,'raffle.join',user,{consent:true});
  const duplicate=request(runtime,'raffle.join',user,{consent:true});
  assert.equal(first.data.number,duplicate.data.number);assert.equal(duplicate.data.alreadyRegistered,true);
  assert.equal(request(runtime,'raffle.join',other,{consent:true}).ok,true);
  const data={prize:'Merch Dies Natalis',entropy:Array(16).fill(0)};
  assert.equal(request(runtime,'raffle.draw',admin,data).error.code,'CONFLICT');
  request(runtime,'raffle.toggle',admin,{open:false});
  const one=request(runtime,'raffle.draw',admin,data).data.winner;
  const two=request(runtime,'raffle.draw',admin,data).data.winner;
  assert.notEqual(one.number,two.number);
  assert.equal(request(runtime,'raffle.draw',admin,data).error.code,'CONFLICT');
  const publicState=request(runtime,'raffle.status',user).data;
  assert.equal(publicState.total,2);assert.equal(publicState.ticket.number,first.data.number);
  assert.equal(publicState.winners[0].userId,undefined);assert.equal(publicState.winners[0].email,undefined);
});
test('sheet input cannot become a formula and setup preserves existing records',()=>{
  const runtime=createGasRuntime();
  request(runtime,'messages.submit',user,{body:'=IMPORTXML("https://example.invalid", "x")'});
  assert.match(runtime.tables.get('Messages').data[1][2],/^'=/);
  assert.equal(request(runtime,'messages.list').data.messages.length,0);
  runtime.context.setupDiesnat();assert.equal(runtime.tables.get('Messages').data.length,2);
});
test('screening rejects abusive destinations, disguised profanity and threats without matching ordinary words',()=>{
  const runtime=createGasRuntime();
  for(const body of ['Kamu GOBLOKKK','b4ngs4t','a.n.j.i.n.g','a n j i n g','bunuh kamu','Mati aja']) {
    const result=request(runtime,'menfess.submit',user,{body});
    assert.equal(result.error.code,'INVALID_REQUEST',body);
  }
  assert.equal(request(runtime,'menfess.submit',user,{to:'t0l0l',body:'Halo baraya.'}).error.code,'INVALID_REQUEST');
  assert.equal(runtime.tables.get('Menfess').data.length,1);
  runtime.props.set('MENFESS_BLOCKED_WORDS','katakhusus');
  assert.equal(request(runtime,'menfess.submit',user,{body:'KataKhusus'}).error.code,'INVALID_REQUEST');
  assert.equal(request(runtime,'menfess.submit',user,{body:'Dongeng di bangunan kampus. Terima kasih untuk semua baraya!'}).ok,true);
});
test('presentation is operator-only, includes approved safe anonymous posts and rechecks legacy rows',()=>{
  const runtime=createGasRuntime(),createdAt=new Date().toISOString();
  const good=request(runtime,'menfess.submit',user,{to:'Baraya HIFI',body:'Hatur nuhun, sampai bertemu di Dies Natalis!'}).data;
  request(runtime,'admin.moderate',admin,{type:'menfess',id:good.id,status:'approved'});
  request(runtime,'menfess.submit',other,{body:'Pesan belum ditinjau.'});
  const sheet=runtime.tables.get('Menfess');
  sheet.appendRow(['legacy-bad','12345','Baraya','g0bl0k',false,'Actual sender','approved',createdAt]);
  sheet.appendRow(['legacy-to','12345','b4ngs4t','Halo',false,'Actual sender','approved',createdAt]);
  sheet.appendRow(['legacy-pending','12345','','tolol',false,'Actual sender','pending',createdAt]);
  assert.equal(request(runtime,'menfess.presentation').error.code,'UNAUTHORIZED');
  assert.equal(request(runtime,'menfess.presentation',user).error.code,'FORBIDDEN');
  const result=request(runtime,'menfess.presentation',admin).data;
  assert.equal(result.blocked,2);assert.equal(result.filterActive,true);assert.equal(result.posts.length,1);
  assert.deepEqual(result.posts[0],{id:good.id,to:'Baraya HIFI',body:'Hatur nuhun, sampai bertemu di Dies Natalis!',author:'Baraya anonim'});
  assert.equal(request(runtime,'menfess.list').data.posts.length,1);
  assert.equal(request(runtime,'menfess.like',user,{id:'legacy-bad'}).error.code,'NOT_FOUND');
  assert.equal(request(runtime,'admin.moderate',admin,{type:'menfess',id:'legacy-pending',status:'approved'}).error.code,'INVALID_REQUEST');
  assert.equal(request(runtime,'admin.overview',admin).data.pending.find(p=>p.id==='legacy-pending').flagged,true);
  runtime.props.set('MENFESS_BLOCKED_WORDS','hatur nuhun');
  assert.equal(request(runtime,'menfess.presentation',admin).data.posts.length,0);
});
