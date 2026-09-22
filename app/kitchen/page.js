'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';

const ACTIVE_STATUSES = ['received', 'cooking'];

const styles = {
  page: {
    minHeight: '100vh',
    background: '#1a1a1a',
    fontFamily: 'sans-serif',
    padding: '1.5rem',
  },
  header: {
    color: '#fff',
    fontSize: '1.8rem',
    fontWeight: 'bold',
    marginBottom: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countBadge: {
    fontSize: '1.2rem',
    background: '#333',
    padding: '0.4rem 1rem',
    borderRadius: '999px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.2rem',
  },
  emptyText: {
    color: '#888',
    fontSize: '1.5rem',
    textAlign: 'center',
    padding: '4rem 0',
  },
  card: (isCooking) => ({
    borderRadius: '16px',
    padding: '1.2rem',
    background: isCooking ? '#e67e22' : '#fff',
    color: isCooking ? '#fff' : '#111',
    border: isCooking ? '4px solid #d35400' : '4px solid #3498db',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
  }),
  cardTop: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  tableNumber: {
    fontSize: '2.4rem',
    fontWeight: 'bold',
    lineHeight: 1,
  },
  orderTime: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    opacity: 0.85,
  },
  itemsList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  itemLine: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'space-between',
  },
  buttonRow: {
    display: 'flex',
    gap: '0.6rem',
    marginTop: '0.4rem',
  },
  startButton: {
    flex: 1,
    fontSize: '1.15rem',
    fontWeight: 'bold',
    padding: '0.8rem',
    borderRadius: '10px',
    border: 'none',
    background: '#e67e22',
    color: '#fff',
    cursor: 'pointer',
  },
  startButtonOnCookingCard: {
    flex: 1,
    fontSize: '1.15rem',
    fontWeight: 'bold',
    padding: '0.8rem',
    borderRadius: '10px',
    border: '2px solid #fff',
    background: 'rgba(0,0,0,0.2)',
    color: '#fff',
    cursor: 'default',
    opacity: 0.7,
  },
  servedButton: {
    flex: 1,
    fontSize: '1.15rem',
    fontWeight: 'bold',
    padding: '0.8rem',
    borderRadius: '10px',
    border: 'none',
    background: '#27ae60',
    color: '#fff',
    cursor: 'pointer',
  },
  cookingTag: {
    fontSize: '0.95rem',
    fontWeight: 'bold',
    background: 'rgba(255,255,255,0.25)',
    padding: '0.2rem 0.6rem',
    borderRadius: '999px',
    alignSelf: 'flex-start',
  },
};

function formatTime(createdAt) {
  return new Date(createdAt).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function parseItems(items) {
  if (Array.isArray(items)) return items;
  if (typeof items === 'string') {
    try {
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);

  const loadInitialOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .in('status', ACTIVE_STATUSES)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setOrders(data);
    }
  }, []);

  useEffect(() => {
    loadInitialOrders();

    const channel = supabase
      .channel('kitchen-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const newOrder = payload.new;
          if (!ACTIVE_STATUSES.includes(newOrder.status)) return;
          setOrders((prev) => {
            if (prev.some((o) => o.id === newOrder.id)) return prev;
            return [...prev, newOrder];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const updated = payload.new;
          setOrders((prev) => {
            if (!ACTIVE_STATUSES.includes(updated.status)) {
              // e.g. moved to 'served' from elsewhere -> drop it
              return prev.filter((o) => o.id !== updated.id);
            }
            const idx = prev.findIndex((o) => o.id === updated.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = updated;
              return copy;
            }
            return [...prev, updated];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadInitialOrders]);

  async function handleStartCooking(order) {
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: 'cooking' } : o))
    );
    await supabase
      .from('orders')
      .update({ status: 'cooking' })
      .eq('id', order.id)
      .eq('status', 'received');
  }

  async function handleServed(order) {
    // Remove from screen immediately
    setOrders((prev) => prev.filter((o) => o.id !== order.id));
    await supabase.from('orders').update({ status: 'served' }).eq('id', order.id);
  }

  return (
    <main style={styles.page}>
      <div style={styles.header}>
        <span>จอครัว — สุกี้ผีน้อย</span>
        <span style={styles.countBadge}>{orders.length} ออเดอร์</span>
      </div>

      {orders.length === 0 ? (
        <div style={styles.emptyText}>ยังไม่มีออเดอร์ค้าง</div>
      ) : (
        <div style={styles.grid}>
          {orders.map((order) => {
            const isCooking = order.status === 'cooking';
            const items = parseItems(order.items);
            return (
              <div key={order.id} style={styles.card(isCooking)}>
                <div style={styles.cardTop}>
                  <span style={styles.tableNumber}>โต๊ะ {order.table_number}</span>
                  <span style={styles.orderTime}>{formatTime(order.created_at)}</span>
                </div>

                {isCooking && <span style={styles.cookingTag}>กำลังทำ</span>}

                <ul style={styles.itemsList}>
                  {items.map((item, idx) => (
                    <li key={idx} style={styles.itemLine}>
                      <span>{item.name}</span>
                      <span>x{item.quantity}</span>
                    </li>
                  ))}
                </ul>

                <div style={styles.buttonRow}>
                  {isCooking ? (
                    <span style={styles.startButtonOnCookingCard}>เริ่มทำแล้ว</span>
                  ) : (
                    <button
                      type="button"
                      style={styles.startButton}
                      onClick={() => handleStartCooking(order)}
                    >
                      เริ่มทำ
                    </button>
                  )}
                  <button
                    type="button"
                    style={styles.servedButton}
                    onClick={() => handleServed(order)}
                  >
                    จัดเสิร์ฟแล้ว
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
