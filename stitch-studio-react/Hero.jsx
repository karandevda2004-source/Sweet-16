'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { CONFIG } from './config';

const PALETTE = {
  cream: '#FBF8F5',
  clay: '#B85B35',
  clayLight: '#E8B08A',
  sage: '#8FA89B',
  magenta: '#FF2A85',
  slate: '#1A1A1A',
};

const WORDS = ['Weaving', 'color', 'into every', 'loop.'];

function usePointerNDC() {
  const pointer = useRef({ x: 0, y: 0, speed: 0 });
  const { viewport } = useThree();

  useEffect(() => {
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      pointer.current.speed = Math.min(1, Math.hypot(x - pointer.current.x, y - pointer.current.y) * 3.2);
      pointer.current.x = x;
      pointer.current.y = y;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return pointer;
}

const yarnVertex = `
  varying vec3 vN;
  varying vec3 vP;
  varying vec3 vView;
  void main(){
    vP = position;
    vN = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const yarnFragment = `
  precision highp float;
  uniform float uTime;
  uniform float uSeam;
  uniform float uOpen;
  uniform vec3 uA;
  uniform vec3 uB;
  uniform vec3 uC;
  varying vec3 vN;
  varying vec3 vP;
  varying vec3 vView;

  float strand(float a, float b){
    float s = sin(a * 23.0 + b * 27.0 + 0.9 * sin(a * 3.0 + b * 2.0 + uTime * 0.12));
    float h = smoothstep(-0.45, 0.95, s);
    float d = abs(mod(a - uSeam + 3.14159, 6.28318) - 3.14159);
    float fray = smoothstep(0.30, 0.02, d);
    return mix(h, h * 0.35 + 0.22 * sin(b * 40.0), fray);
  }

  void main(){
    vec3 n = normalize(vP);
    float a = atan(n.z, n.x);
    float b = acos(clamp(n.y, -1.0, 1.0));
    float e = 0.006;
    float h0 = strand(a, b);
    float ha = strand(a + e, b);
    float hb = strand(a, b + e);
    vec3 N = normalize(vN);
    vec3 T = normalize(cross(vec3(0.0, 1.0, 0.0), N) + 1e-5);
    vec3 B = cross(N, T);
    vec3 Nb = normalize(N - (((ha - h0) / e) * T + ((hb - h0) / e) * B) * 0.055);
    vec3 L = normalize(vec3(0.55, 0.85, 0.75));
    float diff = max(dot(Nb, L), 0.0);
    float rim = pow(1.0 - max(dot(Nb, normalize(vView)), 0.0), 2.4);
    vec3 col = mix(uC, uA, 0.30 + 0.70 * h0);
    col = mix(col, uB, pow(h0, 3.0) * 0.85);
    col *= 0.42 + 0.85 * diff;
    col += uB * rim * 0.30;
    float d = abs(mod(a - uSeam + 3.14159, 6.28318) - 3.14159);
    col += vec3(1.0, 0.165, 0.52) * smoothstep(0.34, 0.0, d) * uOpen * 0.9;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function YarnBall({ pointer }) {
  const mesh = useRef();
  const material = useRef();
  const seam = useRef(0);
  const open = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSeam: { value: 0 },
      uOpen: { value: 0 },
      uA: { value: new THREE.Color(PALETTE.clay) },
      uB: { value: new THREE.Color(PALETTE.clayLight) },
      uC: { value: new THREE.Color('#3A231A') },
    }),
    []
  );

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const p = pointer.current;
    if (material.current) {
      material.current.uniforms.uTime.value = t;
      seam.current = Math.sin(t * 0.35) * 1.5 + p.x * 0.8;
      material.current.uniforms.uSeam.value = seam.current;
      open.current = THREE.MathUtils.lerp(open.current, Math.min(1, p.speed * 1.6), 0.08);
      material.current.uniforms.uOpen.value = open.current;
    }
    if (mesh.current) {
      mesh.current.rotation.y += (p.x * 0.5 - mesh.current.rotation.y) * 0.045;
      mesh.current.rotation.x += (-p.y * 0.28 - mesh.current.rotation.x) * 0.045;
      mesh.current.rotation.z = Math.sin(t * 0.22) * 0.06;
    }
    p.speed *= 0.9;
  });

  return (
    <mesh ref={mesh} position={[1.15, 0.05, 0]}>
      <sphereGeometry args={[1.55, 72, 72]} />
      <shaderMaterial
        ref={material}
        vertexShader={yarnVertex}
        fragmentShader={yarnFragment}
        uniforms={uniforms}
      />
    </mesh>
  );
}

