# Verifikasi 15 Oktober 2026: panggung wayang dan bahasa antarmuka

Proyek: `S:\Code\hifidiesnatalis68`. Preview produksi lokal: http://localhost:3068.



## Revisi catatan, logo, dan scrollbar: lulus

Catatan dekoratif, nasihat pada badge, label berulang, dan slogan tambahan dihapus dari bagian publik dan akun. Petunjuk operasional, status kiriman/pendaftaran, persetujuan, informasi resmi, serta akses poster dipertahankan. Panel Warna dan footer memakai logo acara lengkap `logo-68.webp`; ilustrasi atom `logo-physics.webp` adalah stiker merchandise. Scrollbar dalam bagian disembunyikan untuk Firefox/WebKit; guliran native dan fade tepi tetap berfungsi.

Sebanyak **28 tes backend dan 28 kasus browser terarah lulus**, termasuk enam ukuran layar, lima panel sumber, guliran roda mouse tanpa scrollbar, akun, dialog dan retensi isian. Build produksi berhasil. Smoke produksi memverifikasi logo panel Warna, ketiadaan badge dekoratif/stiker sebagai logo, nol overflow ponsel, serta nol galat JavaScript/chunk. Preview lokal aktif di port 3068. Perubahan belum dipush ke Vercel.

## Revisi bahasa Indonesia: lulus

Seluruh teks antarmuka utama, akun, presentasi, panel panitia, dan metadata menggunakan bahasa Indonesia. Bahasa Sunda dibatasi pada sapaan umum "Wilujeng sumping" dan "Hatur nuhun". Nama Harewos, tema Kasundaan, nama resmi kegiatan, aset sumber, serta isi kiriman pengguna dipertahankan. Label anonim tampil sebagai "Pengirim anonim" tanpa memerlukan perubahan Apps Script.

Sebanyak **28 tes Node/backend dan 40 kasus browser lulus**. Satu pemilih status tes diperjelas agar mengarah ke formulir; delapan kasus terkait dijalankan ulang dan lulus. Enam ukuran layar, autentikasi, presentasi, anonimitas, dan keutuhan isi kiriman diperiksa. Build produksi berhasil. Smoke produksi mengonfirmasi deskripsi Indonesia dari API, formulir kata sandi, animasi, delapan objek, nol overflow pada 320 x 667, dan nol galat JavaScript/chunk. Preview lokal aktif di port 3068. Perubahan belum dipush ke Vercel.

## Revisi batas frame dan contoh NPM: lulus

Implementasi terbaru memisahkan logo header yang selalu terlihat dari logo pembuka; kedua logo tetap tegak. Arjuna/Semar berada utuh pada sayap samping desktop atau rak bawah khusus pada ponsel, dengan posisi per bagian dan ayunan CSS kecil pada gambar saja. Tepi panggung dan batik diberi feather; panel panjang memberi fade hanya pada sisi yang masih memiliki konten di luar area scroll. Linimasa memakai tanggal di tengah dan ringkasan bergantian pada desktop, serta tanggal di kiri pada ponsel. Placeholder dan pesan kesalahan NPM tidak lagi memakai nomor pribadi.

Sebanyak **28/28 tes Node/backend dan 24 pemeriksaan browser** lulus: 13 immersive pada enam ukuran layar, empat linimasa, serta tujuh akun. Build produksi Next.js berhasil. Smoke produksi memverifikasi delapan objek, ayunan aktif, dua logo terpisah, cover 320 x 667 tanpa overflow, mode akun npm-password, navigasi, dan nol galat JavaScript/chunk. Preview lokal aktif di port 3068. Hasil di bawah merupakan catatan verifikasi revisi sebelumnya.

## Pemeriksaan kode dan layanan

