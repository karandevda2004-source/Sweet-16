# Rashmi Loom — Handmade Crochet Studio
### Visual architecture, motion spec and production notes

Rashmi's one-woman crochet studio in Indore. The name carries her, the craft is the product.

Two deliverables live here:

| Path | What it is |
| --- | --- |
| `stitch-studio/index.html` | Complete, runnable, fully functional single-file site. Tailwind CDN + GSAP/ScrollTrigger + Lenis + Three.js. Open it in a browser — no build. |
| `stitch-studio/assets/products.js` | The 12 base64 product photographs reused from `RashmiCrafts.html` (no network needed). |
| `stitch-studio-react/Hero.jsx` | React + Framer Motion + React Three Fiber hero (3D yarn ball, split-type reveal, magnetic CTAs). |
| `stitch-studio-react/ProductGrid.jsx` | Masonry grid, pointer tilt, filter + live search, layout animation. |
| `stitch-studio-react/CartContext.jsx` | Cart state, `localStorage` persistence, WhatsApp order builder. |
| `stitch-studio-react/CartDrawer.jsx` | Bag drawer, quantity stepper, checkout-on-WhatsApp, toast. |
| `stitch-studio-react/CustomCursor.jsx` | The trailing-yarn cursor (canvas trail + crochet-hook pointer). |
| `stitch-studio-react/config.js` | Brand config, catalogue, and the six process steps. |

### What actually works

| Feature | Behaviour |
| --- | --- |
| **Bag** | Add from a card, quick-view modal, or bag drawer. Quantity +/−, remove, live subtotal, `localStorage` persistence, badge count. |
| **Checkout** | Builds a formatted WhatsApp order (itemised, with total and customer name) and opens `wa.me` — no payment gateway, no back end, exactly how a small studio actually sells. |
| **Quick view** | Click any product image for a large photo, full description, tags, price and a direct "Ask on WhatsApp about this item" link. |
| **Search** | Live search in the nav (and the mobile menu) across names, descriptions and tags, with a "nothing matches" state. |
| **Custom order form** | Name, phone, item type, quantity, date needed and details → a structured WhatsApp request. |
| **Contact** | WhatsApp, `tel:`, `mailto:` and Instagram links wired from one `CONFIG` block. |
| **Process** | Six steps, each with a real photograph from the archive, a slow Ken-Burns drift and a graded scrim. |
| **Newsletter** | Validated email, inline confirmation (swap the handler for Klaviyo/Mailchimp later). |
| **Keyboard** | `Esc` closes the bag and quick view, `Enter` opens quick view, focus-visible rings throughout. |

---

## 1. Visual architecture

### 1.1 Design tokens

| Token | Hex | Role |
| --- | --- | --- |
| Cream | `#FBF8F5` | Page ground, warm and paper-like |
| Oatmeal | `#F1E8DE` | Section alternation, chips, swatch wells |
| Deep Clay | `#B85B35` | Brand colour, yarn ball, category cards |
| Clay Light | `#E8B08A` | Thread highlights, 3D specular crown |
| Soft Sage | `#8FA89B` | Secondary accent, process labels, floating rings |
| Electric Magenta | `#FF2A85` | Interaction only — hover, CTA, focus ring, live seam |
| Dark Slate | `#1A1A1A` | Text, solid buttons, contrast sections |

Type: **Fraunces** (variable serif, optical sizing) for display; **Inter** for UI/body. The serif carries the "editorial" register, the grotesque carries the "digital" register — the tension between them *is* the "yarn meets high digital art" brief.

Texture: a fixed SVG `feTurbulence` grain layer at `multiply` over everything (`.paper`), plus a 45°/-45° weave overlay on every product card (`.fabric`).

### 1.2 Layout grid

- Max width `1180px`, gutter `20px` mobile → `32px` desktop, 12-column mental model.
- Hero is a 2-up split: copy occupies columns 1–6, the 3D ball floats in columns 7–12 (offset `x = +1.15` world units, scaled `0.78` below 900px).
- The scroll rail is a fixed 26px column pinned to the viewport's left edge (hidden under 900px).
- Product grid is a true CSS-columns masonry (1 / 2 / 3 columns) with `break-inside: avoid`, so card heights stay organic instead of grid-rowed.

### 1.3 Section-by-section

