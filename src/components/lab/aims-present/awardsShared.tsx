import React, { useMemo, useRef, useEffect } from 'react';
import { Variants, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { AWARDS } from './templates';

// Shared entrance choreography for award slides: children rise + fade in, staggered.
export const awardsContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13, delayChildren: 0.15 } },
};
export const awardsItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90, damping: 16 } },
};

// Keyframes shared by the awards slides. Names are prefixed `ssa` to avoid clashes.
export const awardsKeyframes = `
@keyframes ssaDropIn { from { opacity: 0; transform: translateY(-2cqmin); } to { opacity: 1; transform: none; } }
@keyframes ssaRiseUp { from { opacity: 0; transform: translateY(2.5cqmin); } to { opacity: 1; transform: none; } }
@keyframes ssaZoomIn { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
@keyframes ssaFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes ssaConfetti { 0% { transform: translateY(-15cqh) rotate(0deg); } 100% { transform: translateY(115cqh) rotate(540deg); } }
@keyframes ssaTwinkle { 0%,100% { opacity: 0.1; transform: scale(0.7); } 50% { opacity: 0.7; transform: scale(1.1); } }
@keyframes ssaGrow { from { opacity: 0; transform: scale(0.4) rotate(-8deg); } to { opacity: 1; transform: scale(1) rotate(0deg); } }
@keyframes ssaLineGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
`;

// A living white canvas: brand-coloured gradient orbs drift slowly behind the
// content, a soft white centre keeps text crisp, so it reads bright but alive.
export function AwardsBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: AWARDS.bg }}>
      <motion.div
        animate={{ x: [0, 24, 0], y: [0, -18, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '-18cqmin', left: '-10cqmin', width: '72cqmin', height: '72cqmin', borderRadius: '50%', background: `radial-gradient(circle, ${AWARDS.green}40, transparent 68%)`, filter: 'blur(2cqmin)' }}
      />
      <motion.div
        animate={{ x: [0, -22, 0], y: [0, 16, 0], scale: [1, 1.12, 1] }}
        transition={{ duration: 23, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '-16cqmin', right: '-12cqmin', width: '64cqmin', height: '64cqmin', borderRadius: '50%', background: `radial-gradient(circle, ${AWARDS.navy}33, transparent 68%)`, filter: 'blur(2cqmin)' }}
      />
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, -14, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', bottom: '-22cqmin', left: '14cqmin', width: '56cqmin', height: '56cqmin', borderRadius: '50%', background: `radial-gradient(circle, ${AWARDS.greenBright}3a, transparent 70%)`, filter: 'blur(2.5cqmin)' }}
      />
      <motion.div
        animate={{ x: [0, -16, 0], y: [0, 14, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', bottom: '-18cqmin', right: '10cqmin', width: '50cqmin', height: '50cqmin', borderRadius: '50%', background: `radial-gradient(circle, ${AWARDS.green}2e, transparent 70%)`, filter: 'blur(2.5cqmin)' }}
      />
      {/* soft white lift so the central content stays crisp and readable */}
      <div className="absolute inset-0" style={{ background: `radial-gradient(58% 52% at 50% 44%, #ffffffe0, #ffffff66 55%, transparent 78%)` }} />
      {/* faint dot texture */}
      <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle, ${AWARDS.navy}0d 0.3cqmin, transparent 0.4cqmin)`, backgroundSize: '3.6cqmin 3.6cqmin', opacity: 0.4 }} />
    </div>
  );
}

// Elegant inset frame with corner ornaments, in brand green.
export function AwardsFrame() {
  const corner = (pos: React.CSSProperties) => (
    <span style={{ position: 'absolute', width: '5.5cqmin', height: '5.5cqmin', borderColor: AWARDS.green, borderStyle: 'solid', opacity: 0.9, ...pos }} />
  );
  return (
    <div className="absolute pointer-events-none" style={{ inset: '3cqmin', animation: 'ssaFadeIn 1.2s ease-out both' }}>
      <div className="absolute inset-0" style={{ border: `0.16cqmin solid ${AWARDS.green}66`, borderRadius: '1.5cqmin' }} />
      {corner({ top: 0, left: 0, borderWidth: '0.4cqmin 0 0 0.4cqmin' })}
      {corner({ top: 0, right: 0, borderWidth: '0.4cqmin 0.4cqmin 0 0' })}
      {corner({ bottom: 0, left: 0, borderWidth: '0 0 0.4cqmin 0.4cqmin' })}
      {corner({ bottom: 0, right: 0, borderWidth: '0 0.4cqmin 0.4cqmin 0' })}
    </div>
  );
}

export function Confetti({ count = 14 }: { count?: number }) {
  // colours chosen to read on white
  const colors = [AWARDS.green, AWARDS.greenBright, AWARDS.navy, AWARDS.greenDark];
  const pieces = useMemo(
    () => Array.from({ length: count }).map((_, i) => ({
      left: Math.random() * 100,
      delay: -Math.random() * 7,
      dur: 4.5 + Math.random() * 4,
      w: 0.6 + Math.random() * 0.8,
      h: 1.4 + Math.random() * 1.6,
      color: colors[i % colors.length],
      round: Math.random() > 0.6,
    })),
    [count]
  );
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            position: 'absolute', top: 0, left: `${p.left}%`,
            width: `${p.w}cqmin`, height: `${p.h}cqmin`,
            background: p.color, borderRadius: p.round ? '50%' : '0.2cqmin',
            opacity: 0.7, animation: `ssaConfetti ${p.dur}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export function Sparkles({ count = 6 }: { count?: number }) {
  const stars = useMemo(
    () => Array.from({ length: count }).map(() => ({
      top: Math.random() * 86, left: Math.random() * 94,
      size: 1.2 + Math.random() * 1.4, delay: Math.random() * 3, dur: 2.4 + Math.random() * 2.5,
    })),
    [count]
  );
  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map((s, i) => (
        <span key={i} style={{ position: 'absolute', top: `${s.top}%`, left: `${s.left}%`, color: AWARDS.green, fontSize: `${s.size}cqmin`, animation: `ssaTwinkle ${s.dur}s ease-in-out ${s.delay}s infinite` }}>✦</span>
      ))}
    </div>
  );
}

// Physics-based celebration confetti (canvas-confetti), scoped to this slide's canvas.
// Fires an opening burst, then gentle bursts on an interval — for the celebration slide
// that stays live during the ceremony.
export function CelebrationConfetti() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const fire = confetti.create(ref.current, { resize: true, useWorker: true });
    const colors = [AWARDS.green, AWARDS.greenBright, AWARDS.navy, AWARDS.greenDark];
    const burst = () => {
      fire({ particleCount: 55, spread: 72, startVelocity: 48, origin: { x: 0, y: 1 }, angle: 60, colors, scalar: 0.95, gravity: 1.1 });
      fire({ particleCount: 55, spread: 72, startVelocity: 48, origin: { x: 1, y: 1 }, angle: 120, colors, scalar: 0.95, gravity: 1.1 });
    };
    const t = setTimeout(burst, 250);
    const iv = setInterval(burst, 4000);
    return () => { clearTimeout(t); clearInterval(iv); fire.reset(); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }} />;
}

