import test from 'node:test';
import assert from 'node:assert/strict';
import {allowedOrigin} from '../lib/origin.js';
import {cookieOptions} from '../lib/session.js';
const request=(url,origin)=>new Request(url,{headers:{Origin:origin}});
test('localhost and loopback are equivalent only on project ports',()=>{
 process.env.APP_URL='http://localhost:3068';delete process.env.VERCEL;
 assert.equal(allowedOrigin(request('http://127.0.0.1:3068/api/auth/register','http://127.0.0.1:3068')),true);
 assert.equal(allowedOrigin(request('http://localhost:3068/api/auth/register','http://127.0.0.1:3068')),true);
 assert.equal(allowedOrigin(request('http://localhost:3068/api/auth/register','https://evil.example')),false);
 assert.equal(allowedOrigin(request('http://localhost:3068/api/auth/register','null')),false);
});
test('Vercel accepts deployment-owned origins and ignores arbitrary Host headers',()=>{
 process.env.VERCEL='1';process.env.APP_URL='http://localhost:3068';
 process.env.VERCEL_PROJECT_PRODUCTION_URL='hifidiesnatalis68-kasundaan.vercel.app';process.env.VERCEL_URL='hifidiesnatalis68-preview-a1.vercel.app';
 assert.equal(allowedOrigin(request('https://internal.invalid/api/auth/register','https://hifidiesnatalis68-kasundaan.vercel.app')),true);
 assert.equal(allowedOrigin(request('https://internal.invalid/api/auth/register','https://hifidiesnatalis68-preview-a1.vercel.app')),true);
 assert.equal(allowedOrigin(request('https://evil.example/api/auth/register','https://evil.example')),false);
 assert.equal(allowedOrigin(request('http://127.0.0.1:3068/api/auth/register','http://127.0.0.1:3068')),false);
 assert.equal(allowedOrigin(request('https://internal.invalid/api/auth/register','http://localhost:3068')),false);
 assert.equal(cookieOptions().secure,true);
 delete process.env.VERCEL;delete process.env.VERCEL_URL;delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
});