function UnravelingThread({ pointer }) {
  const mesh = useRef();
  const points = useMemo(() => Array.from({ length: 9 }, () => new THREE.Vector3()), []);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  const world = useMemo(() => new THREE.Vector3(), []);
  const anchor = useMemo(() => new THREE.Vector3(), []);
  const goal = useMemo(() => new THREE.Vector3(), []);
  const { viewport } = useThree();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const p = pointer.current;
    world.set(p.x * (viewport.width / 2), p.y * (viewport.height / 2), 0);
    const seam = Math.sin(t * 0.35) * 1.5;
    anchor.set(Math.cos(seam) * 1.35, 0.3, Math.sin(seam) * 1.35);
    points.forEach((pt, i) => {
      const f = i / (points.length - 1);
      goal.copy(anchor).lerp(world, Math.pow(f, 0.75));
      goal.y += Math.sin(t * 1.6 + i * 0.9) * 0.09 * (1 - f);
      goal.z += Math.sin(t * 1.1 + i * 0.6) * 0.07 * (1 - f);
      pt.lerp(goal, 0.18 - f * 0.09);
    });
    if (mesh.current) {
      const next = new THREE.TubeGeometry(curve, 70, 0.035, 8, false);
      mesh.current.geometry.dispose();
      mesh.current.geometry = next;
    }
  });

  return (
    <mesh ref={mesh}>
      <tubeGeometry args={[curve, 70, 0.035, 8, false]} />
      <meshBasicMaterial color={PALETTE.clay} transparent opacity={0.95} />
    </mesh>
  );
}

function FloatingRings() {
  const group = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current?.children.forEach((child, i) => {
      const a = t * (0.25 + i * 0.04) * (i % 2 ? 1 : -1) + i * 0.9;
      child.position.set(
        Math.cos(a) * (1.9 + i * 0.16),
        Math.sin(a * 1.3) * 0.9,
        Math.sin(a) * (1.9 + i * 0.16) * 0.7 - 0.4
      );
      child.rotation.z = a * 0.4;
    });
  });
  return (
    <group ref={group}>
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.16 + i * 0.02, 0.012, 8, 40]} />
          <meshBasicMaterial color={PALETTE.sage} transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function Scene() {
  const pointer = usePointerNDC();
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={0.4} />
      <YarnBall pointer={pointer} />
      <UnravelingThread pointer={pointer} />
      <FloatingRings />
    </>
  );
}

function SplitLine({ children, delay = 0, className = '' }) {
  return (
    <span className={`block overflow-hidden ${className}`}>
      <motion.span
        className="block will-change-transform"
        initial={{ y: '115%' }}
        animate={{ y: '0%' }}
        transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1], delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

function Magnetic({ children, className = '', strength = 0.35, href = '#' }) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
  };

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = 'translate(0,0)';
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      className={className}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 420, damping: 18 }}
    >
      {children}
    </motion.a>
  );
}

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useSpring(scrollYProgress, { stiffness: 90, damping: 22 });
  const copyY = useTransform(y, [0, 1], [0, 120]);
  const copyOpacity = useTransform(y, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-cream"
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 5.2], fov: 38 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        >
          <Scene />
        </Canvas>
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(56% 60% at 70% 46%, rgba(251,248,245,0) 0%, rgba(251,248,245,.10) 44%, rgba(251,248,245,.88) 82%)',
        }}
      />

      <motion.div
        style={{ y: copyY, opacity: copyOpacity }}
        className="relative z-10 mx-auto w-full max-w-[1180px] px-5 pt-32 sm:px-8"
      >
        <div className="max-w-[640px]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3.5 py-1.5 text-[.72rem] font-semibold uppercase tracking-[.16em]"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-magenta" />
            Handmade by {CONFIG.owner} · {CONFIG.city}
          </motion.div>

          <h1 className="font-display text-[clamp(3rem,8.2vw,6.6rem)] font-semibold leading-[.92] tracking-[-.03em]">
            {WORDS.map((word, i) => (
              <SplitLine key={word} delay={0.15 + i * 0.075}>
                <span className={i === 1 ? 'italic text-clay' : ''}>{word}</span>
              </SplitLine>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.9 }}
            className="mt-8 max-w-[46ch] text-[1.05rem] leading-relaxed text-mute sm:text-[1.15rem]"
          >
            A one-woman studio. {CONFIG.owner} crochets every potli, plushie, festive thali
            and pattern by hand in {CONFIG.city} — slowly, in small batches, with yarn she
            actually likes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.62, duration: 0.9 }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <Magnetic
              href="#shop"
              className="inline-flex items-center gap-2.5 rounded-full bg-slate px-7 py-4 font-semibold text-cream transition-colors hover:bg-clay"
            >
              Explore collection
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M5 12h13M13 6l6 6-6 6" />
              </svg>
            </Magnetic>
            <Magnetic
              href="#customizer"
              strength={0.22}
              className="inline-flex items-center rounded-full border-[1.5px] border-slate px-7 py-4 font-semibold text-slate transition-colors hover:bg-slate hover:text-cream"
            >
              Get DIY patterns
            </Magnetic>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.9 }}
            className="mt-14 flex items-center gap-8 text-sm"
          >
            {[
              ['12k+', 'loops pulled'],
              ['38', 'original patterns'],
              ['4.9', 'from 2,140 makers'],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="font-display text-3xl font-semibold">{value}</dt>
                <dd className="text-mute">{label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </motion.div>

      <div className="pointer-events-none absolute bottom-6 right-6 z-10 hidden items-center gap-3 text-[.7rem] font-semibold uppercase tracking-[.18em] text-mute sm:flex">
        <span className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white/70">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M12 5v14M6 13l6 6 6-6" />
          </svg>
        </span>
        Scroll to unspool
      </div>
    </section>
  );
}
