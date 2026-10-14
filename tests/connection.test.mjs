import test from 'node:test';
import assert from 'node:assert/strict';
import {backend} from '../lib/backend.js';
import {createGasRuntime} from './gas-runtime.mjs';

process.env.APPS_SCRIPT_SECRET='a'.repeat(64);
process.env.APPS_SCRIPT_URL='https://script.google.com/macros/s/test-fixture/exec';
const user={id:'10001',nickname:'Sandy',role:'user'};
const connectTimeout=()=>new TypeError('fetch failed',{cause:{code:'UND_ERR_CONNECT_TIMEOUT'}});

test('a connection timeout before the POST is retried once and the request is applied once',async(t)=>{
  const runtime=createGasRuntime();let calls=0;
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    assert.equal(options.redirect,'manual');assert.equal(options.method,'POST');
    if(++calls===1) throw connectTimeout();
    return new Response(JSON.stringify(runtime.call(JSON.parse(options.body))));
  });
  const result=await backend('menfess.submit',user,{body:'Hatur nuhun baraya.'});
  assert.equal(result.status,'pending');assert.equal(calls,2);
  assert.equal(runtime.tables.get('Menfess').data.length,2);
});

test('a failed response redirect retries only GET and never resubmits a saved message',async(t)=>{
  const runtime=createGasRuntime();let posts=0,gets=0,result;
  const target='https://script.googleusercontent.com/macros/echo?one-time=response';
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    if(options.method==='POST') {
      posts++;result=runtime.call(JSON.parse(options.body));
      return new Response(null,{status:302,headers:{Location:target}});
    }
    assert.equal(String(url),target);assert.equal(options.body,undefined);
    if(++gets===1) throw connectTimeout();
    return new Response(JSON.stringify(result));
  });
  assert.equal((await backend('menfess.submit',user,{body:'Carita ti baraya.'})).status,'pending');
  assert.equal(posts,1);assert.equal(gets,2);assert.equal(runtime.tables.get('Menfess').data.length,2);
});

test('an ambiguous socket failure after a write is not retried',async(t)=>{
  const runtime=createGasRuntime();let calls=0;
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    calls++;runtime.call(JSON.parse(options.body));
    throw new TypeError('fetch failed',{cause:{code:'UND_ERR_SOCKET'}});
  });
  await assert.rejects(backend('menfess.submit',user,{body:'Pesan yang sudah tersimpan.'}),error=>error.code==='BACKEND_UNAVAILABLE');
  assert.equal(calls,1);assert.equal(runtime.tables.get('Menfess').data.length,2);
});

test('persistent connection failures stop after two attempts with a useful timeout error',async(t)=>{
  let calls=0;
  t.mock.method(globalThis,'fetch',async()=>{calls++;throw connectTimeout();});
  await assert.rejects(backend('auth.status'),error=>error.code==='BACKEND_UNAVAILABLE' && error.message.includes('Google sedang lambat'));
  assert.equal(calls,2);
});

test('auth and rate-limit errors are returned directly without network retries',async(t)=>{
  let calls=0;
  t.mock.method(globalThis,'fetch',async()=>{
    calls++;return new Response(JSON.stringify({ok:false,error:{code:'RATE_LIMIT',message:'Terlalu banyak percobaan.'}}));
  });
  await assert.rejects(backend('auth.lookup'),error=>error.code==='RATE_LIMIT' && error.status===429);
  assert.equal(calls,1);
});

test('redirects cannot forward signed account requests to another host',async(t)=>{
  let calls=0;
  t.mock.method(globalThis,'fetch',async()=>{
    calls++;return new Response(null,{status:302,headers:{Location:'https://script.googleusercontent.com.evil.test/collect'}});
  });
  await assert.rejects(backend('auth.status'),error=>error.code==='SETUP_REQUIRED');
  assert.equal(calls,1);
});