| # | Section | Behaviour |
| --- | --- | --- |
| 00 | **Stitch rail** | Fixed left SVG. A dashed "needle path" reveals a magenta stitch pattern downward as a clip-path grows with scroll progress; the hook bead slides to the current position. Stitches travel (`stroke-dashoffset`) so it reads as knitting, not filling. |
| 01 | **Nav** | Glassmorphism pill (blur 18px + saturate 1.4). Magnetic links displace ≤11px toward the cursor. Cart is a rolling yarn ball: three concentric dashed circles rotating at different speeds, badge pops on add. |
| 02 | **Hero** | Three.js: a sphere with a custom fragment shader that fakes wound yarn — the strand height field is evaluated three times (centre + two finite differences) so the normal map is rebuilt per pixel, giving real rounded strands. A "seam" angle opens and frays when the pointer moves fast, glowing magenta. A tube-geometry thread leaves the ball and chases the cursor. Title reveals per-line with a `yPercent: 115 → 0` mask, `expo.out`, 75ms stagger. |
| 03 | **Ticker** | Two duplicated marquee spans, 34s linear, pauses on hover. |
| 04 | **Stacked categories** | 4 `position: sticky` cards at increasing `top` offsets (96/130/164/198px) → each card slides up and covers the previous, leaving a 34px sliver, with a scrubbed `scale: .94 → 1`. Collapses to a normal stack under 768px. |
| 05 | **Product grid** | Asymmetric masonry. Hover: image scale 1.07, card shadow deepens, a fabric weave overlay shows, an `+` FAB slides up from below the frame. Pointer-tracked 3D tilt (±9° with 900px perspective). Chips carry `Skill Level` and `Material`. |
| 06 | **Build your pattern** | A live canvas stitch renderer: 5 yarns × 4 stitch types (single crochet, double crochet, basket weave, shell fan) redrawn as real stitch geometry, not a static image. Swatches and stitch buttons recolour the swatch instantly. |
| 07 | **Process (horizontal)** | Pinned section; the track translates on X for `scrollWidth - innerWidth + 80` px with `scrub: 1`. Six steps, each with a real photograph from the archive under a slow Ken-Burns drift. |
| 08 | **Custom order** | A structured brief (name, phone, type, quantity, date needed, details) that composes a WhatsApp message. Beside it: what Rashmi can take on, at volume. |
| 09 | **Community wall** | 20 reel tiles on a reversed marquee, each randomly rotated so the wall feels hand-pinned rather than gridded, each linking to Instagram. |
| 10 | **Footer** | Oversized editorial CTA, newsletter form with inline confirmation, a rotating SVG yarn-ball illustration, four link columns, and a meta strip. |

**Persistent furniture:** bag drawer (right, slides in over a scrim), quick-view modal, toast, back-to-top, sticky glass nav with mobile panel.

### 1.4 Motion vocabulary

| Interaction | Curve | Duration |
| --- | --- | --- |
| Hero word reveal | `expo.out` | 1150ms, 75ms stagger |
| Button press (squish) | `cubic-bezier(.2,1.5,.4,1)` | 280ms, scale `0.94` |
| Card hover lift | `cubic-bezier(.2,.9,.2,1)` | 350ms |
| Section reveal | `power3.out` | 900ms, 28px rise |
| Stacked card scrub | linear + `scrub: .6` | scroll-linked |
| Horizontal story | linear + `scrub: 1` | scroll-linked |
| Cursor trail | spring-ish lerp `0.22` | 60fps |
| Yarn seam open | lerp `0.08` | ~500ms to open |

Every one of these collapses to a no-op under `prefers-reduced-motion: reduce`, and the reveals fall back to visible content.

---

## 2. Library recommendations for the tactile yarn effects

