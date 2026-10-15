import {appOrigin} from './session.js';

export function allowedOrigin(request) {
  const origin=request.headers.get('origin');
  if(!origin || origin==='null') return false;
  const configured=appOrigin(),allowed=new Set();
  if(process.env.VERCEL!=='1' || configured.startsWith('https://')) allowed.add(configured);
  // These values are deployment-owned, never taken from forwarded/Host headers.
  if(process.env.VERCEL==='1') {
    for(const key of ['VERCEL_URL','VERCEL_PROJECT_PRODUCTION_URL']) {
      const host=process.env[key];
      if(host && /^[a-z\d-]+\.vercel\.app$/i.test(host)) allowed.add(`https://${host}`);
    }
  } else {
    const url=new URL(request.url);
    if(url.protocol==='http:' && ['localhost','127.0.0.1'].includes(url.hostname) && ['3068','3069'].includes(url.port)) {
      allowed.add(`http://localhost:${url.port}`);allowed.add(`http://127.0.0.1:${url.port}`);
    }
  }
  return allowed.has(origin);
}
