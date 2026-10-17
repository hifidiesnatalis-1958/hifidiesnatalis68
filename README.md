# Dies Natalis HIFI ke-68 · Kasundaan

Next.js/React JSX di Vercel dengan Google Apps Script dan Google Sheets. Proyek: `S:\Code\hifidiesnatalis68`.

## Akun peserta

Daftar dengan **nama lengkap, NPM, password pilihan sendiri, dan konfirmasi password**. Masuk dengan **NPM dan password**. Nama tampil pada akun dan tiket; Harewos tetap anonim. Tidak ada token login yang diterbitkan atau perlu disalin.

NPM: `140310` + dua digit angkatan `00`–`25` + `00` + dua digit nomor `01`–`99`. Angkatan 26 belum dapat mendaftar. **Satu NPM = satu akun = satu tiket undian**; kesamaan nama tidak membatasi orang lain. Pemeriksaan ini memvalidasi format, bukan kepemilikan terhadap daftar mahasiswa universitas.

Nama 2–100 karakter; password baru 10–128 karakter. Password di-hash menggunakan scrypt dengan salt acak sebelum dikirim ke Google; password asli tidak disimpan di Sheets atau cookie. Nama diteruskan dari data akun yang tersimpan, bukan dari input login. Cookie peserta berlaku 30 hari, cookie operator 12 jam; HttpOnly; di Vercel/HTTPS memakai Secure, SameSite=None, dan Partitioned agar tetap tersimpan saat situs dibuka lewat iframe di hifi.fmipa.unpad.ac.id. Lokal (HTTP) memakai SameSite=Lax.

## Wajib memperbarui Apps Script untuk kolom nama

Revisi ini memerlukan `apps-script/app.gs` **versi 3** agar nama tersimpan terpisah dari NPM.

1. Salin seluruh `apps-script/app.gs` ke editor Apps Script yang terhubung dengan spreadsheet acara, lalu simpan.
2. Jalankan `setupDiesnat()`. Migrasi menambahkan header `name` pada kolom G tab Accounts; enam kolom lama, data, dan akun operator dipertahankan. Jangan mengubah header secara manual.
3. Deploy → Manage deployments → Edit → New version → Deploy. Pertahankan **Execute as Me**, **Who has access: Anyone**, URL `/exec`, dan nilai secret yang sama.
4. Jalankan `node scripts/check-backend.mjs`. Health harus melaporkan `npm-password`, versi 3, dan `auth.status` harus menyatakan kolom nama siap.

Pendaftaran ditahan bila deployment Google belum mendukung nama, supaya akun tidak tersimpan tanpa nama. Kolom `nickname` tetap menyimpan NPM sebagai identitas unik, sedangkan kolom `name` menyimpan nama. Kedua kolom memakai string JSON agar teks tetap literal di Sheets. Akun lama tidak dihapus atau diubah password-nya oleh migrasi.

Script Properties: `SHARED_SECRET` minimal 32 karakter dan `SPREADSHEET_ID`. Secret sama dengan `APPS_SCRIPT_SECRET` di Vercel. Tab Accounts, Users, Menfess, Likes, Messages, Tickets, Draws, Settings tetap dipakai. Instalasi baru juga menggunakan `apps-script/appsscript.json`.

## Lokal dan Vercel

```powershell
npm.cmd install
if (-not (Test-Path -LiteralPath .env.local)) { Copy-Item .env.example .env.local }
npm.cmd run dev
```

Buka http://localhost:3068. `/masuk` menyediakan masuk peserta, daftar, dan jalur Panitia. Environment yang sudah bekerja tetap dipakai:

- `APP_URL`: origin situs. Production: `https://hifidiesnatalis68-kasundaan.vercel.app`.
- `SESSION_SECRET`: secret sesi minimal 32 karakter.
- `APPS_SCRIPT_URL`: URL Web app Google `/exec`.
- `APPS_SCRIPT_SECRET`: sama persis dengan SHARED_SECRET.

Vercel: Next.js, Node 22+, install `npm ci`, build `npm run build`. Redeploy setelah kode/environment berubah. Origin diverifikasi terhadap APP_URL dan domain deployment Vercel resmi; Host atau forwarded header sembarang tidak dipercaya. Localhost dan 127.0.0.1 diterima pada port proyek 3068/3069.

Situs dipasang sebagai iframe di `https://hifi.fmipa.unpad.ac.id/dies-natalis-68/`. Cookie sesi Partitioned (CHIPS) membuat login tetap tersimpan di dalam iframe, termasuk saat cookie pihak ketiga diblokir. Permintaan POST tetap dijaga pemeriksaan Origin dan wajib `application/json`, sehingga SameSite=None tidak membuka celah CSRF. Bila browser lama belum mendukung Partitioned, buka situs langsung di tab baru untuk masuk.

## Panitia, Harewos, dan undian

Masuk lewat `/masuk?mode=panitia`. Kredensial operator lama tersedia di `.env.admin.local`, yang diabaikan Git. Hak operator tidak diberikan oleh pendaftaran publik. Operator tambahan dibuat melalui `node scripts/create-admin.mjs "Nickname operator"`; opsi `--stdin-password` menerima password melalui stdin. Nilai password tidak perlu dikirim lewat chat atau argumen command line.

