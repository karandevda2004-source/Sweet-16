'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CATEGORIES, CONFIG } from './config';
import { useCart } from './CartContext';

const INR = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

const FILTERS = [
  { id: 'all', label: 'Everything' },
  ...CATEGORIES.map((c) => ({ id: c.id, label: c.name })),
];

const ASPECTS = ['4/5', '1', '4/5', '1', '3/4', '4/3'];

function Tilt({ children, disabled }) {
  const ref = useRef(null);
  const raf = useRef(0);

  const onMove = useCallback(
    (e) => {
      if (disabled) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        el.style.transform = `perspective(900px) rotateY(${x * 9}deg) rotateX(${
          -y * 9
        }deg) translateY(-6px)`;
      });
    },
    [disabled]
  );

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transform = '';
  }, []);

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ transformStyle: 'preserve-3d', transition: 'transform .35s cubic-bezier(.2,.9,.2,1)' }}
    >
      {children}
    </div>
  );
}

function ProductCard({ product, categoryLabel, onAdd, disabled }) {
  const pattern = product.sw?.length
    ? `repeating-conic-gradient(from 12deg, ${product.sw[0]} 0 5deg, ${
        product.sw[1] || product.sw[0]
      } 5deg 10deg)`
    : 'linear-gradient(135deg,#B85B35,#8FA89B)';

  return (
    <Tilt disabled={disabled}>
      <article className="group mb-6 overflow-hidden rounded-[1.75rem] border border-line bg-white shadow-[0_10px_30px_-22px_rgba(26,26,26,.5)] transition-shadow duration-300 hover:shadow-[0_40px_70px_-40px_rgba(26,26,26,.6)]">
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: ASPECTS[product.id % ASPECTS.length] }}
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[800ms] ease-[cubic-bezier(.2,.9,.2,1)] group-hover:scale-[1.07]"
            />
          ) : (
            <div
              className="grid h-full w-full place-items-center"
              style={{ background: pattern }}
            >
              <svg
                viewBox="0 0 120 120"
                className="w-1/2 opacity-70"
                fill="none"
                stroke="#FBF8F5"
                strokeWidth="2.4"
                strokeLinecap="round"
              >
                <path d="M20 40c20 14 60 14 80 0M20 60c20 14 60 14 80 0M20 80c20 14 60 14 80 0" />
                <path d="M40 20v80M60 20v80M80 20v80" opacity=".45" />
              </svg>
            </div>
          )}

          <span className="absolute left-3.5 top-3.5 rounded-full bg-cream/95 px-3 py-1.5 text-[.7rem] font-semibold uppercase tracking-[.04em] text-slate">
            {categoryLabel}
          </span>

          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => onAdd(product.id)}
            aria-label={`Add ${product.name} to bag`}
            className="absolute bottom-3.5 right-3.5 grid h-[46px] w-[46px] place-items-center rounded-full bg-slate text-lg text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          >
            +
          </motion.button>
        </div>

        <div className="p-5">
          <h3 className="font-display text-[1.22rem] font-semibold tracking-[-.01em]">
            {product.name}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-mute">{product.description}</p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-[1.05rem] font-semibold">
                ₹{INR.format(product.price)}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-oat px-2 py-1 text-[.66rem] font-medium text-slate/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-1.5">
              {product.sw?.map((color) => (
                <span
                  key={color}
                  className="h-4 w-4 rounded-full border-[1.5px] border-black/10"
                  style={{ background: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </article>
    </Tilt>
  );
}

export default function ProductGrid({ products }) {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const reduce = useReducedMotion();
  const { add } = useCart();

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products.filter((p) => {
      const inCategory = filter === 'all' || p.category === filter;
      const inSearch =
        !term ||
        `${p.name} ${p.description} ${p.tags.join(' ')}`.toLowerCase().includes(term);
      return inCategory && inSearch;
    });
  }, [products, filter, query]);

  const label = (id) => CATEGORIES.find((c) => c.id === id)?.name ?? '';

  return (
    <section id="shop" className="border-y border-line bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <div className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[.72rem] font-semibold uppercase tracking-[.22em] text-clay">
              Featured work
            </p>
            <h2 className="mt-4 font-display text-[clamp(2.1rem,5vw,3.6rem)] font-semibold tracking-[-.02em]">
              The current collection
            </h2>
            <p className="mt-2 text-sm text-mute">
              Every piece is crocheted by hand by {CONFIG.owner}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="relative">
              <svg
                className="absolute left-3.5 top-1/2 w-[15px] -translate-y-1/2 text-mute"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="rounded-full border border-line bg-white py-2 pl-9 pr-4 text-sm outline-none transition-colors focus:border-clay"
                aria-label="Search products"
              />
            </label>
            {FILTERS.map((f) => {
              const active = f.id === filter;
              return (
                <motion.button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  whileTap={{ scale: 0.94 }}
                  className={`rounded-full border px-4 py-2 text-sm font-medium ${
                    active
                      ? 'border-slate bg-slate text-cream'
                      : 'border-line bg-white text-slate hover:border-slate'
                  }`}
                >
                  {f.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
          <AnimatePresence mode="popLayout">
            {visible.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 26, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.55, delay: reduce ? 0 : Math.min(i * 0.04, 0.4) }}
                style={{ breakInside: 'avoid' }}
              >
                <ProductCard
                  product={product}
                  categoryLabel={label(product.category)}
                  onAdd={add}
                  disabled={reduce}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