- 34 kasus Chrome tercakup lulus melalui run lengkap dan pengulangan terarah. Run terakhir pada geometri dan batas aman final: **11/11 tes immersive lulus**, termasuk kelima ukuran layar.
- Build produksi akhir Next.js berhasil. Preview produksi diperiksa melalui Chrome: delapan objek termuat, navigasi Harewos bekerja, mode akun `npm-password`, overflow nol, tanpa galat JavaScript atau chunk. Preview aktif di port 3068.
- 28 tes Node/backend lulus: registrasi nama/NPM/password, satu akun/tiket per NPM, anonimitas, moderasi, operator, migrasi Sheets, HMAC dan penanganan kegagalan koneksi.
- Koneksi Google telah diverifikasi pada versi 3, mode `npm-password`, kolom nama siap. Lima aksi baca bertanda tangan berhasil.
- `Settings.content` dibaca kembali dan kosong, sehingga deskripsi baru dari JSON tidak ditimpa konten lama dari Sheets.
- Tidak ada akun, pesan, tiket, atau hasil undian produksi yang dibuat selama verifikasi ini.

## Animasi dan keterbacaan

Delapan objek asli tetap menjadi elemen DOM yang sama sepanjang sepuluh bagian. Kedalaman CSS 3D terukur, posisi berubah terus mengikuti scroll, dan posisi kembali sama ketika scroll dibalik. Konten memakai clip dengan celah bagi gunungan, sehingga teks tidak dilukis di bawah objek transisi. Objek yang menetap berada di sisi panggung, di belakang konten.

Pemeriksaan mencakup lebar 1440, 768, 390 dan 320 px, serta ponsel pendek 320 x 667. Tes memakai kotak tiap baris teks untuk memeriksa persinggungan objek dengan judul; bagian pembuka juga mencakup tombol, tanggal dan hitung mundur. Tinggi aset pembuka ponsel dihitung dari ruang nyata antara akhir teks/tombol dan awal panel tanggal. Pusat input tetap menerima pointer, dan gunungan tersembunyi ketika perpindahan selesai.

Poster tetap berada di top layer, mempertahankan fokus dan posisi scroll. Animasi berhenti ketika poster terbuka, termasuk jika dibuka di tengah navigasi, lalu melanjutkan gerak setelah poster ditutup. Isian Harewos tetap tersimpan saat berpindah bagian. Filter, tautan langsung, navigasi header, perubahan viewport dan reduced motion tetap diperiksa.

## Bahasa dan integritas

Bahasa utama antarmuka adalah bahasa Indonesia. Bahasa Sunda hanya digunakan untuk dua sapaan umum yang disebutkan di atas. Filosofi dicocokkan dengan lima panel PDF sumber. Tanggal, tempat, busana, kontak, dan URL dipertahankan. Label kontrol mengikuti diksi Indonesia.

`log.md`, aturan autentikasi/API, `apps-script/app.gs`, aset sumber, `next.config.mjs` dan `vercel.json` tetap sama dengan HEAD sebelum revisi visual ini. Tidak ada ilustrasi AI atau dependency baru. Nilai credential lokal tidak muncul dalam file yang berubah.

## Publikasi

Perubahan ini ada pada proyek lokal; belum dipush atau dipublikasikan dari sesi ini. Apps Script tidak perlu diperbarui untuk revisi visual dan kalimat ini.

## Revisi fade, logo, dan pendaftaran undian

Sebelas tes immersive terbaru lulus pada lima ukuran layar. Logo selalu berada di dalam viewport, hanya berubah posisi/ukuran, pada revisi sebelumnya menetap tepat di slot logo header; revisi terbaru memakai logo header native yang terpisah. Tidak ada rotasi atau kedalaman pada logo; objek wayang lain tetap memiliki kedalaman 3D. Pemeriksaan tambahan mencakup 16 posisi transisi logo.

Tepi clip diberi feather 64 px dan penurunan opacity maksimum 12 persen selama perpindahan. Probe Chrome memverifikasi dua mask gradient pada transisi peta, mask none/opacity 1 ketika berhenti, serta cleanup mask saat reduced motion. Sebanyak 28 tes backend kembali lulus.

Atas instruksi pengguna, akun panitia dipakai untuk membuka pendaftaran undian. Backend dan API situs publik sama-sama mengonfirmasi open:true dengan HTTP 200. Tidak ada tiket atau hasil undian yang dibuat oleh tindakan ini. Revisi fade/logo belum dipush ke Vercel; perubahan status undian langsung berlaku pada data produksi.