Panel `/admin` mengelola informasi acara, moderasi, dan undian. Pendaftaran undian dibuka/ditutup panitia. Setiap akun mendapat satu tiket dan hanya dapat menang sekali. Raffle ticket memakai nama akun, bukan NPM lengkap.

`/presentasi` menampilkan Harewos yang disetujui dan lolos filter dalam urutan acak, dengan autoplay dan layar penuh. Pintasan: panah kiri/kanan, spasi, F, H. Hanya operator yang dapat mengaksesnya. Harewos memakai pseudonim HMAC dan tidak menampilkan nama/NPM pengirim, termasuk dalam moderasi. Filter kata kasar melengkapi pemeriksaan panitia. Tambahan kata: MENFESS_BLOCKED_WORDS di Script Properties.

## Panggung morphing

Seluruh bagian berada pada **satu panggung wayang layar penuh**. Aset asli tetap terpasang dan berpindah dengan perspektif CSS 3D. Logo native pada header selalu terlihat; logo pembuka berdiri terpisah dan memudar bersama bagian pembuka. Kedua logo tidak berputar. Arjuna dan Semar tampil utuh pada sayap samping desktop atau ruang khusus di bawah konten pada ponsel. Posisi keduanya berubah per bagian, dengan ayunan CSS kecil hanya pada gambar wayang. Gunungan menyapu celah pergantian bab. Konten berpindah melalui clip bertepi fade lembut, sedangkan tepi panggung, batik, dan sisi panel yang masih memiliki konten di luar area scroll diberi fade. Objek menetap di luar area baca; hitung mundur memiliki latar opak. Form tetap terpasang agar isinya tidak hilang. Dialog poster menghentikan perpindahan sementara dan melanjutkannya saat ditutup. Reduced motion menampilkan dokumen biasa secara lengkap dan mematikan ayunan wayang.

Semua gambar memakai aset asli Figma/PDF; lima panel filosofi dan poster sumber tetap tersedia. `log.md`, fakta acara yang disetujui, nama resmi kegiatan, serta tautan dipertahankan. Tidak ada ilustrasi AI atau dependency animasi baru.

Bahasa antarmuka menggunakan bahasa Indonesia yang alami. Bahasa Sunda dibatasi pada sapaan umum singkat "Wilujeng sumping" dan "Hatur nuhun". Nama Harewos, tema Kasundaan, nama resmi kegiatan, teks pada aset asli, dan kiriman pengguna dipertahankan. Kamus resmi dan tata bahasa (1.189 halaman) ada di `kamus-basa-sunda/`, dikecualikan dari Git/Vercel; skill global `natural-sundanese` tersedia sebagai rujukan, bukan alasan untuk menerjemahkan seluruh antarmuka.

## Pemeriksaan

```powershell
npm.cmd test
npm.cmd run test:ui
npm.cmd run build
node scripts/check-backend.mjs
```

Tes memakai Apps Script dalam memori dan fixture browser; tidak membuat NPM, pesan, atau tiket produksi. Bridge mempertahankan HMAC, timestamp, nonce, lock dan pembatas percobaan. Koneksi yang gagal sebelum POST terkirim dapat dicoba ulang; POST yang mungkin sudah tersimpan tidak dikirim ulang ketika responsnya gagal diambil.

Acara utama: 24 Oktober 2026, 09.00 WIB, Auditorium Bale Santika, Universitas Padjadjaran, Jatinangor. Busana: Tradisional Sunda (Kebaya, Pangsi, Batik Sunda). Kegiatan online 17 Oktober. Isi resmi tetap mengikuti data panitia.

## Presentasi undian

Buka `/admin`, lalu **Undian → Buka presentasi undian**, atau kunjungi `/presentasi/undian` setelah masuk sebagai panitia. Isi hadiah, tutup pendaftaran, lalu pilih **Undi pemenang**. Tombol **Layar penuh** dan **Sembunyikan kontrol** menyiapkan layar proyektor; pintasan F dan H tersedia. Riwayat pemenang dapat ditayangkan kembali tanpa mengundi ulang.

Pemenang dipilih dan disimpan melalui endpoint undian yang sudah ada. Animasi nomor hanya tampilan. Jika koneksi gagal, gunakan **Muat ulang** untuk memeriksa hasil tersimpan sebelum mengundi kembali. Fitur ini tidak memerlukan perubahan atau deployment ulang `apps-script/app.gs`.

## Arsip berkas kerja

Berkas kerja web yang sebelumnya berada di folder Mata Kuliah Machine Learning telah dipindahkan ke `S:\Code\hifidiesnatalis68-workspace\archive-2026-10-17`. Arsip memuat 737 berkas beserta `manifest.json` untuk pemeriksaan SHA-256. Proyek aktif tetap di `S:\Code\hifidiesnatalis68`; berkas tugas kuliah dan aset media nonweb tidak dipindahkan.
