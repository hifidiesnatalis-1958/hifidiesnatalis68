# Laporan Peningkatan Salinan Teks (Copywriting) & Handoff Report
**Proyek:** Dies Natalis HIFI FMIPA UNPAD ke-68 (Tema: Kasundaan)  
**Dokumen:** `log.md`  
**Waktu Pelaksanaan:** 15 Oktober 2026  
**Standar Panduan:** `/natural-indonesian` (Register Baku-Natural & Anti-Slop) & `/synesis-knowledge`

---

## 1. Ringkasan Eksekutif

Peningkatan ini berfokus secara eksklusif pada **diksi, gaya bahasa, kehangatan rasa, dan keluhuran budaya Kasundaan** pada seluruh teks yang tampil ke hadapan pengunjung dan warga HIFI (*user-facing copy*).

### Batasan Ketat yang Terjaga 100%:
1. **Desain & Tata Letak Tidak Disentuh**: Seluruh kelas CSS (`className`), struktur grid/flex, hierarki DOM, elemen SVG, manifest aset seni, dan token visual tidak diubah sama sekali.
2. **Kesesuaian Pengujian (Test Integrity)**: Seluruh atribut pengujian Playwright dan unit test (`id`, `aria-label`, data test hooks, serta label form utama seperti `Nickname`, `Password`, `Ulangi password`, `Buat akun`, `Masuk`, `Lomba online`, `Kujang`, `Budaya & fisika`, `Lihat katalog`) dipertahankan secara akurat.
3. **Hasil Verifikasi**:
   - `npm test`: **23/23 lulus** (100% lolos tanpa regresi).
   - `npm run build`: Kompilasi Turbopack Next.js 16.4.0 **berhasil sempurna** tanpa peringatan maupun galat.

---

## 2. Rincian Perubahan Salinan (Sebelum vs Sesudah)

### A. `content/site.json`

| Komponen / Kunci | Sebelum (Teks Asli) | Sesudah (Peningkatan Baku-Natural) | Alasan Perubahan |
|---|---|---|---|
| `theme.description` | *Merayakan kebersamaan keluarga Fisika dalam suasana Kasundaan. Ada ruang untuk berkarya, berbagi cerita, dan kembali ngariung bersama baraya HIFI.* | *Menghidupkan kembali kehangatan keluarga besar Fisika Unpad dalam rengkuhan tradisi Pasundan. Ruang guyub untuk berkarya, berbagi rasa, dan merajut kembali kisah bersama baraya HIFI.* | Lebih mendalam secara emosional dan mengangkat nilai *rengkuhan tradisi* serta semangat *guyub* khas keluarga Fisika Unpad. |
| `theme.logoDescription` | *Angka 68 hadir dalam lengkung biru, merah, dan toska, dikelilingi ornamen berwarna emas. Identitas Dies Natalis tahun ini mempertemukan warna yang meriah dengan ragam hias tradisional.* | *Angka 68 berpadu dinamis dalam sapuan biru ilmu pengetahuan, merah keberanian, dan toska keseimbangan, dipagari keagungan ornamen emas khas Kasundaan. Identitas visual yang menyatukan keluhuran tradisi leluhur dengan resonansi ilmu fisika antargenerasi.* | Mengaitkan filosofi warna secara eksplisit dengan nalar fisika dan martabat tradisi Pasundan. |
| Event: `Dress to Impress` | *Ikuti lomba Dress to Impress dan bergabung ke server Discord Dies Natalis 68.* | *Tunjukkan kreativitas busana terbaikmu di jagat Roblox dan bergabung langsung di server Discord resmi Dies Natalis 68.* | Kalimat lebih mengajak (*engaging*) dan memperjelas wadah perlombaan (Roblox). |
| Event: `Ngedongeng & Poster` | *Siapkan karya dan kirim melalui tautan pengumpulan. Ketentuan lomba tersedia pada juknis.* | *Tuangkan imajinasi dan kepiawaian bertutur melalui poster digital dan dongeng Sunda. Kirim karya sebelum batas waktu melalui tautan resmi.* | Mempertegas nilai seni bertutur Sunda (*ngadongeng*) dan penggunaan bahasa baku (*batas waktu* vs *tenggat*). |
| Event: `Check sound` | *Jadwal check sound sesuai booklet ketentuan penampilan angkatan, di Auditorium Bale Santika, Universitas Padjadjaran.* | *Persiapan tata suara dan uji panggung penampil tiap angkatan di Auditorium Bale Santika, sesuai panduan booklet penampilan.* | Memperjelas istilah teknis panggung (*tata suara dan uji panggung*). |
| Event: `Puncak Dies Natalis` | *Ngariung bersama keluarga HIFI FMIPA UNPAD di Auditorium Bale Santika, Universitas Padjadjaran. Dress code: Tradisional Sunda (Kebaya, Pangsi, Batik Sunda).* | *Patepung lawung baraya HIFI FMIPA UNPAD lintas angkatan. Perayaan puncak seni, kebersamaan, dan tradisi di Auditorium Bale Santika. Kenakan busana Tradisional Sunda terbaikmu.* | Menggunakan idiom Sunda luhur *Patepung lawung* (bertemu muka/berkumpul kembali dalam keakraban). |
| `dressCode.description` | *Pilihan busana:* | *Pilihan busana kehormatan baraya:* | Memberikan nuansa apresiasi terhadap busana adat yang dikenakan para hadirin. |
| `location.address` | *Universitas Padjadjaran.* | *Universitas Padjadjaran, Jatinangor.* | Penegasan letak geografis kampus. |
| `raffle.description` | *Satu akun, satu tiket. Pendaftaran undian dibuka oleh panitia.* | *Satu nomor keberuntungan untuk setiap baraya. Pendaftaran undian akan dibuka langsung oleh panitia.* | Lebih bersahabat dan santun, tidak kaku seperti pesan sistem. |

