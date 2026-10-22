'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CONFIG, inr, waLink } from './config';
import { useCart } from './CartContext';

export default function CartDrawer() {
  const { lines, count, total, open, setOpen, setQty, toast, checkout } = useCart();
  const [name, setName] = useState('');

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.button
            aria-label="Close bag"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[80] cursor-default bg-slate/45 backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed right-0 top-0 z-[90] flex h-full w-[min(430px,100%)] flex-col bg-cream shadow-[-24px_0_70px_rgba(26,26,26,.28)] transition-transform duration-500 ease-[cubic-bezier(.22,.9,.24,1)] ${
          open ? 'translate-x-0' : 'translate-x-[106%]'
        }`}
        aria-label="Your bag"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-5">
          <h3 className="font-display text-xl font-semibold">
            Your bag {count ? <span className="font-sans text-base text-mute">({count})</span> : null}
          </h3>
          <button
            onClick={() => setOpen(false)}
            className="grid h-10 w-10 place-items-center rounded-full text-lg transition-colors hover:bg-oat"
            aria-label="Close bag"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-auto px-5">
          {lines.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mb-3 text-4xl">🧶</div>
              <p className="text-mute">Your bag is empty.</p>
              <a
                href="#shop"
                onClick={() => setOpen(false)}
                className="mt-5 inline-flex rounded-full border-[1.5px] border-slate px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-slate hover:text-cream"
              >
                Browse the collection
              </a>
            </div>
          ) : (
            lines.map(({ product, qty }) => (
              <div
                key={product.id}
                className="grid grid-cols-[74px_1fr_auto] items-center gap-4 border-b border-line py-4"
              >
                <div
                  className="h-[74px] w-[74px] rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${product.sw[0]}, ${product.sw[1] || product.sw[0]})`,
                  }}
                />
                <div>
                  <b className="block text-[.95rem] leading-snug">{product.name}</b>
                  <small className="text-mute">{inr(product.price)} each</small>
                  <div className="mt-2 inline-flex items-center gap-2.5">
                    <button
                      onClick={() => setQty(product.id, -1)}
                      className="grid h-7 w-7 place-items-center rounded-full border-[1.5px] border-line bg-white transition-transform hover:scale-110"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm">{qty}</span>
                    <button
                      onClick={() => setQty(product.id, 1)}
                      className="grid h-7 w-7 place-items-center rounded-full border-[1.5px] border-line bg-white transition-transform hover:scale-110"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setQty(product.id, -qty)}
                  className="rounded-lg p-2 text-mute transition-colors hover:bg-white hover:text-magenta"
                  aria-label={`Remove ${product.name}`}
                >
                  🗑
                </button>
              </div>
            ))
          )}
        </div>

        <div className="grid gap-3 border-t border-line bg-oat px-5 py-5">
          <div className="flex items-center justify-between">
            <span className="text-sm">Subtotal</span>
            <b className="text-lg">{inr(total)}</b>
          </div>
          <p className="-mt-2 text-xs text-mute">
            Shipping and any custom charges are confirmed on WhatsApp.
          </p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name for the order"
            className="rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-clay"
          />
          <button
            onClick={() => checkout(name)}
            disabled={!count}
            className="w-full rounded-full bg-slate px-7 py-4 font-semibold text-cream transition-colors hover:bg-clay disabled:cursor-not-allowed disabled:opacity-50"
          >
            Order on WhatsApp
          </button>
          <a
            href={waLink(`Hi ${CONFIG.brand}! I have a question about a product.`)}
            target="_blank"
            rel="noopener"
            className="text-center text-xs text-mute underline-offset-4 hover:underline"
          >
            or just ask Rashmi a question
          </a>
        </div>
      </aside>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-full bg-slate px-6 py-3.5 text-[.9rem] text-cream shadow-2xl"
            role="status"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
