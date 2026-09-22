'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const styles = {
  page: {
    minHeight: '100vh',
    padding: '2rem 1.5rem',
    fontFamily: 'sans-serif',
    display: 'flex',
    justifyContent: 'center',
  },
  container: {
    width: '100%',
    maxWidth: '480px',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  label: {
    display: 'block',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    marginBottom: '0.4rem',
  },
  input: {
    width: '100%',
    fontSize: '1.5rem',
    padding: '0.6rem 0.8rem',
    marginBottom: '1.2rem',
    border: '2px solid #ccc',
    borderRadius: '8px',
    boxSizing: 'border-box',
  },
  primaryButton: {
    width: '100%',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    padding: '0.9rem',
    borderRadius: '10px',
    border: 'none',
    background: '#111',
    color: '#fff',
    cursor: 'pointer',
  },
  secondaryButton: {
    fontSize: '1.1rem',
    padding: '0.6rem 1rem',
    borderRadius: '8px',
    border: '2px solid #111',
    background: '#fff',
    color: '#111',
    cursor: 'pointer',
  },
  errorText: {
    color: '#c0392b',
    fontSize: '1rem',
    marginBottom: '1rem',
  },
  warningBox: {
    border: '3px solid #e67e22',
    background: '#fff3e0',
    borderRadius: '12px',
    padding: '1.2rem',
    marginBottom: '1.5rem',
  },
  warningText: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#b9540a',
    marginBottom: '1rem',
  },
  dangerButton: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    padding: '0.8rem 1.2rem',
    borderRadius: '8px',
    border: 'none',
    background: '#e67e22',
    color: '#fff',
    cursor: 'pointer',
    width: '100%',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    zIndex: 50,
  },
  confirmBox: {
    background: '#fff',
    borderRadius: '14px',
    padding: '1.5rem',
    width: '100%',
    maxWidth: '420px',
    border: '3px solid #c0392b',
  },
  confirmTitle: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#c0392b',
    marginBottom: '1rem',
  },
  confirmRow: {
    fontSize: '1.1rem',
    marginBottom: '0.4rem',
  },
  confirmButtonRow: {
    display: 'flex',
    gap: '0.8rem',
    marginTop: '1.5rem',
  },
  cancelButton: {
    flex: 1,
    fontSize: '1.1rem',
    padding: '0.8rem',
    borderRadius: '8px',
    border: '2px solid #999',
    background: '#fff',
    color: '#333',
    cursor: 'pointer',
  },
  confirmDangerButton: {
    flex: 1,
    fontSize: '1.1rem',
    fontWeight: 'bold',
    padding: '0.8rem',
    borderRadius: '8px',
    border: 'none',
    background: '#c0392b',
    color: '#fff',
    cursor: 'pointer',
  },
  resultBox: {
    border: '3px solid #27ae60',
    background: '#eafaf1',
    borderRadius: '14px',
    padding: '1.5rem',
    textAlign: 'center',
  },
  qrImage: {
    width: '100%',
    maxWidth: '300px',
    height: 'auto',
    margin: '0 auto 1rem',
    display: 'block',
    background: '#fff',
    borderRadius: '8px',
    padding: '0.5rem',
  },
  summaryText: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    marginBottom: '0.6rem',
  },
  linkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '1.5rem',
  },
  linkText: {
    fontSize: '0.95rem',
    wordBreak: 'break-all',
    color: '#333',
  },
  copyButton: {
    fontSize: '0.9rem',
    padding: '0.4rem 0.7rem',
    borderRadius: '6px',
    border: '1px solid #999',
    background: '#fff',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
};

function getElapsedMinutesText(createdAt) {
  const createdMs = new Date(createdAt).getTime();
  const diffMs = Date.now() - createdMs;
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  return `เปิดมาแล้ว ${minutes} นาที`;
}

