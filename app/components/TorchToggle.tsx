// /app/components/TorchToggle.tsx
"use client";

interface TorchToggleProps {
  isRoomLightOn: boolean;
  onToggle: () => void;
}

export default function TorchToggle({ isRoomLightOn, onToggle }: TorchToggleProps) {
  return (
    <div className="fixed bottom-0 left-0 z-20 flex flex-col items-start pointer-events-none">
      {/* --- Person + Torch Illustration --- */}
      <div className="relative ml-4 mb-2 pointer-events-none select-none">
        {/* Torch glow halo */}
        <div
          className={`absolute -top-8 left-24 w-24 h-24 rounded-full transition-opacity duration-1000 ${
            isRoomLightOn ? "opacity-0" : "opacity-100"
          }`}
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.2) 40%, transparent 70%)",
            filter: "blur(6px)",
          }}
        />

        {/* SVG: Person squatting + holding torch upward */}
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          {/* --- Shadow under person --- */}
          <ellipse cx="70" cy="192" rx="55" ry="6" fill="rgba(0,0,0,0.55)" />

          {/* --- Legs (squatting) --- */}
          <path
            d="M55 185 L55 155 Q55 145 65 145 L75 145 L75 185 Z"
            fill="#1f2937"
            className="transition-colors duration-1000"
          />
          <path
            d="M85 185 L85 155 Q85 145 95 145 L105 145 L105 185 Z"
            fill="#1f2937"
            className="transition-colors duration-1000"
          />
          {/* Shoes */}
          <ellipse cx="65" cy="187" rx="14" ry="5" fill="#0f172a" />
          <ellipse cx="95" cy="187" rx="14" ry="5" fill="#0f172a" />

          {/* --- Body / Torso --- */}
          <path
            d="M50 145 Q48 110 60 95 L100 95 Q112 110 110 145 Z"
            fill="#334155"
            className="transition-colors duration-1000"
          />

          <g
            style={{
              transformOrigin: "100px 100px",
              transform: isRoomLightOn ? "rotate(60deg)" : "rotate(0deg)",
              transition: "transform 1.4s cubic-bezier(0.34, 1.2, 0.64, 1)",
            }}
          >
            {/* --- Arm holding torch UP (right arm) --- */}
            <path
              d="M100 100 Q120 90 130 70 Q135 60 128 58 L120 62 Q115 75 100 82 Z"
              fill="#334155"
              className="transition-colors duration-1000"
            />
            {/* Hand */}
            <circle cx="127" cy="60" r="7" fill="#f1c9a5" />

            <g transform="translate(120 15) rotate(35 20 20)">
              {/* Torch body (metallic cylinder) */}
              <rect x="10" y="15" width="14" height="40" rx="3" fill="#52525b" stroke="#27272a" strokeWidth="1" />
              {/* Torch grip rings */}
              <rect x="10" y="22" width="14" height="2" fill="#27272a" />
              <rect x="10" y="30" width="14" height="2" fill="#27272a" />
              <rect x="10" y="38" width="14" height="2" fill="#27272a" />
              <rect x="10" y="46" width="14" height="2" fill="#27272a" />

              {/* Torch head (wider top) */}
              <path d="M7 15 L27 15 L30 6 L4 6 Z" fill="#71717a" stroke="#27272a" strokeWidth="1" />
              
              {/* Torch lens (glowing when ON) */}
              <ellipse
                cx="17"
                cy="5"
                rx="12"
                ry="3"
                className={`transition-all duration-700 ${
                  isRoomLightOn ? "fill-neutral-500" : "fill-white"
                }`}
                style={{
                  filter: isRoomLightOn
                    ? "none"
                    : "drop-shadow(0 0 10px rgba(255,255,255,1)) drop-shadow(0 0 20px rgba(255,255,255,0.8))",
                }}
              />
              {/* Light rays from torch (only when ON) */}
              {!isRoomLightOn && (
                <g opacity="0.95">
                  <path d="M17 2 L17 -12" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M8 2 L0 -8" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M26 2 L34 -8" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round" />
                </g>
              )}
            </g>
          </g>

          {/* --- Arm resting on knee (left arm) --- */}
          <path
            d="M55 110 Q45 130 55 145 Q60 150 65 145 L62 135 Q58 125 62 115 Z"
            fill="#334155"
            className="transition-colors duration-1000"
          />

          {/* --- Head --- */}
          <circle cx="80" cy="75" r="18" fill="#f1c9a5" />
          {/* Hair */}
          <path d="M62 72 Q62 55 80 55 Q98 55 98 72 Q92 62 80 62 Q68 62 62 72 Z" fill="#1f2937" />
          {/* Eye */}
          <circle cx="86" cy="76" r="1.8" fill="#0f172a" />
        </svg>
      </div>

      {/* --- Toggle Switch (under the person) --- */}
      <div className="ml-6 mb-6 pointer-events-auto flex items-center gap-3">
        {/* Label OFF (Light mode) */}
        <span
          className={`text-[10px] uppercase tracking-widest transition-colors duration-500 ${
            isRoomLightOn ? "text-slate-700 font-semibold" : "text-slate-600"
          }`}
        >
          Off
        </span>

        {/* Toggle */}
        <button
          type="button"
          onClick={onToggle}
          aria-label="Toggle torch"
          className={`relative h-7 w-14 rounded-full transition-colors duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
            isRoomLightOn ? "bg-slate-300" : "bg-slate-800"
          }`}
          style={{
            boxShadow: isRoomLightOn
              ? "inset 0 2px 4px rgba(0,0,0,0.15)"
              : "inset 0 2px 4px rgba(0,0,0,0.6), 0 0 12px rgba(255,255,255,0.25)",
          }}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full transition-all duration-500 ${
              isRoomLightOn
                ? "left-0.5 bg-white shadow-md"
                : "left-7 bg-gradient-to-br from-white to-slate-300 shadow-[0_0_12px_rgba(255,255,255,0.9)]"
            }`}
          />
        </button>

        {/* Label ON (Dark mode / Torch ON) */}
        <span
          className={`text-[10px] uppercase tracking-widest transition-colors duration-500 ${
            isRoomLightOn ? "text-slate-500" : "text-white font-semibold"
          }`}
        >
          On
        </span>
      </div>
    </div>
  );
}