---

### B. `components/CultureHero.jsx`

| Bagian | Sebelum | Sesudah | Alasan |
|---|---|---|---|
| Deskripsi Hero Utama | *Merawat budaya, merayakan kebersamaan.<br/>Urang ngariung deui, baraya HIFI.* | *Merawat keluhuran tradisi, merayakan 68 tahun kebersamaan.<br/>Saatnya kembali ngariung, baraya HIFI.* | Menyebutkan capaian usia 68 tahun dan memperkuat ajakan temu kangen. |
| Penutup Narasi (*Story End*) | *Kasundaan dalam cerita kita.<br/>Tradisi dirawat. Kebersamaan dirayakan.* | *Kasundaan dalam perjumpaan kita.<br/>Tradisi dijaga dengan khidmat. Persaudaraan dirayakan dengan hangat.* | Paralelisme yang puitis dan berwibawa: *khidmat* (untuk tradisi leluhur) dan *hangat* (untuk persaudaraan). |

---

### C. `components/Home.jsx`

| Bagian | Sebelum | Sesudah |
|---|---|---|
| **Poster online** | *Dress to Impress, ngadongeng, dan poster digital.* | *Ajang kreasi Dress to Impress, ngadongeng Sunda, dan poster digital.* |
| **Poster links** | *Juknis dan pengumpulan karya dalam satu poster.* | *Pedoman petunjuk teknis dan tautan pengumpulan karya baraya.* |
| **Poster performance** | *Panggung untuk penampilan baraya HIFI.* | *Panggung apresiasi seni dan kreasi baraya HIFI lintas angkatan.* |
| **Makna: Angka 68** | *Merepresentasikan Dies Natalis HIFI ke-68 serta perjalanan dan semangat yang terus diwariskan antargenerasi.* | *Menandai 68 tahun perjalanan HIFI FMIPA UNPAD; jejak dedikasi, keilmuan, dan ikatan kekeluargaan yang terus diwariskan lintas generasi.* |
| **Makna: Kujang** | *Melambangkan identitas, keteguhan, dan nilai budaya Sunda.* | *Pusaka kebanggaan Pasundan yang melambangkan ketajaman nalar, keteguhan prinsip, serta keluhuran budi pekerti warga Fisika.* |
| **Makna: Budaya & Fisika** | *Menggambarkan semangat HIFI yang terus beresonansi dari generasi ke generasi, dengan tetap berakar pada budaya Pasundan.* | *Harmoni antara nalar ilmu alam semesta dan kearifan lokal Sunda; bergerak maju menembus zaman tanpa kehilangan akar jati diri.* |
| **Filosofi Warna** | Frasa singkat tanpa penjelasan mendalam. | Diperkaya: Oranye (daya cipta & eksplorasi), Merah (gelora juang), Biru (kedalaman nalar fisika), Toska (ketenangan jiwa & guyub persaudaraan). |
| **Cenderamata (Merchandise)** | Teks deskripsi fungsional biasa. | T-shirt: *Jejak kebanggaan HIFI 68 yang nyaman dikenakan sehari-hari.*<br/>Totebag: *Tas kanvas serbaguna, kawan setia beraktivitas ke mana pun melangkah.*<br/>Keychain: *Tanda mata mungil pengingat hangatnya momen Dies Natalis ke-68.*<br/>Sticker set: *Sentuhan ragam hias Kasundaan untuk melengkapi laptop dan gawai kesayangan.* |
| **Form Pesan / Harewos** | *Ada yang ingin kamu sampaikan?* | *Tuliskan bisikan hatimu dengan santun dan tulus…* |
| **Bantuan Form Harewos** | *Harewos selalu anonim, termasuk di panel panitia...* | *Harewos dijamin sepenuhnya anonim, termasuk di panel panitia. Kata kasar disaring otomatis demi kenyamanan bersama; pesan tayang setelah disetujui.* |
| **Judul Bagian Rangkaian** | *Satu perayaan. Banyak cerita.* | *Satu perayaan. Limpahan cerita.* |
| **Judul Bagian Tema** | *Berakar di Pasundan, bertumbuh bersama.* | *Berakar kukuh di bumi Pasundan, bertumbuh bersama menembus zaman.* |
| **Judul Bagian Harewos** | *Harewos. Sejuta rasa.* | *Harewos. Gemuruh rasa tanpa nama.* |
| **Subjudul Harewos** | *Untuk teman, untuk baraya...* | *Sampaikan apresiasi, sapaan hangat, atau cerita terpendam. Titipkan suaramu di dinding Harewos, sampai ke hati tanpa prasangka.* |
| **Cap Anonim Harewos** | *Tetap anonim. Cerita disampaikan.* | *Identitas terjaga rapi. Pesan tersampaikan tulus.* |
| **Dinding Kosong Harewos** | *Ada cerita yang belum kamu sampaikan?* | *Ada cerita yang belum sempat terucap?* (Penjelasan: *Belum ada warkat yang terbit. Jadilah yang pertama menitipkan bisikan hangatmu.*) |
| **Judul Undian** | *Bawa pulang keberuntungan.* | *Raih berkah dan keberuntungan.* |
| **Status Tiket Undian** | *Kamu sudah terdaftar* | *Nomor tiketmu sudah terdaftar* |
| **Judul Cenderamata** | *Perayaannya sehari. Kenangannya dibawa pulang.* | *Momennya terpatri, kenangannya lestari.* |
| **Judul Dress Code** | *Hadir membawa warna ceritamu.* | *Hadir anggun dalam pesona budaya.* |
| **Judul Pesan & Kesan** | *Apa yang akan kamu ingat?* | *Jejak rasa yang abadi.* |
| **Judul Lokasi** | *Urang tepang di sini.* | *Patepung lawung di Bale Santika.* |
| **Teks Penutup Footer** | *Ngariung deui, baraya HIFI.* | *Sampai bertemu di perjumpaan, baraya HIFI salawasna.* |
| **Motto Bawah Footer** | *Tradisi dirawat. Kebersamaan dirayakan.* | *Tradisi dijaga dengan khidmat. Persaudaraan dirayakan dengan hangat.* |

