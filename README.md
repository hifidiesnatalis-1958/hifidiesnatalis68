# Dies Natalis HIFI ke-68 · Kasundaan

React JSX / Next.js + Vercel, Google Apps Script + Google Sheets. Proyek berada di `S:\Code\hifidiesnatalis68`.

Pengguna membuat **nickname sendiri dan password** untuk register dan login, mengikuti pola web KKN. Nickname mendukung spasi, simbol, Unicode, dan kapitalisasi pilihan pengguna; pencarian akun tidak membedakan huruf besar-kecil. Tidak membutuhkan email atau Google OAuth.

## Menjalankan

```powershell
npm.cmd install
if (-not (Test-Path -LiteralPath .env.local)) { Copy-Item .env.example .env.local }
npm.cmd run dev
```

Buka http://localhost:3068; register dan login ada di `/masuk`. URL Apps Script, shared secret dan secret sesi lokal sudah terpasang. Pertahankan nilai tersebut.

## Mengaktifkan revisi akun pada Apps Script

1. Salin seluruh isi `apps-script/app.gs` terbaru ke editor Apps Script pada [spreadsheet Dies Natalis 68](https://docs.google.com/spreadsheets/d/1p4-ieKHatSnqblBdOP219ohSOD5jWhK-Xg3z1mWhoMA/edit). Simpan.
2. Jalankan `setupDiesnat()` sekali untuk menambahkan tab **Accounts**. Tab serta data lama dipertahankan.
3. **Deploy → Manage deployments → Edit** (ikon pensil) → pilih **New version → Deploy**. Pertahankan deployment Web app yang sama: **Execute as: Me**, **Who has access: Anyone**. URL `/exec` tetap sama.
4. Jalankan `node scripts/check-backend.mjs`. Pemeriksaan read-only harus menampilkan backend nickname/password dan keberhasilan `auth.status` selain data acara, menfess, pesan-kesan, dan undian.

Script Properties yang dibutuhkan tetap `SHARED_SECRET` dan `SPREADSHEET_ID`. `ADMIN_EMAILS` lama tidak dipakai; tidak perlu mengubah secret. Deployment lama belum menyediakan register/login meskipun data acara masih bisa dibaca.

Tab aplikasi: **Accounts**, Users (data autentikasi lama dipertahankan), Menfess, Likes, Messages, Tickets, Draws, Settings. Jangan mengubah header. Accounts menyimpan hash password, bukan password asli. Kolom nickname disimpan sebagai string JSON agar simbol dan teks menyerupai rumus tetap literal.

Untuk instalasi baru, pasang `apps-script/appsscript.json` melalui editor manifest. Spreadsheet default adalah `1p4-ieKHatSnqblBdOP219ohSOD5jWhK-Xg3z1mWhoMA`; Script Property dapat mengarahkannya ke spreadsheet lain milik panitia.

## Akun operator / panitia

Pendaftaran publik selalu membuat akun biasa. Nama apa pun yang dipilih tidak memberikan hak panitia. Buat akun operator dari komputer pemilik proyek dengan nickname pilihan sendiri:

```powershell
node scripts/create-admin.mjs "Nickname operator pilihan Anda"
```

Jalankan setelah Apps Script diperbarui. Script membuat password acak dan menyimpan nickname serta password di **`.env.admin.local`**, yang diabaikan Git. Buka file tersebut untuk memperoleh kredensial, lalu masuk lewat `/masuk`. Tidak ada endpoint publik untuk mengangkat akun menjadi admin. Nickname yang sudah digunakan tidak diambil alih; pilih nickname operator lain. File kredensial lama tidak ditimpa.

Untuk password operator pilihan sendiri, gunakan opsi `--stdin-password` dan berikan password lewat stdin (8–128 karakter). Password tidak perlu dijadikan argumen command line. Akun operator proyek ini sudah dibuat sesuai pilihan pengguna; hasil login nyata tercatat di `VALIDATION.md`.

Panel `/admin` mengelola persetujuan pesan, rangkaian acara, tema/logo, dress code, lokasi/peta, kontak, pendaftaran undian, dan pengundian. Tutup pendaftaran sebelum mengundi. Setiap akun mendapat satu tiket dan hanya dapat menang sekali. Hasil tersimpan di Sheets.

## Presentasi menfess

Operator dapat membuka `/presentasi` dari panel. Hanya pesan yang sudah disetujui dan lolos filter yang ditampilkan, selalu sebagai **Baraya anonim**. Pesan diacak, tampil sekali per putaran, dapat dinavigasi manual atau otomatis, dan mendukung layar penuh. Tombol pintas: panah kiri/kanan, spasi, F, dan H. Durasi otomatis 8/12/20/30 detik, berhenti pada pesan terakhir.

Menfess selalu anonim, termasuk panel panitia; tabelnya memakai pseudonim HMAC akun. Pesan-kesan dapat menampilkan nickname bila pengguna memilihnya. Filter kata kasar, variasi penulisan, dan sebagian ancaman dijalankan di server saat pengiriman, persetujuan, dan penayangan. Tambahan filter dapat diisi sebagai `MENFESS_BLOCKED_WORDS` di Script Properties, dipisahkan koma. Moderasi manual tetap tersedia.

## Vercel

Import folder proyek atau repository sebagai **Next.js**, Node **22+**, install `npm ci`, build `npm run build`. Pasang variabel dari `.env.example`:

- `APP_URL`: origin HTTPS domain Vercel yang dipakai.
- `SESSION_SECRET`: nilai acak minimal 32 karakter untuk cookie sesi.
- `APPS_SCRIPT_URL`: URL deployment Web app `/exec`.
- `APPS_SCRIPT_SECRET`: sama persis dengan `SHARED_SECRET` Apps Script.

Redeploy Vercel setelah mengubah konfigurasi. Google Client ID, Client Secret, OAuth consent screen, dan redirect URI tidak diperlukan.

## Penyimpanan dan akses

Password di-hash di server Node dengan scrypt, salt acak per akun, parameter N=32768, r=8, p=3, dan perbandingan waktu tetap; mengikuti [rekomendasi scrypt OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#scrypt). Password asli tidak dikirim ke Apps Script atau disimpan di Sheets. Hash hanya dibaca melalui bridge server yang ditandatangani, tidak dikembalikan ke browser.

Cookie sesi HttpOnly, SameSite=Lax, Secure pada HTTPS, berlaku 12 jam. Sesi login Google versi lama tidak diterima. Mutasi memeriksa Origin. Apps Script memeriksa HMAC, timestamp dan nonce serta memakai LockService untuk mencegah duplikasi nickname/tiket. Percobaan login dibatasi per nickname dan IP memakai CacheService; batas per nickname dihapus setelah login berhasil.

## Pemeriksaan

```powershell
npm.cmd test
npm.cmd run test:ui
npm.cmd run build
node scripts/check-backend.mjs
```

Tes otomatis memakai adapter Apps Script/Sheets dan browser dengan fixture khusus pengujian; tidak membuat akun atau pesan di spreadsheet pengguna. Pemeriksaan terakhir membaca deployment nyata tanpa mencetak secret atau menulis data. Hasil terbaru ada di `VALIDATION.md`.

Acara utama berlangsung pada 24 Oktober 2026 pukul 09.00 WIB di Auditorium Bale Santika, Universitas Padjadjaran. Dress code: Tradisional Sunda (Kebaya, Pangsi, Batik Sunda). Rincian rundown tambahan menunggu pengumuman panitia. Kontak Zahra Nova Carolyn dan tautan Discord Dress to Impress sudah disertakan. Desain menggunakan logo, batik, dan ornamen asli Figma DISNAT serta font lokal Libre Baskerville dan Montserrat.


## Overhaul Kasundaan ? 14 Oktober 2026

Website memakai identitas Canva terbaru: logo 68 dan atom, wordmark, motif batik, ornamen sudut, poster, dan produk merchandise. Poster bisa diperbesar/diunduh; makna logo memiliki tiga tampilan; katalog cindra mata tersedia. Form, nickname/password, menfess anonim, undian dan presentasi panitia memakai backend yang sama.

Aset dan sumbernya tercatat di ASSETS.md serta public/assets/kasundaan/manifest.json. Desain dan token terbaru ada di DESIGN.md dan design-dna.json. Preview lokal dapat dibuka di http://localhost:3068.


## Gangguan koneksi Google

Jika login menampilkan pesan layanan tidak terjangkau, jalankan `node scripts/check-backend.mjs`. Koneksi dapat gagal sebelum mencapai Apps Script meskipun URL, secret dan password benar. Bridge mencoba ulang sekali hanya ketika koneksi belum terbentuk (`UND_ERR_CONNECT_TIMEOUT`), dengan total batas 30 detik per aksi.

Respons [Apps Script ContentService](https://developers.google.com/apps-script/guides/content#redirects) diarahkan ke URL GET di `script.googleusercontent.com`. Bridge menangani tahap ini terpisah: kegagalan koneksi saat mengambil respons tidak mengulang POST yang mungkin sudah menyimpan akun, pesan atau hasil undian. Putusnya socket setelah pengiriman dan penolakan autentikasi tidak dicoba ulang. Semua batas login dan pemeriksaan HMAC tetap aktif. Route login/register menyediakan batas eksekusi 90 detik untuk dua aksi backend dan hashing password.

Perbaikan koneksi ini cukup diterapkan pada website; `apps-script/app.gs` dan deployment Google tetap sama.