// A small two-leaf emblem echoing the logo's sprout (available if needed).
export function LeafEmblem({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: `${size}cqmin`, height: `${size}cqmin`, animation: 'ssaGrow 0.9s cubic-bezier(.2,.8,.2,1) both' }}>
      <defs>
        <linearGradient id="ssaLeafA" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={AWARDS.greenDark} />
          <stop offset="100%" stopColor={AWARDS.green} />
        </linearGradient>
        <linearGradient id="ssaLeafB" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={AWARDS.green} />
          <stop offset="100%" stopColor={AWARDS.greenBright} />
        </linearGradient>
      </defs>
      <path d="M50 92 C30 70 24 44 40 18 C52 40 58 66 50 92 Z" fill="url(#ssaLeafA)" />
      <path d="M50 92 C70 70 76 44 60 18 C48 40 42 66 50 92 Z" fill="url(#ssaLeafB)" opacity="0.95" />
      <path d="M50 92 L50 50" stroke={AWARDS.greenDark} strokeWidth="2.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function AwardsFooter() {
  return (
    <div className="absolute left-0 right-0 flex flex-col items-center" style={{ bottom: '5cqmin', animation: 'ssaFadeIn 1s ease-out 0.6s both' }}>
      {/* logo sits directly on the white canvas — no badge needed */}
      <img src="/logo1.png" alt="AIMS" style={{ height: '5cqmin', width: 'auto', display: 'block' }} />
      <p style={{ color: AWARDS.greenDark, fontSize: '1.6cqmin', letterSpacing: '0.32em', textTransform: 'uppercase', marginTop: '1.4cqmin', fontWeight: 600 }}>
        SSLC Awards 2026
      </p>
    </div>
  );
}
