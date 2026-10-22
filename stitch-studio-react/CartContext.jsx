'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CONFIG, inr, PRODUCTS, waLink } from './config';

const CartContext = createContext(null);
const STORAGE_KEY = 'rl_bag';

export function CartProvider({ children }) {
  const [items, setItems] = useState({});
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch (e) {
      setItems({});
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      return undefined;
    }
    return undefined;
  }, [items]);

  const flash = useCallback((message) => {
    setToast(message);
    window.clearTimeout(flash.timer);
    flash.timer = window.setTimeout(() => setToast(''), 2400);
  }, []);

  const add = useCallback(
    (id, qty = 1) => {
      const product = PRODUCTS.find((p) => p.id === Number(id));
      if (!product) return;
      setItems((prev) => ({ ...prev, [id]: (prev[id] || 0) + qty }));
      flash(`${product.name} added to your bag`);
    },
    [flash]
  );

  const setQty = useCallback((id, delta) => {
    setItems((prev) => {
      const next = Math.max(0, (prev[id] || 0) + delta);
      const copy = { ...prev };
      if (next) copy[id] = next;
      else delete copy[id];
      return copy;
    });
  }, []);

  const lines = useMemo(
    () =>
      Object.entries(items)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => ({
          product: PRODUCTS.find((p) => p.id === Number(id)),
          qty,
        }))
        .filter((l) => l.product),
    [items]
  );

  const count = lines.reduce((sum, l) => sum + l.qty, 0);
  const total = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);

  const orderMessage = useCallback(
    (name = '') =>
      `Hi ${CONFIG.brand}! I'd like to order:\n${lines
        .map((l) => `• ${l.product.name} × ${l.qty} = ${inr(l.product.price * l.qty)}`)
        .join('\n')}\n\nTotal: ${inr(total)}\nName: ${name || '—'}`,
    [lines, total]
  );

  const value = useMemo(
    () => ({
      items,
      lines,
      count,
      total,
      open,
      setOpen,
      toast,
      add,
      setQty,
      flash,
      orderMessage,
      checkout: (name) => window.open(waLink(orderMessage(name)), '_blank'),
    }),
    [items, lines, count, total, open, toast, add, setQty, flash, orderMessage]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
