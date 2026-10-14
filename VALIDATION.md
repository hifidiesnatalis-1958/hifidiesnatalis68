# Pemeriksaan · 11 Oktober 2026

Revisi autentikasi menggunakan register/login dengan nickname dan password pilihan pengguna, mengikuti pola web KKN. Nickname tidak ditentukan aplikasi: spasi, Unicode, simbol, dan kapitalisasi didukung. Nickname unik setelah normalisasi; login tidak membedakan huruf besar-kecil. Google OAuth telah dihapus.

## Tes otomatis

- 17 tes Node/backend lulus: hashing scrypt dan salt unik, verifikasi password, sesi dan masa berlaku, penolakan sesi lama/hasil edit, password tidak masuk cookie atau respons publik, register/login custom, duplikasi nickname, password salah, batas percobaan, hak operator, undian, anonimitas, filter kata kasar, formula Sheet, dan setup spreadsheet yang sudah ada.
- 17 kasus browser Chrome sudah diperiksa. Pada run pertama, 15 lulus dan dua pemeriksaan pesan error gagal karena locator juga memilih announcer internal Next.js. Locator dibatasi ke form; kedua tes tersebut diulang dan lulus. Tidak ada perubahan produk untuk perbaikan locator.
- Form register/login diuji pada 1440/390/320 px; halaman acara juga pada 1440/768/390/320 px. Tes mencakup nickname custom, password confirmation, password visibility/autocomplete, error inline, pemeriksaan cookie, kembali ke undian setelah login, akses API, logout, dan presentasi operator.
- `npm.cmd run build` berhasil. Route `/masuk`, POST `/api/auth/register`, POST `/api/auth/login`, logout, sesi, dan fitur acara tersedia. Callback dan dependency Google OAuth dihapus.

Tes backend memakai kode `app.gs` melalui adapter Sheets dalam memori. Tes browser memakai fixture hanya dalam pengujian dan secret sesi uji pada port 3069; tidak membuat akun, tiket atau menfess di spreadsheet pengguna.

## Preview dan deployment nyata

Preview http://localhost:3068/masuk?mode=daftar diperiksa melalui Chrome. Input nickname awal kosong, tidak ada overflow pada 1440/390 px, tidak ada page error, font lokal serta aset asli Figma dimuat. Screenshot disimpan di folder kerja `.work/hifi68/previews`.

API sesi lokal melaporkan `authMode:nickname-password`, `loginReady:true`, dan tidak ada pengguna login pada browser baru. GET route login mengarah ke `/masuk`; registrasi dengan nickname tidak valid ditolak HTTP 400 dan pengambilan tiket tanpa login ditolak HTTP 401.

Setelah pengguna memperbarui Apps Script dan menjalankan setup, pemeriksaan read-only `node scripts/check-backend.mjs` berhasil pada deployment nyata: health HTTP 200 dengan autentikasi `nickname-password`, serta `content.get`, `menfess.list`, `messages.list`, `raffle.status` dan `auth.status` seluruhnya berhasil. Tabel Accounts tersedia. URL deployment dan shared secret yang sudah bekerja dipertahankan.

Akun operator **admin123** telah dibuat di deployment nyata dengan nickname dan password pilihan pengguna. Password di-hash menggunakan scrypt sebelum disimpan di Accounts; kredensial lokal tersedia di `.env.admin.local` yang diabaikan Git. Nilai password tidak dicetak dalam log pengujian atau dokumentasi.

Login nyata melalui form Chrome berhasil HTTP 200 dan membuka panel `/admin`. Cookie sesi tersimpan, peran admin terbaca, `/api/admin` dan `/api/presentation` sama-sama merespons HTTP 200, dan halaman presentasi terbuka tanpa page error. Logout berhasil HTTP 200 dan menghapus sesi browser uji. Pengujian operator tidak mengubah konten, moderasi, status pendaftaran atau hasil undian.

Pendaftaran publik selalu membuat akun biasa, termasuk bila nickname yang dipilih menyerupai nama panitia. Apps Script mengambil hak akses dari peran yang tersimpan di Accounts. Script lokal `create-admin.mjs` dapat menerima password operator pilihan pengguna melalui stdin; password acak tetap tersedia bila password tidak ditentukan. Kredensial dipertahankan bila jaringan timeout agar password akun yang mungkin sudah tersimpan tidak hilang.

Deployment Vercel belum diaktifkan. Lokasi acara, dress code, dan rincian tambahan masih berstatus menyusul sesuai arahan pengguna.


# Verifikasi overhaul Kasundaan ? 14 Oktober 2026

Proyek: S:\Code\hifidiesnatalis68
Preview produksi lokal: http://localhost:3068

- Build produksi Next.js 16.4.0 berhasil setelah perubahan terakhir.
- 17 pengujian backend dan autentikasi lulus: nickname bebas, hash password, session, HMAC, izin operator, moderasi anonim, filter kata dan undian.
- 21 kasus browser diuji. Sepuluh kasus autentikasi/presentasi lulus; sebelas kasus website/interaksi lulus pada verifikasi akhir setelah fokus dialog diperbaiki.
- Layout tidak melampaui viewport pada 1440, 768, 390 dan 320 px.
- Poster dapat dibuka, diunduh, ditutup dengan Escape, dan mengembalikan fokus ke tombol pembuka.
- Tiga tampilan filosofi logo, empat produk, menfess anonim, wajib login undian dan penghapusan tiket dari UI setelah logout diverifikasi.
- Screenshot final memeriksa hero, halaman login, mode presentasi dan foto merchandise. Foto merchandise juga diverifikasi pada viewport setelah image.decode(), bukan hanya melalui screenshot halaman panjang.
- Aset dan font tersedia lokal. Tidak ada dependency baru, perubahan deployment Apps Script atau perubahan secret.

Berkas preview: test-results/previews/. Source dan file awal dicadangkan di folder hifi68-overhaul/backup pada workspace Machine Learning.
