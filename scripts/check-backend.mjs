import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {backend,backendReady} from '../lib/backend.js';

const require=createRequire(import.meta.url);
require('@next/env').loadEnvConfig(fileURLToPath(new URL('../',import.meta.url)),true);
const url=process.env.APPS_SCRIPT_URL;
const validUrl=Boolean(url && /^https:\/\/script\.google\.com\/macros\/s\/[^/?#]+\/exec$/.test(url));
console.log(`URL Web app: ${validUrl ? 'siap' : 'belum diisi atau format keliru'}`);
console.log(`Shared secret: ${process.env.APPS_SCRIPT_SECRET?.length>=32 ? 'terisi' : 'belum diisi (minimal 32 karakter)'}`);
console.log(`Sesi akun: ${process.env.SESSION_SECRET?.length>=32 ? 'siap; nickname dan password dipilih pengguna' : 'SESSION_SECRET belum diisi (minimal 32 karakter)'}`);
if(!validUrl) {process.exitCode=1;}
else {
  try {
    const response=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(20000)});
    const result=await response.json();
    if(!response.ok || result.ok!==true || result.service!=='HIFI Dies Natalis 68') throw new Error('Respons tidak sesuai backend HIFI.');
    console.log(`Health Apps Script: HTTP ${response.status}, HIFI Dies Natalis 68`);
    if(result.auth==='nickname-password') console.log('Backend akun: register/login nickname dan password tersedia');
    else {console.log('Backend akun: deployment masih versi lama. Salin app.gs terbaru, jalankan setupDiesnat(), lalu Deploy → Manage deployments → Edit → New version → Deploy. URL /exec tetap sama.');process.exitCode=1;}
  } catch {console.log('Health Apps Script: gagal. Periksa deployment Web app, akses Anyone dan koneksi internet.');process.exitCode=1;}
  if(!backendReady()) {console.log('Tes data spreadsheet menunggu APPS_SCRIPT_SECRET yang sama persis dengan SHARED_SECRET di Apps Script.');process.exitCode=1;}
  else {
    // Read-only checks use the actual server bridge and HMAC; no demo account or data writes.
    for(const action of ['content.get','menfess.list','messages.list','raffle.status','auth.status']) {
      try {await backend(action);console.log(`${action}: berhasil`);}
      catch(error) {console.log(`${action}: ${error.code || 'ERROR'} — ${error.message}`);process.exitCode=1;break;}
    }
  }
}
