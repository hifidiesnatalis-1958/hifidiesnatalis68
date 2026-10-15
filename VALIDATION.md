# Verifikasi 15 Oktober 2026 — nama/password dan panggung penuh

Proyek: `S:\Code\hifidiesnatalis68`. Preview produksi lokal: http://localhost:3068.

## Hasil

- **28/28 tes Node/backend lulus** (`npm.cmd test`).
- **30/30 tes Chrome lulus** pada satu run lengkap (`npm.cmd run test:ui`).
- **Build produksi Next.js 16.4.0 berhasil** (`npm.cmd run build`).
- Pemeriksaan visual tambahan mencakup form daftar produksi pada 1440/390 px dan panggung pada 1440/768/390/320 px.

Tes memakai kode Apps Script asli melalui adapter Sheets dalam memori dan fixture browser. Tidak ada NPM peserta, pesan, tiket atau hasil undian produksi yang dibuat oleh pemeriksaan ini.

## Autentikasi

Daftar memerlukan nama, NPM, password pilihan sendiri, dan konfirmasi password. Masuk memakai NPM/password. Nama dinormalisasi, divalidasi dan disimpan terpisah; password di-hash memakai scrypt dengan salt acak. Nama yang dikirim saat login tidak dapat mengganti nama tersimpan. Respons dan cookie tidak memuat password atau hash. Token login dan endpoint pemulihannya sudah dihapus.

Duplikasi NPM ditolak; dua NPM berbeda boleh memiliki nama sama. Angkatan 26, kode prodi lain, format salah, dan nomor urut nol ditolak server. Satu akun tetap mendapat satu tiket. Nama muncul pada tiket, sedangkan Harewos tidak mengungkap nama atau NPM. Hak operator dan password operator lama tetap berlaku.

Migrasi Accounts diuji pada data enam kolom: hanya header `name` pada kolom G yang ditambahkan, dengan nilai akun lama tetap identik. Menjalankan setup dua kali tidak menggandakan atau menghapus data. Header yang tidak sesuai ditolak. Register ditahan bila deployment Google belum mendukung penyimpanan nama, sehingga nama tidak hilang diam-diam.

## Panggung dan interaksi

Sepuluh bagian menempati satu panggung viewport. Posisi panggung tetap sama ketika bagian diganti, dengan toleransi subpiksel di bawah 1 px. Bentuk permukaan berubah dan kembali sesuai posisi scroll. Header tetap berada di atas adegan; bagian lain inert ketika tidak aktif. Form tetap menyimpan isinya setelah berpindah bagian dan kembali.

Navigasi tombol menetapkan posisi tujuan langsung lalu menganimasikan visualnya; ini menghindari gerakan scroll dokumen yang berbenturan dengan klik pengguna. Filter, logout, deep link, perubahan ukuran layar, dan browser history tetap bekerja. Scroll anchoring dinonaktifkan pada panggung agar perubahan isi tidak mengembalikan pengguna ke Beranda.

Poster asli dapat dibuka, diunduh, ditutup lewat Escape, dan mengembalikan fokus serta posisi ke tombol pembuka. Kelima panel filosofi memakai poster sumber yang sesuai dan mendukung navigasi keyboard. Reduced motion menampilkan dokumen lengkap; perubahan preferensi ketika halaman terbuka tidak menyisakan bagian tersembunyi.

Presentasi operator, moderasi anonim, filter kata, undian wajib login, satu tiket per akun, dan pembersihan tiket dari UI setelah logout tetap diperiksa. Koreksi akhir pada hitung mundur ponsel diperiksa ulang pada 390 dan 320 px.

## Integritas konten

`log.md`, `content/site.json`, `components/Presentation.jsx`, `components/CultureHero.jsx`, `next.config.mjs`, dan `vercel.json` tetap cocok dengan hash sebelum koreksi ini. Tidak ada ilustrasi AI, penggantian aset sumber, atau dependency animasi baru. Kamus dan secret lokal tetap dikecualikan dari Git/deployment.

## Status Google dan publikasi

Setelah pengguna memperbarui deployment, pemeriksaan read-only pada 15 Oktober 2026 berhasil menjangkau Google dengan HTTP 200, **versi 3**, mode `npm-password`, dan `auth.status.accountNames:true`. Kelima aksi bertanda tangan HMAC (`content.get`, `menfess.list`, `messages.list`, `raffle.status`, `auth.status`) berhasil. URL dan secret yang tersimpan cocok; kolom nama siap dipakai. Tidak ada akun, pesan, tiket, atau hasil undian produksi yang dibuat selama pemeriksaan koneksi ini.

Hasil lokal di atas tidak berarti situs Vercel sudah diperbarui. Revisi belum dipush atau dipublikasikan dari sesi ini.
