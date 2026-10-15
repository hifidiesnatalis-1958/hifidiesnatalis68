# Laporan Peningkatan Salinan Teks (Copywriting) & Handoff Report
**Proyek:** Dies Natalis HIFI FMIPA UNPAD ke-68 (Tema: Kasundaan)  
**Dokumen:** `log.md`  
**Waktu Pelaksanaan:** 15 Oktober 2026  
**Standar Panduan:** `/natural-indonesian` (Register Baku-Natural & Anti-Slop, Gaya Nyata Himpunan Mahasiswa Fisika UNPAD / HIFI 67)

---

## 1. Ringkasan Eksekutif

Pembaruan ini berfokus pada **penyederhanaan salinan teks (*copywriting*) agar lugas, bersahabat, wajar, tidak hiperbolik, dan tidak memuat keterangan berlebihan (*anti-slop*)**, sejalan dengan tradisi dan gaya komunikasi situs perayaan HIFI tahun-tahun sebelumnya (Dies Natalis ke-67).

Selain itu, pembaruan ini menuntaskan perbaikan ketajaman aset visual **Gunungan Kelir (SVG Wayang Gate)** yang sebelumnya sempat terputus pada sesi Codex.

### Prinsip Utama:
1. **Diksi Resmi Warga Himpunan**: Menggunakan sebutan resmi **Warga Himpunan** (dan keluarga besar HIFI FMIPA UNPAD).
2. **Kop Harewos HIFI**: Memperbarui judul bagian menfess menjadi **Harewos HIFI** dengan ajakan khas: *Hayu urang Haharewosan! 👀*.
3. **Anti-Hiperbolik & Tanpa Keterangan Berlebihan**: Menghilangkan metafora teatrikal berlebihan (seperti *"pintu sua"*, *"gemuruh rasa tanpa nama"*, *"resonansi antargenerasi"*, *"patepung lawung"*, *"harmoni nalar alam semesta"*).
4. **Penyelesaian Pekerjaan Codex (Gunungan Tajam)**: Memperbaiki rendering `.wayang-gate` SVG agar dirender pada ketinggian penuh panggung (`height: 100%`) sebelum dianimasikan dan diskalakan secara normalisasi (`scale(${(.08 + .86 * cover).toFixed(5)})`). Hal ini mencegah degradasi piksel / blur (*burik*) pada gunungan depan.
5. **Pembersihan Catatan AI**: Menghapus seluruh komentar instruksional agen di file CSS dan JSX.
6. **Integritas Pengujian 100%**: Struktur layout, grid/flex CSS, hierarki komponen, props, dan seluruh selector uji fungsional Playwright serta unit test tetap utuh dan lulus sempurna.

---

## 2. Rincian Penyelarasan Kalimat (Sebelum vs Sesudah)

