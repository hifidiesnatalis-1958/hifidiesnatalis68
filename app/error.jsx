'use client';
export default function ErrorPage({reset}) {return <main className="wrap error-page"><h1>Halaman belum berhasil dimuat.</h1><p>Coba muat kembali untuk melanjutkan.</p><button className="button" onClick={reset}>Coba lagi</button><a href="/">Kembali ke beranda</a></main>;}
