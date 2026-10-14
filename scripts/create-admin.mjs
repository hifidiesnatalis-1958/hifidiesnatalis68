import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {existsSync,readFileSync,writeFileSync,unlinkSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import {backend} from '../lib/backend.js';
import {hashPassword,normalizeNickname,validNickname} from '../lib/password.js';
const root=fileURLToPath(new URL('../',import.meta.url));
createRequire(import.meta.url)('@next/env').loadEnvConfig(root,true);
const nickname=normalizeNickname(process.argv[2]);
const credentials=fileURLToPath(new URL('../.env.admin.local',import.meta.url));
if(!validNickname(nickname)) {console.error('Isi nickname operator pilihan Anda: node scripts/create-admin.mjs "Nickname bebas"');process.exitCode=1;}
else if(existsSync(credentials)) {console.error('File .env.admin.local sudah tersedia. Akun dan kredensial lama tidak diubah.');process.exitCode=1;}
else {
  const password=process.argv.includes('--stdin-password') ? readFileSync(0,'utf8').replace(/\r?\n$/,'') : randomBytes(18).toString('base64url');
  if(password.length<8 || password.length>128) {console.error('Password operator harus 8–128 karakter.');process.exit(1);}
  const passwordHash=await hashPassword(password);
  writeFileSync(credentials,`NICKNAME=${JSON.stringify(nickname)}\nPASSWORD=${password}\n`,{flag:'wx',mode:0o600});
  try {
    await backend('auth.createAdmin',null,{nickname,passwordHash});
    console.log('Akun panitia dibuat. Nickname dan password tersedia di .env.admin.local; file ini diabaikan Git.');
  } catch(error) {
    // A timeout may happen after Sheets saved the account. Preserve its password in that case.
    if(['CONFLICT','INVALID_REQUEST','UNAUTHORIZED','FORBIDDEN','SETUP_REQUIRED'].includes(error.code)) unlinkSync(credentials);
    else console.error('Kredensial tetap tersimpan di .env.admin.local. Periksa login sebelum mengulang pembuatan akun.');
    console.error(error.message==='Aksi tidak dikenal.' ? 'Perbarui app.gs, jalankan setupDiesnat(), lalu deploy versi baru terlebih dahulu.' : error.message);
    process.exitCode=1;
  }
}
