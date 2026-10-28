// /app/components/TorchToggle.tsx
"use client";

import { useEffect, useId, useRef, useState } from "react";

interface TorchToggleProps {
  isRoomLightOn: boolean;
  onToggle: () => void;
}

// Scene geometry (viewBox 240 x 120)
const CX = 120;
const CY = 150;
const R = 95;

// ---------- small helpers (UI only) ----------
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, c: string, t: number) => {
  const A = hex(a);
  const C = hex(c);
  return `rgb(${A.map((v, i) => Math.round(v + (C[i] - v) * t)).join(",")})`;
};

// deterministic star field (no hydration mismatch)
const STARS: Array<[number, number, number, string]> = (() => {
  const out: Array<[number, number, number, string]> = [];
  let s = 7;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  const tints = ["#ffffff", "#dbeafe", "#fef3c7", "#e0e7ff"];
  for (let i = 0; i < 34; i++) {
    out.push([
      Math.round(rnd() * 236 + 2),
      Math.round(rnd() * 70 + 3),
      +(0.5 + rnd() * 1.2).toFixed(2),
      tints[Math.floor(rnd() * tints.length)],
    ]);
  }
  return out;
})();

const TREES = [8, 20, 31, 52, 66, 150, 164, 178, 196, 210, 226];

export default function TorchToggle({ isRoomLightOn, onToggle }: TorchToggleProps) {
  const uid = useId().replace(/:/g, "");

  // ---------- UI only: the "sky wheel" ----------
  // phase 0 = noon (day), 1 = midnight (night), 2 = noon again ...
  // Every toggle advances the wheel by one half-turn, always in the same direction.
  const initial = isRoomLightOn ? 0 : 1;
  const [phase, setPhase] = useState(initial);
  const phaseRef = useRef(initial);
  const vel = useRef(0);
  const target = useRef(initial);
  const raf = useRef<number | null>(null);
  const last = useRef(0);

  const frameRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startPhase = useRef(0);
  const moved = useRef(false);
  const fired = useRef(false);

  const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const step = (t: number) => {
    const dt = Math.min((t - last.current) / 1000, 0.033);
    last.current = t;

    // slightly under-damped spring => gentle, natural settle
    const acc = 48 * (target.current - phaseRef.current) - 12 * vel.current;
    vel.current += acc * dt;
    phaseRef.current += vel.current * dt;
    setPhase(phaseRef.current);

    if (
      Math.abs(target.current - phaseRef.current) > 0.002 ||
      Math.abs(vel.current) > 0.01
    ) {
      raf.current = requestAnimationFrame(step);
    } else {
      phaseRef.current = target.current;
      vel.current = 0;
      setPhase(target.current);
      raf.current = null;
    }
  };

  const run = () => {
    if (prefersReducedMotion()) {
      phaseRef.current = target.current;
      vel.current = 0;
      setPhase(target.current);
      return;
    }
    if (raf.current === null && Math.abs(target.current - phaseRef.current) > 0.002) {
      last.current = performance.now();
      raf.current = requestAnimationFrame(step);
    }
  };

  // keep the wheel in sync if the theme is changed from outside
  useEffect(() => {
    const want = isRoomLightOn ? 0 : 1;
    if ((((Math.round(target.current) % 2) + 2) % 2) !== want) {
      target.current += 1;
    }
    if (!dragging.current) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRoomLightOn]);

  useEffect(() => {
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, []);

  // ---------- Pointer: drag sideways (or tap) to turn the sky ----------
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    if (raf.current !== null) {
      cancelAnimationFrame(raf.current);
      raf.current = null;
    }
    dragging.current = true;
    startX.current = e.clientX;
    startPhase.current = Math.round(target.current);
    moved.current = false;
    fired.current = false;
    vel.current = 0;
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const range = (frameRef.current?.getBoundingClientRect().width ?? 240) * 0.35;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 4) moved.current = true;

    const progress = Math.max(0, Math.min(dx / range, 1));
    phaseRef.current = startPhase.current + progress;
    setPhase(phaseRef.current);

    // past the horizon => switch the page theme (once)
    if (progress >= 0.5 && !fired.current) {
      fired.current = true;
      target.current = startPhase.current + 1;
      onToggle();
    }
  };

  const onUp = () => {
    if (!dragging.current) return;
    dragging.current = false;

    if (fired.current) {
      target.current = startPhase.current + 1;
    } else if (!moved.current) {
      // simple tap / click
      target.current = startPhase.current + 1;
      onToggle();
    } else {
      target.current = startPhase.current; // not far enough: roll back
    }
    run();
  };

  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
      e.preventDefault();
      target.current = Math.round(target.current) + 1;
      onToggle();
      run();
    }
  };

  // ---------- Derived scene values ----------
  const b = (1 + Math.cos(Math.PI * phase)) / 2; // 1 = full day, 0 = full night
  const sunset = 1 - Math.abs(2 * b - 1); // peaks at the horizon crossing
  const sunA = phase * Math.PI;
  const sunX = CX + R * Math.sin(sunA);
  const sunY = CY - R * Math.cos(sunA);
  const moonX = CX - R * Math.sin(sunA);
  const moonY = CY + R * Math.cos(sunA);

  // sun gets lower => redder light on clouds
  const cloudTop = mix("#ffffff", "#ffd2aa", sunset);
  const cloudMid = mix("#e6eef8", "#f5b08a", sunset);
  const cloudBottom = mix("#aebfd6", "#d9806a", sunset);

  // lens-flare spots along the line from the sun toward the scene centre
  const flare = [
    { t: 0.28, r: 3, c: "#bfe3ff", o: 0.35 },
    { t: 0.52, r: 5.5, c: "#ffe9b0", o: 0.2 },
    { t: 0.78, r: 2.4, c: "#ffffff", o: 0.4 },
    { t: 1.12, r: 7, c: "#ffd0a0", o: 0.16 },
  ].map((f) => ({
    ...f,
    x: sunX + (CX - sunX) * f.t * 1.4,
    y: sunY + (62 - sunY) * f.t * 1.4,
  }));
  const flareVisible = b * (sunY < 100 ? 1 : 0);

  const id = (n: string) => `${n}-${uid}`;
  const url = (n: string) => `url(#${id(n)})`;

  const Cloud = ({
    x,
    y,
    s,
    dur,
    delay,
    o,
  }: {
    x: number;
    y: number;
    s: number;
    dur: number;
    delay: number;
    o: number;
  }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <g
        className="sky-cloud"
        style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}
      >
        <g filter={url("cloudFx")}>
          {/* shaded underside */}
          <ellipse cx="0" cy="5" rx="24" ry="6" fill={cloudBottom} />
          <ellipse cx="-12" cy="2" rx="13" ry="7" fill={cloudMid} />
          <ellipse cx="10" cy="1" rx="15" ry="8" fill={cloudMid} />
          {/* lit tops */}
          <ellipse cx="-9" cy="-3" rx="11" ry="7.5" fill={cloudTop} />
          <ellipse cx="3" cy="-6" rx="13" ry="9" fill={cloudTop} />
          <ellipse cx="14" cy="-2" rx="10" ry="6.5" fill={cloudTop} />
        </g>
      </g>
    </g>
  );

  return (
    <>
      <style>{`
        @keyframes sky-spin { to { transform: rotate(360deg); } }
        @keyframes sky-twinkle { 0%,100% { opacity: .2; } 50% { opacity: 1; } }
        @keyframes sky-cloud { from { transform: translateX(-90px); } to { transform: translateX(340px); } }
        @keyframes sky-bird { 0% { transform: translate(-30px, 0); } 50% { transform: translate(110px, -6px); } 100% { transform: translate(270px, 3px); } }
        @keyframes sky-flap { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(0.25); } }
        @keyframes sky-shoot {
          0%, 78% { opacity: 0; transform: translate(0, 0); }
          80% { opacity: 1; }
          92% { opacity: 0; transform: translate(-70px, 34px); }
          100% { opacity: 0; transform: translate(-70px, 34px); }
        }
        .sky-rays { animation: sky-spin 120s linear infinite; transform-box: fill-box; transform-origin: center; }
        .sky-star { animation: sky-twinkle 3.2s ease-in-out infinite; }
        .sky-cloud { animation: sky-cloud 70s linear infinite; }
        .sky-bird { animation: sky-bird 24s linear infinite; }
        .sky-wing { animation: sky-flap 0.5s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .sky-shoot { animation: sky-shoot 11s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .sky-rays, .sky-star, .sky-cloud, .sky-bird, .sky-wing, .sky-shoot { animation: none; }
        }
      `}</style>

      {/* Sky scene: fills whatever container it is placed in (the login card header) */}
      <div
        ref={frameRef}
        role="switch"
        aria-checked={isRoomLightOn}
        aria-label="Switch between day and night mode. Drag sideways or tap."
        tabIndex={0}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={onKey}
        className="relative block h-full w-full cursor-grab select-none overflow-hidden focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-indigo-500/50 active:cursor-grabbing"
        style={{ touchAction: "none" }}
      >
        <svg
          viewBox="0 0 240 120"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
          className="block"
        >
          <defs>
            {/* ----- sky ----- */}
            <linearGradient id={id("day")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1a64c8" />
              <stop offset="0.45" stopColor="#4aa3ec" />
              <stop offset="0.8" stopColor="#a6d6f6" />
              <stop offset="1" stopColor="#e4f3fb" />
            </linearGradient>
            <linearGradient id={id("night")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#01020a" />
              <stop offset="0.5" stopColor="#070c2a" />
              <stop offset="0.85" stopColor="#15215a" />
              <stop offset="1" stopColor="#24336f" />
            </linearGradient>
            <linearGradient id={id("haze")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0.55" />
            </linearGradient>
            <radialGradient id={id("dawn")} cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#ffb347" stopOpacity="0.95" />
              <stop offset="0.45" stopColor="#ff7a45" stopOpacity="0.5" />
              <stop offset="1" stopColor="#d9467a" stopOpacity="0" />
            </radialGradient>

            {/* ----- sun ----- */}
            <radialGradient id={id("bloom")} cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#fffbe6" stopOpacity="0.9" />
              <stop offset="0.25" stopColor="#fff1a8" stopOpacity="0.45" />
              <stop offset="0.6" stopColor="#ffe27a" stopOpacity="0.12" />
              <stop offset="1" stopColor="#ffe27a" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={id("sunDisc")} cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.55" stopColor="#fffbd0" />
              <stop offset="0.9" stopColor="#ffe27a" />
              <stop offset="1" stopColor="#ffc93c" />
            </radialGradient>
            <linearGradient id={id("shaft")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff7c2" stopOpacity="0.5" />
              <stop offset="1" stopColor="#fff7c2" stopOpacity="0" />
            </linearGradient>

            {/* ----- moon ----- */}
            <radialGradient id={id("moonDisc")} cx="40%" cy="38%" r="70%">
              <stop offset="0" stopColor="#fbfcff" />
              <stop offset="0.6" stopColor="#e3e8f2" />
              <stop offset="1" stopColor="#aeb8cc" />
            </radialGradient>
            <radialGradient id={id("moonGlow")} cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#d7ddff" stopOpacity="0.55" />
              <stop offset="0.4" stopColor="#aab6ff" stopOpacity="0.2" />
              <stop offset="1" stopColor="#aab6ff" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={id("moonShade")} x1="1" y1="0.2" x2="0" y2="0.8">
              <stop offset="0" stopColor="#0b1030" stopOpacity="0" />
              <stop offset="0.6" stopColor="#0b1030" stopOpacity="0.05" />
              <stop offset="1" stopColor="#0b1030" stopOpacity="0.45" />
            </linearGradient>
            <radialGradient id={id("mare")} cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#8d98b0" stopOpacity="0.75" />
              <stop offset="1" stopColor="#8d98b0" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={id("shootGrad")} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="1" stopColor="#fff" stopOpacity="0.95" />
            </linearGradient>

            {/* ----- landscape ----- */}
            <linearGradient id={id("farDay")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#a9c6e3" />
              <stop offset="1" stopColor="#c8dcee" />
            </linearGradient>
            <linearGradient id={id("farNight")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1d2860" />
              <stop offset="1" stopColor="#101842" />
            </linearGradient>
            <linearGradient id={id("midDay")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#6f9fb4" />
              <stop offset="1" stopColor="#5d8f8a" />
            </linearGradient>
            <linearGradient id={id("midNight")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#11183e" />
              <stop offset="1" stopColor="#0a0f2a" />
            </linearGradient>
            <linearGradient id={id("nearDay")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3f9a5a" />
              <stop offset="1" stopColor="#1f6a3d" />
            </linearGradient>
            <linearGradient id={id("nearNight")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0a0f26" />
              <stop offset="1" stopColor="#04060f" />
            </linearGradient>

            {/* ----- filters ----- */}
            <filter id={id("cloudFx")} x="-25%" y="-50%" width="150%" height="200%">
              <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="4" result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" result="d" />
              <feGaussianBlur in="d" stdDeviation="0.8" />
            </filter>
            <filter id={id("soft")} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
            <filter id={id("soft2")} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.2" />
            </filter>
          </defs>

          {/* ================= SKY ================= */}
          <rect width="240" height="120" fill={url("day")} />
          <rect width="240" height="120" fill={url("night")} opacity={1 - b} />

          {/* warm horizon glow around the sun while it rises / sets */}
          <ellipse
            cx={sunX}
            cy="96"
            rx="130"
            ry="46"
            fill={url("dawn")}
            opacity={sunset * 0.95}
          />
          <ellipse
            cx={moonX}
            cy="96"
            rx="90"
            ry="30"
            fill={url("dawn")}
            opacity={sunset * 0.35}
          />

          {/* ================= NIGHT SKY ================= */}
          <g opacity={Math.max(0, 1 - b * 1.7)}>
            {/* milky way */}
            <g transform="rotate(-24 120 40)" filter={url("soft")}>
              <ellipse cx="120" cy="40" rx="150" ry="11" fill="#c9d4ff" opacity="0.11" />
              <ellipse cx="140" cy="38" rx="90" ry="6" fill="#ffffff" opacity="0.09" />
            </g>
            {STARS.map(([x, y, r, c], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={r}
                fill={c}
                className="sky-star"
                style={{ animationDelay: `${(i % 9) * 0.4}s`, animationDuration: `${2.6 + (i % 5) * 0.5}s` }}
              />
            ))}
            {/* shooting star */}
            <g className="sky-shoot">
              <line x1="190" y1="14" x2="218" y2="2" stroke={url("shootGrad")} strokeWidth="1.1" strokeLinecap="round" transform="rotate(8 190 14)" />
            </g>
          </g>

          {/* ================= MOON ================= */}
          <g transform={`translate(${moonX} ${moonY})`}>
            <circle r="46" fill={url("moonGlow")} />
            <circle r="15" fill={url("moonDisc")} />
            {/* maria (dark seas) */}
            <g>
              <ellipse cx="-4.5" cy="-4" rx="5.5" ry="4" fill={url("mare")} />
              <ellipse cx="3" cy="-6" rx="3.6" ry="3" fill={url("mare")} />
              <ellipse cx="-1" cy="3" rx="6" ry="4.4" fill={url("mare")} />
              <ellipse cx="6" cy="2" rx="3" ry="2.6" fill={url("mare")} opacity="0.8" />
            </g>
            {/* craters with lit rims */}
            <g>
              <circle cx="7" cy="-3" r="1.9" fill="#9aa5bd" opacity="0.7" />
              <circle cx="6.5" cy="-3.4" r="1.9" fill="none" stroke="#fff" strokeWidth="0.35" opacity="0.7" />
              <circle cx="-8" cy="4" r="1.5" fill="#9aa5bd" opacity="0.7" />
              <circle cx="-8.3" cy="3.7" r="1.5" fill="none" stroke="#fff" strokeWidth="0.3" opacity="0.6" />
              <circle cx="2" cy="9" r="1.1" fill="#9aa5bd" opacity="0.7" />
              <circle cx="-3" cy="-10" r="1" fill="#9aa5bd" opacity="0.6" />
            </g>
            {/* soft terminator shading */}
            <circle r="15" fill={url("moonShade")} />
          </g>

          {/* ================= DAY SKY: CLOUDS + BIRDS ================= */}
          <g opacity={Math.max(0, b * 1.25 - 0.25)}>
            <Cloud x={0} y={30} s={0.95} dur={78} delay={-14} o={0.95} />
            <Cloud x={0} y={50} s={0.65} dur={96} delay={-52} o={0.8} />
            <Cloud x={0} y={22} s={0.55} dur={110} delay={-80} o={0.7} />

            {/* birds with flapping wings */}
            <g className="sky-bird">
              <g transform="translate(0 20)" stroke="#2b3a52" strokeWidth="1" strokeLinecap="round" fill="none">
                <g className="sky-wing"><path d="M0 0 q3 -4 6 0 q3 -4 6 0" /></g>
              </g>
              <g transform="translate(18 28)" stroke="#2b3a52" strokeWidth="0.9" strokeLinecap="round" fill="none">
                <g className="sky-wing" style={{ animationDelay: "-0.2s" }}><path d="M0 0 q2.5 -3 5 0 q2.5 -3 5 0" /></g>
              </g>
            </g>
          </g>

          {/* ================= SUN ================= */}
          <g transform={`translate(${sunX} ${sunY})`}>
            {/* big atmospheric bloom */}
            <circle r="78" fill={url("bloom")} opacity={0.55 + 0.45 * b} />
            {/* extra orange bloom while setting */}
            <circle r="52" fill="#ff8a3d" opacity={sunset * 0.45} filter={url("soft")} />
            {/* soft light shafts */}
            <g className="sky-rays" filter={url("soft2")} opacity={b * 0.9}>
              {Array.from({ length: 9 }).map((_, i) => (
                <polygon
                  key={i}
                  points="-3,0 3,0 11,-70 -11,-70"
                  fill={url("shaft")}
                  transform={`rotate(${i * 40})`}
                  opacity={0.35}
                />
              ))}
            </g>
            {/* disc */}
            <circle r="12" fill={url("sunDisc")} />
            <circle r="12" fill="#ff7a1a" opacity={sunset * 0.7} />
            <circle r="12" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1" filter={url("soft2")} />
          </g>

          {/* lens-flare spots */}
          <g opacity={flareVisible * 0.8} style={{ mixBlendMode: "screen" }}>
            {flare.map((f, i) => (
              <circle key={i} cx={f.x} cy={f.y} r={f.r} fill={f.c} opacity={f.o} filter={url("soft2")} />
            ))}
          </g>

          {/* atmospheric haze over the horizon */}
          <rect y="50" width="240" height="40" fill={url("haze")} opacity={b * 0.7} />

          {/* ================= LANDSCAPE ================= */}
          {/* far jagged mountains */}
          <g>
            <path
              d="M0 120 L0 86 L16 74 L28 80 L46 63 L62 78 L80 70 L98 82 L120 65 L140 80 L160 68 L182 82 L200 71 L220 80 L240 69 L240 120 Z"
              fill={url("farDay")}
              opacity={b}
            />
            <path
              d="M0 120 L0 86 L16 74 L28 80 L46 63 L62 78 L80 70 L98 82 L120 65 L140 80 L160 68 L182 82 L200 71 L220 80 L240 69 L240 120 Z"
              fill={url("farNight")}
              opacity={1 - b}
            />
            {/* snow caps (day) */}
            <g fill="#fff" opacity={b * 0.85}>
              <path d="M46 63 L41 70 L45 69 L48 71 L52 69 Z" />
              <path d="M120 65 L115 72 L119 71 L122 73 L126 71 Z" />
              <path d="M240 69 L234 76 L238 75 L240 76 Z" />
            </g>
          </g>

          {/* middle ridge */}
          <g>
            <path
              d="M0 120 L0 94 L24 82 L42 90 L68 76 L94 92 L120 84 L148 94 L174 80 L202 92 L228 82 L240 88 L240 120 Z"
              fill={url("midDay")}
              opacity={b}
            />
            <path
              d="M0 120 L0 94 L24 82 L42 90 L68 76 L94 92 L120 84 L148 94 L174 80 L202 92 L228 82 L240 88 L240 120 Z"
              fill={url("midNight")}
              opacity={1 - b}
            />
          </g>

          {/* near rolling hill + pines */}
          <g>
            <path
              d="M0 120 L0 102 Q40 90 90 100 T180 98 T240 100 L240 120 Z"
              fill={url("nearDay")}
              opacity={b}
            />
            <path
              d="M0 120 L0 102 Q40 90 90 100 T180 98 T240 100 L240 120 Z"
              fill={url("nearNight")}
              opacity={1 - b}
            />
            <g fill={mix("#1c5a35", "#03050c", 1 - b)}>
              {TREES.map((x, i) => {
                const y = 103 + (i % 3);
                const h = 1 + (i % 4) * 0.12;
                return (
                  <path
                    key={x}
                    d={`M${x} ${y - 10 * h} L${x + 3.2} ${y - 5 * h} L${x + 1.8} ${y - 5 * h} L${x + 4.4} ${y - 1} L${x - 4.4} ${y - 1} L${x - 1.8} ${y - 5 * h} L${x - 3.2} ${y - 5 * h} Z`}
                  />
                );
              })}
            </g>
          </g>
        </svg>
      </div>
    </>
  );
}