| File / Komponen | Teks Sebelumnya (Hiperbolik / AI) | Teks Sekarang (Lugas, Natural & Warga Himpunan) |
|---|---|---|
| `content/site.json` (`theme.description`) | *Kasundaan mengajak keluarga besar Fisika Unpad berkumpul, berkarya, dan merayakan Dies Natalis ke-68 bersama dalam budaya Sunda.* | **Perayaan 68 tahun HIFI FMIPA UNPAD bertema Kasundaan, mempertemukan seluruh warga himpunan dan alumni Fisika Unpad.** |
| `content/site.json` (`theme.logoDescription`) | *Kujang, angka 68, dan ornamen batik menyatukan perjalanan HIFI dengan identitas Pasundan. Oranye, merah, biru, dan toska membawa semangat, ilmu pengetahuan, serta kebersamaan yang diteruskan antargenerasi.* | **Kujang, angka 68, dan motif batik menyatukan identitas Pasundan dengan perjalanan HIFI. Warna oranye, merah, biru, dan toska mewakili kebersamaan, daya juang, dan keilmuan fisika.** |
| `content/site.json` (Event Puncak) | *Rayakan acara puncak bersama keluarga HIFI FMIPA UNPAD lintas angkatan di Auditorium Bale Santika dengan busana tradisional Sunda.* | **Acara puncak Dies Natalis ke-68 di Auditorium Bale Santika bersama warga himpunan Fisika Unpad lintas angkatan. Dress code: tradisional Sunda.** |
| `components/CultureHero.jsx` (Hero Lead) | *Mari berkumpul, keluarga HIFI.<br/>Rayakan 68 tahun kebersamaan dalam budaya Sunda.* | **Perayaan 68 tahun HIFI FMIPA UNPAD.<br/>Kumpul bareng warga himpunan dalam nuansa Kasundaan.** |
| `components/CultureHero.jsx` (Hero End) | *Kasundaan di tengah keluarga HIFI.* | **Kasundaan bersama warga himpunan HIFI.** |
| `components/LogoPhilosophy.jsx` (Kujang) | *Melambangkan identitas, keteguhan, dan nilai budaya Sunda.* | **Pusaka Pasundan yang melambangkan kekuatan dan jati diri.** (Detail: *Kujang menegaskan akar budaya Sunda dalam perayaan 68 tahun HIFI.*) |
| `components/LogoPhilosophy.jsx` (Angka 68) | *Menandai Dies Natalis HIFI ke-68 serta perjalanan dan semangat yang diwariskan antargenerasi.* | **Menandai usia 68 tahun Himpunan Mahasiswa Fisika UNPAD.** (Detail: *Merangkum perjalanan dan kebersamaan tiap angkatan warga himpunan sejak 1958.*) |
| `components/LogoPhilosophy.jsx` (Batik) | *Mencerminkan kekayaan budaya dan identitas Pasundan.* | **Sentuhan ragam hias khas Priangan.** (Detail: *Motif batik melengkapi logo dan mempertegas tema Kasundaan.*) |
| `components/LogoPhilosophy.jsx` (Keseluruhan) | *Menggambarkan semangat HIFI yang terus beresonansi antargenerasi dan tetap berakar pada budaya Pasundan.* | **Harmoni tradisi Pasundan dan identitas HIFI.** (Detail: *Kujang, angka 68, dan motif batik menjadi satu kesatuan identitas perayaan tahun ini.*) |
| `components/LogoPhilosophy.jsx` (Warna) | *Empat warna membawa makna semangat, ilmu pengetahuan, dan kebersamaan.* | **Empat warna identitas HIFI 68.** (Detail: *Oranye dan merah mewakili semangat dan daya juang; biru dan toska melambangkan keilmuan fisika serta kebersamaan warga himpunan.*) |
| `components/Home.jsx` (Kop Bagian Harewos) | *Harewos.<br/>Cerita tanpa nama.* | **Harewos HIFI.<br/>Hayu urang Haharewosan! 👀** |
| `components/Home.jsx` (Form Menfess) | *Untuk teman, angkatan tertentu, atau seluruh keluarga HIFI* | **Untuk teman, angkatan tertentu, atau seluruh warga himpunan** |
| `components/Home.jsx` (Harewos Empty State) | *Ada cerita yang belum sempat terucap?* | **Belum ada pesan yang ditampilkan.** (Subteks: *Belum ada Harewos yang tayang. Kirim pesan atau sapaan pertamamu untuk warga himpunan HIFI.*) |
| `components/Home.jsx` (Makna Warna) | Oranye: *Semangat, kreativitas, dan keberanian...*<br/>Merah: *Energi perjuangan antargenerasi.* | Oranye: **Semangat dan daya cipta warga himpunan.**<br/>Merah: **Keberanian berekspresi dan energi berhimpun.**<br/>Biru: **Keilmuan dan nalar fisika.**<br/>Toska: **Kebersamaan dan keakraban lintas angkatan.** |
| `components/Home.jsx` (Cenderamata) | *Teman membawa perlengkapan kuliah dan kegiatan sehari-hari.* | **Tas kanvas untuk perlengkapan kuliah.** (Keychain: *Gantungan kunci akrilik HIFI 68.*) |
| `components/Home.jsx` (Undian) | *Siapa yang mendapat hadiah?* | **Undian berhadiah Dies Natalis 68.** (Keterangan: *Satu tiket undian untuk satu NPM warga himpunan. Wajib masuk akun. Pendaftaran dibuka oleh panitia.*) |
| `components/Home.jsx` (Footer) | *Hatur nuhun. Sampai bertemu kembali.* | **Hatur nuhun. Sampai jumpa di Bale Santika!** |
| `components/Auth.jsx` (Kisah Masuk) | *Pintu sua keluarga HIFI...* | **Akun Warga Himpunan Dies Natalis HIFI.** (Keterangan: *Gunakan satu akun NPM untuk mengirim Harewos, menulis pesan dan kesan, serta mengambil tiket undian.*) |
| `components/Presentation.jsx` (Subtitel) | *Harewos · Pesan anonim* | **Harewos · Pesan anonim warga himpunan** |
| `app/layout.jsx` (Meta Deskripsi) | *Rayakan Dies Natalis HIFI FMIPA UNPAD ke-68...* | **Perayaan Dies Natalis HIFI FMIPA UNPAD ke-68. Temukan jadwal acara, Harewos anonim warga himpunan, undian, dan cenderamata Kasundaan. 24 Oktober 2026 di Bale Santika.** |

