'use client';

import { useState, useEffect, useMemo, use } from 'react';
import { supabase } from '../../../lib/supabaseClient';

const BILL_PER_ADULT = 289;
const BILL_PER_CHILD = 145;
const MAX_CART_ROWS = 10;
const QTY_OPTIONS = [1, 2, 3, 4, 5];

const styles = {
  fullscreenMsg: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '2rem',
    fontFamily: 'sans-serif',
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: '#333',
  },
  page: {
    minHeight: '100vh',
    fontFamily: 'sans-serif',
    paddingBottom: '5.5rem', // room for floating cart bar
  },
  topBar: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.9rem 1rem',
    background: '#111',
    color: '#fff',
  },
  topBarTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  billButton: {
    fontSize: '1rem',
    fontWeight: 'bold',
    padding: '0.5rem 0.9rem',
    borderRadius: '8px',
    border: 'none',
    background: '#e67e22',
    color: '#fff',
  },
  tabsRow: {
    display: 'flex',
    overflowX: 'auto',
    gap: '0.5rem',
    padding: '0.8rem 1rem',
    background: '#f7f7f7',
    position: 'sticky',
    top: '3.4rem',
    zIndex: 15,
  },
  tabButton: (active) => ({
    flex: '0 0 auto',
    fontSize: '1.05rem',
    fontWeight: 'bold',
    padding: '0.6rem 1.1rem',
    borderRadius: '999px',
    border: active ? '2px solid #111' : '2px solid #ddd',
    background: active ? '#111' : '#fff',
    color: active ? '#fff' : '#333',
    whiteSpace: 'nowrap',
  }),
  itemsList: {
    padding: '0.5rem 1rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.7rem',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    borderRadius: '12px',
    background: '#fff',
    border: '1px solid #eee',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  itemName: {
    fontSize: '1.15rem',
    fontWeight: 'bold',
    flex: 1,
    paddingRight: '0.8rem',
  },
  itemInCartTag: {
    fontSize: '0.9rem',
    color: '#27ae60',
    fontWeight: 'bold',
    display: 'block',
    marginTop: '0.2rem',
  },
  addButton: {
    flex: '0 0 auto',
    width: '3rem',
    height: '3rem',
    fontSize: '1.6rem',
    fontWeight: 'bold',
    borderRadius: '50%',
    border: 'none',
    background: '#111',
    color: '#fff',
    cursor: 'pointer',
  },
  qtyPickerRow: {
    display: 'flex',
    gap: '0.4rem',
  },
  qtyPickerButton: {
    width: '2.6rem',
    height: '2.6rem',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    borderRadius: '50%',
    border: '2px solid #111',
    background: '#fff',
    color: '#111',
    cursor: 'pointer',
  },
  cartBar: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 25,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.2rem',
    background: '#111',
    color: '#fff',
  },
  cartBarText: {
    fontSize: '1.15rem',
    fontWeight: 'bold',
  },
  cartBarButton: {
    fontSize: '1.15rem',
    fontWeight: 'bold',
    padding: '0.7rem 1.4rem',
    borderRadius: '10px',
    border: 'none',
    background: '#27ae60',
    color: '#fff',
    cursor: 'pointer',
  },
  toast: {
    position: 'fixed',
    bottom: '5.8rem',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#27ae60',
    color: '#fff',
    padding: '0.7rem 1.2rem',
    borderRadius: '999px',
    fontSize: '1rem',
    fontWeight: 'bold',
    zIndex: 30,
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex',
    alignItems: 'flex-end',
    zIndex: 40,
  },
  overlayCentered: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    zIndex: 40,
  },
  modalSheet: {
    background: '#fff',
    width: '100%',
    borderTopLeftRadius: '18px',
    borderTopRightRadius: '18px',
    padding: '1.2rem',
    maxHeight: '75vh',
    overflowY: 'auto',
  },
  modalBox: {
    background: '#fff',
    borderRadius: '16px',
    padding: '1.5rem',
    width: '100%',
    maxWidth: '380px',
  },
  modalTitle: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  cartLine: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.7rem 0',
    borderBottom: '1px solid #eee',
  },
  cartLineName: {
    fontSize: '1.05rem',
    fontWeight: 'bold',
    flex: 1,
  },
  qtyControlGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  smallCircleButton: {
    width: '2.2rem',
    height: '2.2rem',
    borderRadius: '50%',
    border: '2px solid #111',
    background: '#fff',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  removeButton: {
    marginLeft: '0.8rem',
    fontSize: '0.9rem',
    color: '#c0392b',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  submitOrderButton: {
    width: '100%',
    marginTop: '1.2rem',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    padding: '0.9rem',
    borderRadius: '10px',
    border: 'none',
    background: '#27ae60',
    color: '#fff',
    cursor: 'pointer',
  },
  closeModalButton: {
    width: '100%',
    marginTop: '0.6rem',
    fontSize: '1rem',
    padding: '0.7rem',
    borderRadius: '10px',
    border: '2px solid #999',
    background: '#fff',
    color: '#333',
    cursor: 'pointer',
  },
  billRow: {
    fontSize: '1.1rem',
    marginBottom: '0.5rem',
  },
  billTotal: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: '1rem 0',
    color: '#e67e22',
  },
  confirmButtonRow: {
    display: 'flex',
    gap: '0.8rem',
    marginTop: '1rem',
  },
  cancelButton: {
    flex: 1,
    fontSize: '1.05rem',
    padding: '0.8rem',
    borderRadius: '8px',
    border: '2px solid #999',
    background: '#fff',
    color: '#333',
    cursor: 'pointer',
  },
  confirmDangerButton: {
    flex: 1,
    fontSize: '1.05rem',
    fontWeight: 'bold',
    padding: '0.8rem',
    borderRadius: '8px',
    border: 'none',
    background: '#c0392b',
    color: '#fff',
    cursor: 'pointer',
  },
  errorText: {
    color: '#c0392b',
    fontSize: '0.95rem',
    marginTop: '0.5rem',
  },
  emptyCartText: {
    fontSize: '1rem',
    color: '#777',
    textAlign: 'center',
    padding: '1.5rem 0',
  },
};