export default function GenerateQrPage() {
  const [tableNumber, setTableNumber] = useState('');
  const [adultCount, setAdultCount] = useState('');
  const [childCount, setChildCount] = useState('');

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [existingSession, setExistingSession] = useState(null);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [closing, setClosing] = useState(false);
  const [closeError, setCloseError] = useState('');

  const [qrResult, setQrResult] = useState(null);
  const [copyLabel, setCopyLabel] = useState('คัดลอกลิงก์');

  function resetForm() {
    setTableNumber('');
    setAdultCount('');
    setChildCount('');
    setFormError('');
    setExistingSession(null);
    setQrResult(null);
    setCopyLabel('คัดลอกลิงก์');
  }

  async function handleOpenTable(e) {
    e.preventDefault();
    setFormError('');

    const tableNum = parseInt(tableNumber, 10);
    const adults = parseInt(adultCount, 10);
    const children = parseInt(childCount, 10) || 0;

    if (!tableNumber || Number.isNaN(tableNum)) {
      setFormError('กรุณากรอกเลขโต๊ะให้ถูกต้อง');
      return;
    }
    if (!adultCount || Number.isNaN(adults) || adults < 0) {
      setFormError('กรุณากรอกจำนวนผู้ใหญ่ให้ถูกต้อง');
      return;
    }

    setLoading(true);
    try {
      // Check for an already-open session on this table
      const { data: openSessions, error: checkError } = await supabase
        .from('sessions')
        .select('id, table_number, adult_count, child_count, created_at')
        .eq('table_number', tableNum)
        .eq('status', 'open')
        .limit(1);

      if (checkError) {
        setFormError('เกิดข้อผิดพลาดในการตรวจสอบโต๊ะ: ' + checkError.message);
        return;
      }

      if (openSessions && openSessions.length > 0) {
        setExistingSession(openSessions[0]);
        return;
      }

      // No open session -> create a new one
      const { data: newSession, error: insertError } = await supabase
        .from('sessions')
        .insert({
          table_number: tableNum,
          adult_count: adults,
          child_count: children,
          status: 'open',
        })
        .select()
        .single();

      if (insertError) {
        setFormError('เกิดข้อผิดพลาดในการเปิดโต๊ะ: ' + insertError.message);
        return;
      }

      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const orderUrl = `${origin}/order/${newSession.table_number}`;

      setQrResult({
        tableNumber: newSession.table_number,
        adultCount: newSession.adult_count,
        childCount: newSession.child_count,
        url: orderUrl,
      });
    } finally {
      setLoading(false);
    }
  }

  function handleRequestCloseOld() {
    setCloseError('');
    setShowConfirmClose(true);
  }

  function handleCancelConfirm() {
    setShowConfirmClose(false);
  }

  async function handleConfirmCloseOld() {
    if (!existingSession) return;
    setClosing(true);
    setCloseError('');
    try {
      const { data, error } = await supabase
        .from('sessions')
        .update({ status: 'closed' })
        .eq('id', existingSession.id)
        .eq('status', 'open')
        .select();

      if (error) {
        setCloseError('เกิดข้อผิดพลาดในการปิดโต๊ะ: ' + error.message);
        return;
      }

      if (!data || data.length === 0) {
        setCloseError('โต๊ะนี้ถูกปิดไปแล้วโดยผู้อื่น กรุณาลองเปิดโต๊ะใหม่อีกครั้ง');
        setExistingSession(null);
        setShowConfirmClose(false);
        return;
      }

      // Closed successfully: remove warning box, back to form (values kept)
      setShowConfirmClose(false);
      setExistingSession(null);
    } finally {
      setClosing(false);
    }
  }

  async function handleCopyLink() {
    if (!qrResult) return;
    try {
      await navigator.clipboard.writeText(qrResult.url);
      setCopyLabel('คัดลอกแล้ว!');
      setTimeout(() => setCopyLabel('คัดลอกลิงก์'), 1500);
    } catch (err) {
      setCopyLabel('คัดลอกไม่สำเร็จ');
      setTimeout(() => setCopyLabel('คัดลอกลิงก์'), 1500);
    }
  }

  // --- Result screen (QR shown) ---
  if (qrResult) {
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      qrResult.url
    )}`;

    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.title}>สร้าง QR โต๊ะ</h1>
          <div style={styles.resultBox}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrImageUrl} alt="QR โต๊ะ" style={styles.qrImage} />
            <div style={styles.summaryText}>
              โต๊ะ {qrResult.tableNumber} · ผู้ใหญ่ {qrResult.adultCount} · เด็ก{' '}
              {qrResult.childCount}
            </div>
            <div style={styles.linkRow}>
              <span style={styles.linkText}>{qrResult.url}</span>
              <button type="button" style={styles.copyButton} onClick={handleCopyLink}>
                {copyLabel}
              </button>
            </div>
            <button type="button" style={styles.primaryButton} onClick={resetForm}>
              เปิดโต๊ะใหม่
            </button>
          </div>
        </div>
      </main>
    );
  }

  // --- Form screen ---
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>เปิดโต๊ะให้ลูกค้า</h1>

        {existingSession && (
          <div style={styles.warningBox}>
            <div style={styles.warningText}>
              โต๊ะนี้มีลูกค้าอยู่ระหว่างทานอาหาร กรุณาปิดออเดอร์เดิมก่อน
            </div>
            <button type="button" style={styles.dangerButton} onClick={handleRequestCloseOld}>
              ปิดออเดอร์เดิม
            </button>
          </div>
        )}

        <form onSubmit={handleOpenTable}>
          <label style={styles.label} htmlFor="tableNumber">
            เลขโต๊ะ
          </label>
          <input
            id="tableNumber"
            type="number"
            inputMode="numeric"
            style={styles.input}
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="เช่น 7"
          />

          <label style={styles.label} htmlFor="adultCount">
            จำนวนผู้ใหญ่
          </label>
          <input
            id="adultCount"
            type="number"
            inputMode="numeric"
            style={styles.input}
            value={adultCount}
            onChange={(e) => setAdultCount(e.target.value)}
            placeholder="เช่น 2"
          />

          <label style={styles.label} htmlFor="childCount">
            จำนวนเด็ก
          </label>
          <input
            id="childCount"
            type="number"
            inputMode="numeric"
            style={styles.input}
            value={childCount}
            onChange={(e) => setChildCount(e.target.value)}
            placeholder="เช่น 0"
          />

          {formError && <div style={styles.errorText}>{formError}</div>}

          <button type="submit" style={styles.primaryButton} disabled={loading}>
            {loading ? 'กำลังเปิดโต๊ะ...' : 'เปิดโต๊ะ'}
          </button>
        </form>
      </div>

      {showConfirmClose && existingSession && (
        <div style={styles.overlay}>
          <div style={styles.confirmBox}>
            <div style={styles.confirmTitle}>ยืนยันปิดโต๊ะเดิม</div>
            <div style={styles.confirmRow}>โต๊ะ {existingSession.table_number}</div>
            <div style={styles.confirmRow}>
              ผู้ใหญ่ {existingSession.adult_count} · เด็ก {existingSession.child_count}
            </div>
            <div style={styles.confirmRow}>
              {getElapsedMinutesText(existingSession.created_at)}
            </div>

            {closeError && <div style={styles.errorText}>{closeError}</div>}

            <div style={styles.confirmButtonRow}>
              <button
                type="button"
                style={styles.cancelButton}
                onClick={handleCancelConfirm}
                disabled={closing}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                style={styles.confirmDangerButton}
                onClick={handleConfirmCloseOld}
                disabled={closing}
              >
                {closing ? 'กำลังปิด...' : 'ยืนยันปิดโต๊ะเดิม'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