---

## 3. Penyelesaian Pekerjaan Codex: Ketajaman Gunungan Kelir (SVG Wayang Gate)

- **Akar Masalah:** Elemen `.wayang-gate` sebelumnya dibatasi `height: 200px` di CSS, lalu diperbesar lebih dari 4 kali lipat menggunakan `transform: scale(...)`. Hal ini menyebabkan browser merasterisasi SVG pada resolusi rendah (200px) sebelum memperbesarnya, sehingga garis vektor tampak pecah dan burik (*pixelated*).
- **Solusi yang Diterapkan:**
  - `app/immersive.css`: Mengubah `.wayang-gate` dan `.wayang-gate img` menjadi `height: 100%`.
  - `components/WayangTheatre.jsx`: Mengubah kalkulasi transformasi pada fungsi `moveTheatre` menjadi skala normalisasi `scale(${(.08 + .86 * cover).toFixed(5)})`.
  - Hasil: Gunungan dirender pada resolusi penuh panggung pementasan dan tampil jernih, tajam, serta tidak lagi burik.

### Perbaikan Login di Iframe hifi.fmipa.unpad.ac.id
- **Gejala:** Daftar/masuk berhasil di server (entri muncul di spreadsheet), tetapi halaman menampilkan *"Sesi belum tersimpan. Buka situs langsung di tab baru..."*.
- **Penyebab:** Situs dibuka sebagai iframe di `hifi.fmipa.unpad.ac.id` (lintas situs). Cookie sesi memakai `SameSite=Lax`, sehingga browser menolak menyimpannya di dalam iframe.
- **Solusi:**
  - `lib/session.js`: Di Vercel/HTTPS cookie memakai `Secure; SameSite=None; Partitioned` (CHIPS). Lokal tetap `Lax`.
  - `app/api/auth/logout/route.js`: Logout juga menghapus cookie `Lax` lama.
  - `tests/origin.test.mjs`: Menambah uji atribut cookie.
  - CSRF tetap tertahan: semua POST memeriksa header Origin dan mewajibkan `application/json`.

### Perombakan Salinan Teks (Copywriting) Gaya Sandzh (Anti-Overexplain)
- **Tujuan:** Menghapus seluruh keterangan birokratis berulang, over-explain, dan catatan berlebihan di semua section agar lugas, to the point, dan berenergi, dengan tetap mempertahankan seluruh sapaan dan frasa Basa Sunda (*Wilujeng sumping*, *Hatur nuhun*, *Harewos HIFI*, *Hayu urang Haharewosan! 👀*, *Kasundaan*).
- **Perubahan Spesifik:**
  - `components/Home.jsx`:
    - Form Harewos: menghapus repetisi *"Selalu anonim · nama tidak ditampilkan"* menjadi *"Selalu anonim"*, memangkas paragraf bantuan panjang menjadi *"Pesan tayang setelah disetujui panitia."*.
    - Empty state Harewos: menghapus teks ganda berulang menjadi *"Belum ada pesan."* dan *"Jadilah yang pertama mengirim Harewos."*.
    - Undian: memadatkan keterangan menjadi *"Satu tiket per NPM. Wajib masuk akun."*, serta menyederhanakan teks kartu undian dan persetujuan.
    - Cenderamata & Pesan: deskripsi dipadatkan langsung ke pokok informasi barang dan ajakan pesan tanpa kalimat pengantar generik.
    - Label warna & poster: dipersingkat menjadi deskripsi fungsional padat.
  - `components/Auth.jsx`:
    - Mengganti judul bertele-tele menjadi *"Daftar Akun"*, *"Masuk Akun"*, *"Masuk Panitia"*.
    - Memangkas petunjuk input NPM dan sandi menjadi ringkas (*"Format 12 digit (140310...)"*, *"Minimal 10 karakter"*).
    - Catatan privasi dibuat padat: *"Harewos selalu anonim."*.
  - `components/CultureHero.jsx`: Deskripsi hero langsung ke inti tema, tombol aksi menggunakan ajakan aktif (*"Lihat rangkaian acara"*, *"Kirim Harewos"*).
  - `components/LogoPhilosophy.jsx`: Merapikan panel filosofi agar tidak terjadi pengulangan antara kalimat utama dan rincian.
  - `content/site.json`: Memadatkan deskripsi tema, lomba online (Roblox, ngedongeng, poster), check sound, dan acara puncak.