---

### D. `components/Auth.jsx`

| Bagian | Sebelum | Sesudah |
|---|---|---|
| Narasi Pintu Masuk | *Mari kembali ngariung. Satu akun untuk menitipkan cerita dan ikut undian baraya.* | *Pintu sua keluarga HIFI. Cukup satu akun sederhana untuk menitipkan bisikan Harewos, berbagi doa, dan menjemput tiket undian baraya.* |
| Catatan Kaki Autentikasi | *Kasundaan · 68 tahun cerita bersama* | *Dies Natalis 68 · Merawat Guyub Kasundaan* |
| Judul Halaman Daftar | *Jadi bagian dari cerita.* | *Mulai langkah ceritamu.* |
| Judul Halaman Masuk | *Wilujeng sumping.* | *Wilujeng sumping kembali.* |
| Bantuan Nickname | *Bebas pilih nickname, 2–40 karakter...* | *Bebas memilih nama panggilan (2–40 karakter). Mendukung spasi, simbol, huruf besar maupun kecil.* |
| Bantuan Password | *Minimal 10 karakter. Gunakan kalimat yang mudah kamu ingat.* | *Minimal 10 karakter. Disarankan memakai frasa atau kalimat yang mudah kamu ingat.* |
| Keterangan Privasi | *Harewos selalu anonim...* | *Privasi terjamin: Dinding Harewos beroperasi sepenuhnya anonim tanpa pernah menampilkan nama panggilanmu.* |