| Library | Use | Why |
| --- | --- | --- |
| **Three.js** (or **@react-three/fiber**) | The hero yarn ball, the unraveling thread, floating stitch rings | Full control over the shader. A hand-written fragment shader (strand height field + finite-difference normals) is the only way to get genuinely round-looking wound yarn; a normal-map texture reads as plastic. |
| **GSAP + ScrollTrigger** | Stacking cards, horizontal pin, scrubbed parallax, rail progress | ScrollTrigger's pinning + `scrub` is still the most reliable way to do "cards slide over each other" and pinned horizontal rails. Framer Motion's `useScroll` is good but pinning is weaker there. |
| **Framer Motion** | Component-level micro-interactions (springs, layout, `AnimatePresence` filters) | Best-in-class spring physics and layout animation for filter changes in a masonry grid. |
| **Lenis** | Smooth scroll | Feeds `ScrollTrigger.update` from its scroll event; GSAP's ticker drives `lenis.raf`. Disable on touch to avoid fighting the OS. |
| **@react-three/drei** | `<Float>`, `<MeshDistortMaterial>`, `<Environment>`, `useTexture` | If you want a quick plush/variant without hand-rolling: `MeshDistortMaterial` gives a squishy organic surface in one line. |
| **three-custom-shader-material** (or `three-nebula`) | Sharing the same GLSL between React and vanilla | Lets the yarn ball shader live in one file and be reused in both builds. |
| **Simplex noise / `glsl-noise`** | Fibre fuzz and slubs in the strand shader | Adds the "hand-spun, slightly irregular" quality that separates yarn from plastic. |
| **Canvas 2D (custom)** | The cursor thread and the stitch-pattern renderer | The cursor trail needs per-frame line work at 60fps — a 2D canvas overlay is lighter than WebGL and easier to make "stitchy". The stitch renderer only changes on click, so 2D is plenty. |
| **Canvas-Confetti / `canvas-confetti`** | Add-to-bag celebration | Use sparingly — a burst of yarn-coloured yarn scraps on "Add to bag". |
| **Sharp** | Responsive image derivatives for the product photos | The prototype inlines base64 JPEGs (single-file, offline); production should serve AVIF/WebP through `next/image` with `sharp`. |
| **Motion One / `motion`** | Vanilla alternative to Framer Motion | If you stay framework-free, Motion One is ~5kb and covers the squish/tilt springs. |

**Not recommended:** ScrollMagic (abandoned), two.js and Awwwards-style cursor libraries (they conflict with a custom trail), and WebGL for the cursor (a full-screen shader per frame for a 2px line is wasteful).

---

## 3. Performance budget

- Target: 60fps on a 2021 mid-range laptop, 3G+ on first paint.
- The 3D scene is the only heavy element: one 72×72 sphere, one rebuilt tube, seven torus rings. The render loop **pauses when the hero leaves the viewport** (`IntersectionObserver`) and when the tab is hidden.
- `?no3d` disables the WebGL scene entirely and falls back to a CSS-rendered yarn ball; `?once` renders a single frame (used for QA/capture).
- The fragment shader is the cost centre — cap `dpr` at 2, and consider swapping the finite-difference normals for a baked normal map if frame time exceeds 8ms.
- All product imagery is lazy-loaded; the critical hero path loads no raster assets.
- Reserve layout space for the hero canvas (`min-h-[100svh]`) so CLS stays at 0.

---

## 4. Accessibility

- `prefers-reduced-motion` disables the 3D loop, marquee, reveals, tilts and the custom cursor, and forces all content visible.
- The custom cursor is only mounted for `pointer: fine`; touch and mouse users keep the native cursor.
- Focus states use the magenta ring; the hover-only `+` button is also reachable by keyboard inside the card.
- Contrast: slate on cream ≈ 15:1, white on clay ≈ 4.6:1, white on magenta ≈ 4.1:1 (use slate text on magenta for body copy).

---

## 5. Wiring the real store

1. **One config block.** `CONFIG` in `stitch-studio/index.html` (and `stitch-studio-react/config.js`) holds the brand, WhatsApp number, email, Instagram handle and city. Change it once, everything updates.
2. **The WhatsApp number is still the placeholder `919752524222`** inherited from `RashmiCrafts.html` — set the real number before going live, or orders will go nowhere.
3. `PRODUCTS` / `CATS` are plain arrays — swap them for an API payload (a Google Sheet, a Notion database or a Shopify Storefront API all work) without touching the render code.
4. Products need a `image` (URL), `price`, `category`, `tags[]` and `sw[]` (swatch colours for the little colour dots). Pattern PDFs use a gradient tile instead of a photo.
5. Shipping, GST and payment: for a part-time studio the WhatsApp hand-off usually beats a payment gateway. Add Razorpay only when volume justifies it.

## 6. Running it

```bash
# prototype — any static server, no build step
cd "stitch-studio" && python3 -m http.server 8080
# open http://localhost:8080
```

React build (Vite or Next.js):

```bash
npm i three @react-three/fiber @react-three/drei framer-motion gsap lenis
npm i -D tailwindcss postcss autoprefixer
```

Mount order in the React app:

```jsx
<CartProvider>
  <YarnCursor />
  <Hero />
  <ProductGrid products={PRODUCTS} />
  <CartDrawer />
</CartProvider>
```