### Standardisasi Kalimat Berpredikat Aktif & EYD Bahasa Indonesia
- **Tujuan:** Menghindari singkatan buntung bergaya telegram (seperti *"selalu anonim"* atau potongan frasa tanpa predikat) serta menggantinya dengan susunan kalimat ber-EYD yang utuh, wajar, dan mengutamakan **kata kerja aktif** (*active verbs*), tanpa kehilangan nuansa lugas.
- **Perubahan Spesifik:**
  - `components/Home.jsx`:
    - Bagian Harewos: label status menggunakan kalimat lengkap dan wajar: **"Pesan ini bersifat anonim."** (menggantikan singkatan buntung). Bantuan form: *"Panitia akan meninjau pesan ini sebelum menayangkannya ke publik."*. Placeholder input menggunakan verba aktif: *"Tulis nama teman, angkatan, atau warga himpunan"*. Empty state: *"Kirimkan pesan Harewos pertama untuk menyapa warga himpunan."*.
    - Bagian Undian: *"Setiap warga himpunan berhak memperoleh satu tiket undian. Wajib masuk akun."*, status: *"Sistem telah menyimpan nomor tiket Anda."*, persetujuan: *"Saya bersedia menampilkan nomor tiket jika memenangkan undian ini."*.
    - Bagian Cenderamata & Pesan: menggunakan kalimat berpredikat aktif (*"Panitia menyediakan..."*, *"Bagikan cerita, pengalaman, dan doa terbaik Anda..."*).
    - Makna warna: menggunakan verba aktif (*Membangkitkan*, *Menunjukkan*, *Melambangkan*, *Mempererat*).
    - Keterangan poster: menggunakan verba aktif (*Memuat*, *Menyediakan*, *Menampilkan*).
  - `components/Auth.jsx`:
    - Kalimat dibuat utuh ber-EYD: *"Gunakan akun NPM Anda untuk mengirimkan Harewos, membagikan kesan, dan mengklaim tiket undian."*.
    - Penjelasan registrasi: *"Pendaftaran ini terbuka bagi seluruh warga himpunan Fisika Unpad hingga angkatan 25."*.
    - Penjelasan masuk: *"Masukkan NPM dan kata sandi yang telah Anda daftarkan."*.
    - Petunjuk form: *"Gunakan 12 digit NPM resmi yang diawali dengan kode 140310."*, *"Gunakan kata sandi pribadi dengan panjang minimal 10 karakter."*.
    - Pernyataan privasi: *"Sistem menjamin seluruh pesan Harewos tetap bersifat anonim."*.
  - `components/CultureHero.jsx`: Deskripsi hero menggunakan verba aktif: *"Merayakan 68 tahun kebersamaan HIFI FMIPA UNPAD dalam balutan budaya Sunda."*.
  - `components/LogoPhilosophy.jsx`: Setiap panel filosofi ditulis dengan struktur SPOK berpredikat aktif (*melambangkan*, *menyimpan*, *menandai*, *merangkum*, *mengangkat*, *memadukan*, *berpadu membentuk*).
  - `content/site.json`: Seluruh deskripsi agenda lomba, check sound, acara puncak, dan busana disusun dengan kata kerja aktif (*merayakan*, *memadukan*, *menampilkan*, *mengunggah*, *menguji*, *menghadiri*, *mengenakan*).

---

## 4. Status Verifikasi

- `npm test`: **28 / 28 lulus**
- `npm run build`: **Turbopack Next.js 16.4.0 sukses tanpa peringatan**
- `npx playwright test tests/ui/site.spec.mjs`: **7 / 7 lulus**
- Status Git: Bersih, tersinkronisasi, dan siap di-deploy secara otomatis ke Vercel melalui branch `main`.


