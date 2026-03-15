export function BotAvatar({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className} group/avatar`}>
      {/* Background Energy Glow */}
      <div className="absolute inset-0 bg-status-error/10 blur-xl rounded-full scale-125 animate-pulse-glow" />
      
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
      >
        <defs>
          {/* Vibrant Lobster Red */}
          <linearGradient id="lobsterRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff1111" />
            <stop offset="60%" stopColor="#dd0000" />
            <stop offset="100%" stopColor="#aa0000" />
          </linearGradient>

          {/* Polished Silver Armor */}
          <linearGradient id="silverArmor" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#e2e8f0" />
            <stop offset="80%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Bevel effect for depth */}
          <filter id="hardBevel">
            <feGaussianBlur stdDeviation="0.8" in="SourceAlpha" result="blur" />
            <feSpecularLighting surfaceScale="3" specularConstant="1" specularExponent="30" lightingColor="#ffffff" in="blur" result="spec">
              <fePointLight x="-20" y="-20" z="100" />
            </feSpecularLighting>
            <feComposite in="spec" in2="SourceAlpha" operator="in" />
            <feComposite in="SourceGraphic" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
          </filter>
        </defs>

        {/* --- 1. LOBSTER BASE (RED) --- */}
        {/* Tail (Curved Segments) */}
        <g fill="url(#lobsterRed)">
          <path d="M42 75 Q50 95 58 75 L55 88 Q50 95 45 88 Z" />
          <path d="M40 68 Q50 82 60 68 L56 78 Q50 84 44 78 Z" opacity="0.8" />
        </g>
        
        {/* Main Body (Vibrant Red) */}
        <ellipse cx="50" cy="45" rx="18" ry="25" fill="url(#lobsterRed)" stroke="#7f1d1d" strokeWidth="0.5" />

        {/* --- 2. THE BIG CLAWS (RED & PROMINENT) --- */}
        {/* Left Claw */}
        <g transform="rotate(-15, 32, 35)">
          <path
            d="M32 35 C15 35, 5 25, 12 10 C20 -5, 40 5, 38 22"
            fill="url(#lobsterRed)"
            stroke="#7f1d1d"
            strokeWidth="1"
            className="animate-float"
          />
          {/* Inner Pincer Detail */}
          <path d="M18 12 L28 22" stroke="#7f1d1d" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Right Claw */}
        <g transform="rotate(15, 68, 35)">
          <path
            d="M68 35 C85 35, 95 25, 88 10 C80 -5, 60 5, 62 22"
            fill="url(#lobsterRed)"
            stroke="#7f1d1d"
            strokeWidth="1"
            className="animate-float"
          />
          {/* Inner Pincer Detail */}
          <path d="M82 12 L72 22" stroke="#7f1d1d" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* --- 3. THE ARMOR (SILVER & OVERLAYED) --- */}
        {/* Heavy Chest Plate */}
        <path
          d="M36 38 Q50 32 64 38 L60 62 Q50 68 40 62 Z"
          fill="url(#silverArmor)"
          stroke="#475569"
          strokeWidth="1"
          filter="url(#hardBevel)"
        />

        {/* Mechanical Shoulder Guards */}
        <circle cx="35" cy="40" r="7" fill="url(#silverArmor)" stroke="#475569" strokeWidth="1" filter="url(#hardBevel)" />
        <circle cx="65" cy="40" r="7" fill="url(#silverArmor)" stroke="#475569" strokeWidth="1" filter="url(#hardBevel)" />

        {/* Armored Bracers on the claws */}
        <rect x="25" y="30" width="10" height="10" rx="2" fill="url(#silverArmor)" filter="url(#hardBevel)" transform="rotate(-15, 30, 35)" />
        <rect x="65" y="30" width="10" height="10" rx="2" fill="url(#silverArmor)" filter="url(#hardBevel)" transform="rotate(15, 70, 35)" />

        {/* --- 4. DETAILS (HEAD & SENSORS) --- */}
        {/* Long Red Antennae (Iconic Lobster Look) */}
        <path d="M48 22 C45 10, 30 2, 12 8" stroke="#ff1111" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M52 22 C55 10, 70 2, 88 8" stroke="#ff1111" strokeWidth="1.5" strokeLinecap="round" />

        {/* Head Visor (Helmet) */}
        <path
          d="M42 22 Q50 18 58 22 L55 32 Q50 35 45 32 Z"
          fill="url(#silverArmor)"
          stroke="#475569"
          strokeWidth="0.5"
          filter="url(#hardBevel)"
        />

        {/* Little Black Eyes Peeking Out */}
        <circle cx="47" cy="27" r="1.5" fill="#000" />
        <circle cx="53" cy="27" r="1.5" fill="#000" />

        {/* Nuclear Core Jewel (Glow) */}
        <circle cx="50" cy="50" r="4" fill="#ff4444" className="animate-pulse">
          <animate attributeName="r" values="3.5;4.5;3.5" dur="1s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;1;0.6" dur="1s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

// Add these to index.css if needed, or use inline styles.
// @keyframes ping-slow {
//   75%, 100% {
//     transform: scale(1.5);
//     opacity: 0;
//   }
// }
// .animate-ping-slow {
//   animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
// }