export default function OrderPage({ params }) {
  // Next.js: params is a Promise in this version — must unwrap with use()
  const { tableNumber } = use(params);
  const tableNumberNum = parseInt(tableNumber, 10);

  const [sessionLoading, setSessionLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [tableNotOpen, setTableNotOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);

  const [cart, setCart] = useState([]); // [{ itemId, name, quantity }]
  const [pickerItemId, setPickerItemId] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartFullMessage, setCartFullMessage] = useState('');

  const [sending, setSending] = useState(false);
  const [orderToast, setOrderToast] = useState('');

  const [showBillConfirm, setShowBillConfirm] = useState(false);
  const [closingBill, setClosingBill] = useState(false);
  const [billError, setBillError] = useState('');
  const [sessionClosed, setSessionClosed] = useState(false);

  useEffect(() => {
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkSession() {
    const { data, error } = await supabase
      .from('sessions')
      .select('id, table_number, adult_count, child_count, status')
      .eq('table_number', tableNumberNum)
      .eq('status', 'open')
      .limit(1);

    if (error || !data || data.length === 0) {
      setTableNotOpen(true);
      setSessionLoading(false);
      return;
    }

    setSession(data[0]);
    setSessionLoading(false);
    loadMenu();
  }

  async function loadMenu() {
    const [{ data: cats }, { data: items }] = await Promise.all([
      supabase.from('menu_categories').select('*').order('sort_order', { ascending: true }),
      supabase.from('menu_items').select('*'),
    ]);

    setCategories(cats || []);
    setMenuItems(items || []);
    if (cats && cats.length > 0) {
      setActiveCategoryId(cats[0].id);
    }
  }

  const visibleItems = useMemo(
    () => menuItems.filter((item) => item.category_id === activeCategoryId),
    [menuItems, activeCategoryId]
  );

  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  function cartQuantityFor(itemId) {
    const line = cart.find((c) => c.itemId === itemId);
    return line ? line.quantity : 0;
  }

  function addToCart(item, qty) {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.itemId === item.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + qty };
        return updated;
      }
      if (prev.length >= MAX_CART_ROWS) {
        setCartFullMessage(`ตะกร้าเต็มแล้ว (สูงสุด ${MAX_CART_ROWS} รายการ)`);
        setTimeout(() => setCartFullMessage(''), 2000);
        return prev;
      }
      return [...prev, { itemId: item.id, name: item.name, quantity: qty }];
    });
    setPickerItemId(null);
  }

  function removeFromCart(itemId) {
    setCart((prev) => prev.filter((c) => c.itemId !== itemId));
  }

  function bumpCartQuantity(itemId, delta) {
    setCart((prev) =>
      prev
        .map((c) => (c.itemId === itemId ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  }

  async function handleSubmitOrder() {
    if (cart.length === 0 || !session || sending) return;
    setSending(true);
    try {
      const { error } = await supabase.from('orders').insert({
        session_id: session.id,
        table_number: tableNumberNum,
        items: cart.map((c) => ({ name: c.name, quantity: c.quantity })),
        status: 'received',
      });

      if (error) {
        setOrderToast('ส่งออเดอร์ไม่สำเร็จ ลองอีกครั้ง');
        setTimeout(() => setOrderToast(''), 2500);
        return;
      }

      setCart([]);
      setShowCartModal(false);
      setOrderToast('ส่งออเดอร์แล้ว');
      setTimeout(() => setOrderToast(''), 2500);
    } finally {
      setSending(false);
    }
  }

  const billTotal = session
    ? session.adult_count * BILL_PER_ADULT + session.child_count * BILL_PER_CHILD
    : 0;

  async function handleConfirmBill() {
    if (!session) return;
    setClosingBill(true);
    setBillError('');
    try {
      const { data, error } = await supabase
        .from('sessions')
        .update({ status: 'closed' })
        .eq('id', session.id)
        .eq('status', 'open')
        .select();

      if (error) {
        setBillError('เกิดข้อผิดพลาด: ' + error.message);
        return;
      }
      if (!data || data.length === 0) {
        setBillError('โต๊ะนี้ถูกปิดไปแล้ว');
        return;
      }

      setShowBillConfirm(false);
      setSessionClosed(true);
    } finally {
      setClosingBill(false);
    }
  }

  // --- Loading ---
  if (sessionLoading) {
    return <main style={styles.fullscreenMsg}>กำลังตรวจสอบโต๊ะ...</main>;
  }

  // --- Table not open ---
  if (tableNotOpen) {
    return (
      <main style={styles.fullscreenMsg}>
        โต๊ะนี้ยังไม่เปิดใช้งาน
        <br />
        กรุณาแจ้งพนักงาน
      </main>
    );
  }

  // --- Session closed (bill paid) ---
  if (sessionClosed) {
    return <main style={styles.fullscreenMsg}>ขอบคุณที่ใช้บริการ 🙏</main>;
  }

  // --- Main ordering UI ---
  return (
    <main style={styles.page}>
      <div style={styles.topBar}>
        <span style={styles.topBarTitle}>โต๊ะ {session.table_number}</span>
        <button
          type="button"
          style={styles.billButton}
          onClick={() => {
            setBillError('');
            setShowBillConfirm(true);
          }}
        >
          เรียกเก็บเงิน
        </button>
      </div>

      <div style={styles.tabsRow}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            style={styles.tabButton(cat.id === activeCategoryId)}
            onClick={() => setActiveCategoryId(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div style={styles.itemsList}>
        {visibleItems.map((item) => {
          const inCartQty = cartQuantityFor(item.id);
          return (
            <div key={item.id} style={styles.itemRow}>
              <div>
                <div style={styles.itemName}>{item.name}</div>
                {inCartQty > 0 && (
                  <span style={styles.itemInCartTag}>ในตะกร้า {inCartQty}</span>
                )}
              </div>

              {pickerItemId === item.id ? (
                <div style={styles.qtyPickerRow}>
                  {QTY_OPTIONS.map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      style={styles.qtyPickerButton}
                      onClick={() => addToCart(item, qty)}
                    >
                      {qty}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  type="button"
                  style={styles.addButton}
                  onClick={() => setPickerItemId(item.id)}
                  aria-label={`เพิ่ม ${item.name}`}
                >
                  +
                </button>
              )}
            </div>
          );
        })}
        {visibleItems.length === 0 && (
          <div style={styles.emptyCartText}>ไม่มีเมนูในหมวดนี้</div>
        )}
      </div>

      {cartFullMessage && <div style={styles.toast}>{cartFullMessage}</div>}
      {orderToast && <div style={styles.toast}>{orderToast}</div>}

      <div style={styles.cartBar} onClick={() => setShowCartModal(true)}>
        <span style={styles.cartBarText}>
          🛒 ตะกร้า {cartCount > 0 ? `(${cartCount})` : ''}
        </span>
        <button
          type="button"
          style={styles.cartBarButton}
          onClick={(e) => {
            e.stopPropagation();
            setShowCartModal(true);
          }}
        >
          ดูตะกร้า
        </button>
      </div>

      {showCartModal && (
        <div style={styles.overlay} onClick={() => setShowCartModal(false)}>
          <div style={styles.modalSheet} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>ตะกร้าของคุณ</div>

            {cart.length === 0 && (
              <div style={styles.emptyCartText}>ยังไม่มีรายการในตะกร้า</div>
            )}

            {cart.map((line) => (
              <div key={line.itemId} style={styles.cartLine}>
                <span style={styles.cartLineName}>{line.name}</span>
                <div style={styles.qtyControlGroup}>
                  <button
                    type="button"
                    style={styles.smallCircleButton}
                    onClick={() => bumpCartQuantity(line.itemId, -1)}
                  >
                    −
                  </button>
                  <span>{line.quantity}</span>
                  <button
                    type="button"
                    style={styles.smallCircleButton}
                    onClick={() => bumpCartQuantity(line.itemId, 1)}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    style={styles.removeButton}
                    onClick={() => removeFromCart(line.itemId)}
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              style={styles.submitOrderButton}
              onClick={handleSubmitOrder}
              disabled={cart.length === 0 || sending}
            >
              {sending ? 'กำลังส่ง...' : 'ส่งออเดอร์'}
            </button>
            <button
              type="button"
              style={styles.closeModalButton}
              onClick={() => setShowCartModal(false)}
            >
              ปิด
            </button>
          </div>
        </div>
      )}

      {showBillConfirm && (
        <div style={styles.overlayCentered}>
          <div style={styles.modalBox}>
            <div style={styles.modalTitle}>ยืนยันเรียกเก็บเงิน</div>
            <div style={styles.billRow}>ผู้ใหญ่ {session.adult_count} คน</div>
            <div style={styles.billRow}>เด็ก {session.child_count} คน</div>
            <div style={styles.billTotal}>รวม {billTotal.toLocaleString()} บาท</div>

            {billError && <div style={styles.errorText}>{billError}</div>}

            <div style={styles.confirmButtonRow}>
              <button
                type="button"
                style={styles.cancelButton}
                onClick={() => setShowBillConfirm(false)}
                disabled={closingBill}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                style={styles.confirmDangerButton}
                onClick={handleConfirmBill}
                disabled={closingBill}
              >
                {closingBill ? 'กำลังปิด...' : 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
