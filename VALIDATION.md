# Verifikasi 15 Oktober 2026

Proyek: `S:\Code\hifidiesnatalis68`.

## Hasil akhir lokal

- **26/26 tes Node/backend lulus** melalui `npm.cmd test`.
- **30/30 tes Chrome lulus** melalui `npm.cmd run test:ui`.
- **Build produksi berhasil** melalui `npm.cmd run build` (Next.js 16.4.0).
- **Pemeriksaan backend produksi read-only berhasil**: health HTTP 200, `content.get`, `menfess.list`, `messages.list`, `raffle.status`, `auth.status`.
- `git diff --check` tidak menemukan whitespace error.

Preview produksi lokal berjalan di http://localhost:3068. Permintaan daftar kosong dengan Origin lokal yang benar mendapat HTTP 400 validasi NPM, sehingga tidak lagi terhenti di pemeriksaan Origin. Tidak ada NPM peserta, pesan, moderasi, tiket, atau hasil undian yang dibuat oleh verifikasi ini. Status undian nyata saat pemeriksaan: 0 tiket, 0 pemenang.

## Aturan akun dan akses

Pengujian membuktikan penolakan angkatan 26, departemen lain, panjang NPM salah, segmen 00 yang salah, dan nomor urut nol. Duplikasi NPM tidak menerbitkan akun/token baru. Token bersifat opaque, berbeda antar-NPM, disimpan sebagai hash scrypt, tidak ikut cookie/respons login, dan bisa digunakan kembali untuk akun yang sama. Pemulihan operator menghasilkan token yang sama tanpa akun/tiket tambahan.

Akun peserta tidak dapat memakai jalur operator. Pengunjung dan peserta biasa ditolak endpoint pemulihan; operator ditolak pendaftaran undian. Origin asing ditolak. Di Vercel, pemeriksaan memakai origin deployment resmi dan cookie tetap Secure meskipun APP_URL belum diperbarui dari localhost. Uji pembatas percobaan, HMAC, nonce, timestamp, sesi kedaluwarsa, formula Sheets, dan larangan menang dua kali lulus.

Tes autentikasi end-to-end memakai fixture browser dan adapter kode Apps Script asli dalam memori. Pendaftaran NPM nyata tidak dilakukan agar NPM pengguna tidak terpakai oleh tes. Akun operator lama dan secret dipertahankan; deployment Apps Script yang sudah berjalan kompatibel tanpa perubahan kode Google.

## Antarmuka dan gerak

Layout diperiksa pada 1440, 768, 390, dan 320 px. Scroll diuji maju-mundur di setiap bagian; bentuk berubah dan kembali sesuai posisi scroll, tanpa overflow horizontal. Field Harewos tetap memiliki nilai dan geometri yang sama setelah satu perjalanan penuh. Reduced motion mematikan gerak dan mempertahankan seluruh isi serta navigasi.

Lima panel filosofi menampilkan sumber Kujang, Angka 68, Ornamen Batik, Keseluruhan, dan Warna. Navigasi keyboard, poster sumber yang berbeda untuk tiap panel, Escape, download, dan pemulihan fokus lulus. Katalog memakai empat produk asli serta komposisi promosi T-shirt. Semua **38 entri manifest** direferensikan komponen/stylesheet; rasio dan gambar sumber tidak diganti.

Harewos anonim, moderasi, filter kata, likes, tiket setelah logout, serta presentasi operator (acak, otomatis, layar penuh, kontrol keyboard) tetap diuji. Screenshot tersedia di `test-results/previews/`; form produksi terakhir juga disimpan di workspace `hifi68-ready/previews/`.

## Integritas revisi pengguna

Hash berkas berikut cocok dengan baseline sebelum revisi: `log.md`, `content/site.json`, `next.config.mjs`, `vercel.json`, `CultureHero.jsx`, `Presentation.jsx`, `JourneyAtmosphere.jsx`, dan `Icon.jsx`. Isi bagian rangkaian, dress code, pesan-kesan, dan lokasi dibandingkan langsung dan tetap identik. Penambahan copy terbatas pada ruang revisi Harewos, promosi merchandise, filosofi, dan alur NPM/token.

## Kamus dan skill Sunda

Tiga PDF resmi (435 + 495 + 259 = **1.189 halaman**) diunduh lengkap, dicatat SHA-256, dan diekstrak seluruh halamannya. Folder `kamus-basa-sunda/` dikecualikan dari Git/Vercel. Petunjuk penggunaan kamus I halaman PDF 8–23 dibaca sampai selesai; bagian undak-usuk dan tata bahasa terkait menjadi rujukan skill. Scan entri bisik dan tabel ragam hormat diperiksa secara visual untuk membedakan cacat OCR.

Skill global `natural-sundanese` lulus `quick_validate.py`. Script lookup diuji untuk pencarian entri bisik (PDF 139), pembacaan halaman tata bahasa (PDF 23), korpus hilang, halaman tidak tersedia, serta pembedaan é terkomposisi/terurai dari e biasa. Pencarian tidak mengubah diakritik atau menebak perbaikan OCR. Ini bukan klaim telah menghafal seluruh kamus.

## Publikasi

Hasil di atas memverifikasi kode lokal. Website Vercel yang sudah online belum otomatis berubah oleh build lokal; pembaruan repository/deployment diperlukan untuk menerapkan revisi ini ke situs publik. APP_URL Production yang sesuai adalah `https://hifidiesnatalis68-kasundaan.vercel.app`.
