'use client';
export default function ErrorPage({reset}) {return <main className="wrap error-page"><h1>Halaman belum dapat dimuat.</h1><p>Terjadi kendala saat mengambil data. Silakan coba kembali untuk melanjutkan.</p><button className="button" onClick={reset}>Coba lagi</button><a href="/">Kembali ke beranda</a></main>;}
