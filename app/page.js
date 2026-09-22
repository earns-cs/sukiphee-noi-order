import Link from 'next/link';

export default function HomePage() {
  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '1.5rem',
        fontFamily: 'sans-serif',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <h1 style={{ fontSize: '2.5rem', margin: 0 }}>สุกี้ผีน้อย</h1>
      <p style={{ margin: 0, color: '#555' }}>ระบบสั่งอาหารร้านบุฟเฟต์</p>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <Link
          href="/generate-qr"
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            background: '#111',
            color: '#fff',
            textDecoration: 'none',
          }}
        >
          สร้าง QR โต๊ะ
        </Link>
        <Link
          href="/kitchen"
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            background: '#eee',
            color: '#111',
            textDecoration: 'none',
          }}
        >
          หน้าครัว
        </Link>
      </div>
    </main>
  );
}