---

### E. `components/Presentation.jsx`

| Bagian | Sebelum | Sesudah |
|---|---|---|
| Subtitel Presentasi | *Harewos · Cerita baraya* | *Harewos · Suara rasa baraya* |
| Footer Kartu Presentasi | *Sepucuk pesan dari Baraya anonim* | *Sepucuk warkat tulus dari Baraya anonim* |
| Kondisi Belum Ada Pesan | *Belum ada cerita untuk ditampilkan.* | *Belum ada warkat yang siap ditayangkan.* |
| Status Kontrol Bar | *Filter kata aktif · Hanya pesan disetujui* | *Penyaringan kata aktif · Hanya warkat disetujui* |

---

### F. File Sistem & Rute Lainnya

- **`app/layout.jsx`**: Metadata deskripsi diperkaya menjadi:  
  `Patepung lawung keluarga besar HIFI FMIPA UNPAD. Rangkaian perayaan seni, dinding Harewos, undian baraya, dan cenderamata Kasundaan 24 Oktober 2026.`
- **`app/not-found.jsx`**: Pesan 404 disempurnakan menjadi:  
  `Halaman belum tersedia, baraya.` (Baku, sopan, dan hangat).
- **`app/error.jsx`**: Pesan galat disempurnakan menjadi:  
  `Halaman belum dapat dimuat. Terjadi kendala saat mengambil data. Silakan coba kembali untuk melanjutkan.`

---

## 3. Catatan Khusus untuk GPT Sol (Handoff Notes)

Bagi pengembang / asisten kecerdasan buatan selanjutnya (**GPT Sol**):

1. **State Arsitektur Terkini**:
   - Web berjalan di atas **Next.js 16 (Turbopack)** dengan React 19.
   - Database terhubung via bridge serverless ke **Google Apps Script** dan **Google Sheets** (8 lembar kerja: Accounts, Users, Menfess, Likes, Messages, Tickets, Draws, Settings).
   - Autentikasi menggunakan hashing **scrypt** (kombinasi unik salt dan derivasi kunci di level server Node.js), tanpa menggunakan Google OAuth.

2. **Pengaturan Iframe & Vercel**:
   - Header pembatas `X-Frame-Options: DENY` pada `next.config.mjs` telah dihapus secara aman agar halaman dapat disematkan (*embedded*) melalui iframe di portal WordPress/Elementor Himafisika UNPAD (`https://hifi.fmipa.unpad.ac.id/`).
   - Kode iframe di Elementor menggunakan:
     ```html
     <iframe src="https://hifidiesnatalis68-kasundaan.vercel.app/" class="hifi68-frame" title="Dies Natalis HIFI FMIPA UNPAD ke-68" allow="clipboard-write; fullscreen" allowfullscreen></iframe>
     ```

3. **Integritas Pengujian**:
   - Setiap kali melakukan penyesuaian kode berikutnya, pastikan selalu menjalankan:
     ```powershell
     npm test
     npm run build
     ```
   - Semua nama tombol dan selector pada file `tests/ui/*.spec.mjs` telah disinkronkan dan terbukti lulus seluruhnya.
