import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const outputDir = path.resolve('public/brand');
const artDir = 'C:/Users/LENOVO/.gemini/antigravity/brain/e7681e0f-f6e2-46e8-969f-ee61f6e42f2f';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// -------------------------------------------------------------
// 1. BOTXY (Character SVG)
// -------------------------------------------------------------
const botxyCharacterSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <linearGradient id="headGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2dd4bf" />
      <stop offset="100%" stop-color="#0f766e" />
    </linearGradient>
    <linearGradient id="visorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#09131f" />
      <stop offset="100%" stop-color="#030712" />
    </linearGradient>
    <linearGradient id="torsoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde047" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
    <linearGradient id="earGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <radialGradient id="orbGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="40%" stop-color="#fef08a" />
      <stop offset="100%" stop-color="#eab308" />
    </radialGradient>
  </defs>

  <g id="botxy">
    <!-- Floor Shadow -->
    <ellipse cx="250" cy="460" rx="140" ry="18" fill="#0f172a" opacity="0.12" />

    <!-- Feet -->
    <g id="feet">
      <rect x="180" y="410" width="48" height="34" rx="17" fill="#0f172a" stroke="#0f172a" stroke-width="6" />
      <ellipse cx="204" cy="436" rx="14" ry="4" fill="#38bdf8" />
      <rect x="272" y="410" width="48" height="34" rx="17" fill="#0f172a" stroke="#0f172a" stroke-width="6" />
      <ellipse cx="296" cy="436" rx="14" ry="4" fill="#38bdf8" />
    </g>

    <!-- Torso -->
    <g id="torso">
      <path d="M 175 285 C 175 270 325 270 325 285 L 335 390 C 335 420 165 420 165 390 Z" 
            fill="url(#torsoGrad)" stroke="#0f172a" stroke-width="14" stroke-linejoin="round" />
      <path d="M 170 375 Q 250 390 330 375" fill="none" stroke="#0f172a" stroke-width="8" stroke-linecap="round" />
      <g transform="translate(250, 335)">
        <circle cx="0" cy="0" r="28" fill="#0f172a" />
        <line x1="-12" y1="-12" x2="12" y2="12" stroke="#22d3ee" stroke-width="8" stroke-linecap="round" />
        <line x1="12" y1="-12" x2="-12" y2="12" stroke="#22d3ee" stroke-width="8" stroke-linecap="round" />
        <circle cx="0" cy="0" r="3" fill="#ffffff" />
      </g>
    </g>

    <!-- Left Arm -->
    <g id="left-arm">
      <path d="M 175 305 Q 120 335 145 375 Q 165 395 180 370" 
            fill="none" stroke="#0f172a" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="140" cy="370" r="16" fill="#0f172a" />
    </g>

    <!-- Right Arm (Waving) -->
    <g id="right-arm">
      <path d="M 325 310 Q 380 300 395 240 Q 400 215 425 200" 
            fill="none" stroke="#0f172a" stroke-width="16" stroke-linecap="round" />
      <g transform="translate(430, 195) rotate(-20)">
        <ellipse cx="0" cy="0" rx="22" ry="26" fill="#fde047" stroke="#0f172a" stroke-width="12" />
        <ellipse cx="-14" cy="5" rx="9" ry="11" fill="#fde047" stroke="#0f172a" stroke-width="9" />
        <path d="M 22 -15 Q 32 -10 30 10" fill="none" stroke="#0ea5e9" stroke-width="6" stroke-linecap="round" />
        <path d="M 34 -25 Q 46 -15 44 15" fill="none" stroke="#0ea5e9" stroke-width="6" stroke-linecap="round" />
      </g>
    </g>

    <rect x="230" y="260" width="40" height="25" rx="8" fill="#0f172a" />

    <!-- Ears -->
    <g id="ears">
      <rect x="90" y="145" width="36" height="70" rx="18" fill="url(#earGrad)" stroke="#0f172a" stroke-width="12" />
      <line x1="108" y1="160" x2="108" y2="200" stroke="#0f172a" stroke-width="6" stroke-linecap="round" />
      <rect x="374" y="145" width="36" height="70" rx="18" fill="url(#earGrad)" stroke="#0f172a" stroke-width="12" />
      <line x1="392" y1="160" x2="392" y2="200" stroke="#0f172a" stroke-width="6" stroke-linecap="round" />
    </g>

    <!-- Antenna -->
    <g id="antenna">
      <line x1="250" y1="95" x2="250" y2="52" stroke="#0f172a" stroke-width="14" stroke-linecap="round" />
      <rect x="236" y="85" width="28" height="15" rx="6" fill="#0f172a" />
      <circle cx="250" cy="44" r="22" fill="url(#orbGrad)" stroke="#0f172a" stroke-width="10" />
      <circle cx="243" cy="38" r="6" fill="#ffffff" />
      <path d="M 220 25 A 35 35 0 0 1 280 25" fill="none" stroke="#38bdf8" stroke-width="5" stroke-linecap="round" opacity="0.8" />
    </g>

    <!-- Head Shell -->
    <rect x="110" y="90" width="280" height="185" rx="64" fill="url(#headGrad)" stroke="#0f172a" stroke-width="14" />
    <path d="M 145 106 Q 250 96 355 106 C 362 107 362 118 350 118 Q 250 108 150 118 C 138 118 138 107 145 106 Z" fill="#ffffff" opacity="0.35" />

    <!-- Screen Visor -->
    <rect x="135" y="115" width="230" height="135" rx="42" fill="url(#visorGrad)" stroke="#0f172a" stroke-width="10" />

    <!-- Visor Face -->
    <g id="visor-face">
      <!-- Eyes -->
      <path d="M 172 178 Q 192 146 212 178" fill="none" stroke="#22d3ee" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M 172 178 Q 192 146 212 178" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" />
      <path d="M 288 178 Q 308 146 328 178" fill="none" stroke="#22d3ee" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M 288 178 Q 308 146 328 178" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" />
      <!-- Cheeks -->
      <ellipse cx="166" cy="198" rx="14" ry="8" fill="#fb7185" opacity="0.85" />
      <ellipse cx="334" cy="198" rx="14" ry="8" fill="#fb7185" opacity="0.85" />
      <!-- Smile -->
      <path d="M 234 195 Q 250 216 266 195" fill="none" stroke="#22d3ee" stroke-width="8" stroke-linecap="round" />
      <!-- Sparkle -->
      <polygon points="345,135 348,141 354,144 348,147 345,153 342,147 336,144 342,141" fill="#fde047" opacity="0.9" />
    </g>
  </g>
</svg>`;

// -------------------------------------------------------------
// 2. BOTXY APP ICON (512x512)
// -------------------------------------------------------------
const botxyAppIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="iconBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#090d16" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="iconBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#2dd4bf" />
      <stop offset="100%" stop-color="#a855f7" />
    </linearGradient>
    <radialGradient id="backGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#14b8a6" stop-opacity="0.4" />
      <stop offset="60%" stop-color="#0284c7" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#020617" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect x="8" y="8" width="496" height="496" rx="120" fill="url(#iconBg)" stroke="url(#iconBorder)" stroke-width="8" />
  <circle cx="256" cy="240" r="190" fill="url(#backGlow)" />

  <g opacity="0.08" stroke="#38bdf8" stroke-width="1.5">
    <line x1="80" y1="0" x2="80" y2="512" /><line x1="160" y1="0" x2="160" y2="512" />
    <line x1="240" y1="0" x2="240" y2="512" /><line x1="320" y1="0" x2="320" y2="512" /><line x1="400" y1="0" x2="400" y2="512" />
    <line x1="0" y1="120" x2="512" y2="120" /><line x1="0" y1="200" x2="512" y2="200" />
    <line x1="0" y1="280" x2="512" y2="280" /><line x1="0" y1="360" x2="512" y2="360" />
  </g>

  <g transform="translate(18, 5) scale(0.93)">
    ${botxyCharacterSvg.replace(/<\/?svg[^>]*>/g, '')}
  </g>
</svg>`;

// -------------------------------------------------------------
// 3. BOTXY HORIZONTAL LOGO (1000x320)
// -------------------------------------------------------------
const botxyHorizontalSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 320" width="100%" height="100%">
  <g transform="translate(15, -60) scale(0.86)">
    ${botxyCharacterSvg.replace(/<\/?svg[^>]*>/g, '')}
  </g>

  <g transform="translate(420, 70)">
    <g id="brand-text">
      <text x="0" y="115" font-family="'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" font-size="108" font-weight="900" fill="#ffffff" letter-spacing="-2">
        <tspan fill="#38bdf8">x</tspan><tspan fill="#2dd4bf">y</tspan><tspan fill="#facc15">z</tspan><tspan fill="#ffffff" font-weight="800">pedia</tspan>
      </text>
      <g transform="translate(390, 48)">
        <polygon points="0,-12 4,-3 13,0 4,3 0,12 -4,3 -13,0 -4,-3" fill="#38bdf8" />
      </g>
    </g>

    <g transform="translate(4, 155)">
      <rect x="0" y="0" width="460" height="42" rx="21" fill="#1e293b" stroke="#334155" stroke-width="2" />
      <path d="M 24 13 L 14 26 L 22 26 L 18 36 L 30 22 L 22 22 Z" fill="#facc15" />
      <text x="42" y="27" font-family="'Plus Jakarta Sans', 'Inter', sans-serif" font-size="17" font-weight="800" fill="#cbd5e1" letter-spacing="2">
        FAST &amp; LEGAL GAME STORE
      </text>
      <circle cx="434" cy="21" r="5" fill="#22c55e" />
      <circle cx="434" cy="21" r="9" fill="#22c55e" opacity="0.35" />
    </g>
  </g>
</svg>`;

// -------------------------------------------------------------
// 4. XYZO (The Kawaii Cyber-Cat Mascot)
// -------------------------------------------------------------
const xyzoCharacterSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <linearGradient id="catHeadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#e2e8f0" />
    </linearGradient>
    <linearGradient id="catHoodie" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0369a1" />
    </linearGradient>
    <linearGradient id="earInner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#22d3ee" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
  </defs>

  <ellipse cx="250" cy="455" rx="130" ry="16" fill="#0f172a" opacity="0.15" />

  <!-- Tail -->
  <path d="M 170 380 Q 90 410 80 340 Q 75 290 120 270" fill="none" stroke="#0f172a" stroke-width="26" stroke-linecap="round" />
  <path d="M 170 380 Q 90 410 80 340 Q 75 290 120 270" fill="none" stroke="#38bdf8" stroke-width="14" stroke-linecap="round" />
  <circle cx="120" cy="270" r="14" fill="#facc15" stroke="#0f172a" stroke-width="6" />

  <!-- Body -->
  <path d="M 170 290 Q 250 275 330 290 L 345 405 C 345 435 155 435 155 405 Z" 
        fill="url(#catHoodie)" stroke="#0f172a" stroke-width="14" stroke-linejoin="round" />

  <rect x="185" y="410" width="46" height="32" rx="16" fill="#ffffff" stroke="#0f172a" stroke-width="8" />
  <rect x="269" y="410" width="46" height="32" rx="16" fill="#ffffff" stroke="#0f172a" stroke-width="8" />

  <line x1="250" y1="290" x2="250" y2="350" stroke="#0f172a" stroke-width="8" />
  <g transform="translate(250, 365)">
    <circle cx="0" cy="0" r="22" fill="#0f172a" />
    <path d="M -8 -8 L 8 8 M 8 -8 L -8 8" stroke="#facc15" stroke-width="6" stroke-linecap="round" />
  </g>

  <!-- Waving Lucky Paw -->
  <g transform="translate(370, 260) rotate(-25)">
    <ellipse cx="0" cy="0" rx="26" ry="22" fill="#ffffff" stroke="#0f172a" stroke-width="12" />
    <ellipse cx="0" cy="3" rx="10" ry="7" fill="#fb7185" />
    <circle cx="-10" cy="-6" r="4" fill="#fb7185" />
    <circle cx="0" cy="-9" r="4" fill="#fb7185" />
    <circle cx="10" cy="-6" r="4" fill="#fb7185" />
  </g>

  <!-- Headset -->
  <path d="M 120 180 C 120 70 380 70 380 180" fill="none" stroke="#0f172a" stroke-width="26" stroke-linecap="round" />
  <path d="M 120 180 C 120 70 380 70 380 180" fill="none" stroke="#22d3ee" stroke-width="12" stroke-linecap="round" />

  <!-- Ears -->
  <g id="cat-ears">
    <path d="M 130 160 L 125 50 L 210 110 Z" fill="#ffffff" stroke="#0f172a" stroke-width="14" stroke-linejoin="round" />
    <path d="M 142 145 L 140 75 L 195 115 Z" fill="url(#earInner)" stroke="#0f172a" stroke-width="6" />
    <path d="M 370 160 L 375 50 L 290 110 Z" fill="#ffffff" stroke="#0f172a" stroke-width="14" stroke-linejoin="round" />
    <path d="M 358 145 L 360 75 L 305 115 Z" fill="url(#earInner)" stroke="#0f172a" stroke-width="6" />
  </g>

  <!-- Headset dials -->
  <rect x="95" y="150" width="30" height="60" rx="15" fill="#facc15" stroke="#0f172a" stroke-width="10" />
  <rect x="375" y="150" width="30" height="60" rx="15" fill="#facc15" stroke="#0f172a" stroke-width="10" />

  <!-- Head -->
  <ellipse cx="250" cy="180" rx="135" ry="115" fill="url(#catHeadGrad)" stroke="#0f172a" stroke-width="14" />
  <polygon points="250,95 260,118 250,132 240,118" fill="#38bdf8" stroke="#0f172a" stroke-width="6" stroke-linejoin="round" />

  <!-- Eyes -->
  <g id="cat-eyes">
    <ellipse cx="195" cy="180" rx="20" ry="26" fill="#0f172a" />
    <circle cx="190" cy="170" r="8" fill="#ffffff" />
    <circle cx="203" cy="190" r="4" fill="#22d3ee" />

    <ellipse cx="305" cy="180" rx="20" ry="26" fill="#0f172a" />
    <circle cx="300" cy="170" r="8" fill="#ffffff" />
    <circle cx="313" cy="190" r="4" fill="#22d3ee" />
  </g>

  <!-- Nose & Mouth :3 -->
  <polygon points="250,205 244,198 256,198" fill="#fb7185" stroke="#0f172a" stroke-width="3" />
  <path d="M 235 210 Q 242 222 250 215 Q 258 222 265 210" fill="none" stroke="#0f172a" stroke-width="7" stroke-linecap="round" />
  <ellipse cx="160" cy="205" rx="15" ry="9" fill="#fb7185" opacity="0.8" />
  <ellipse cx="340" cy="205" rx="15" ry="9" fill="#fb7185" opacity="0.8" />
</svg>`;

// -------------------------------------------------------------
// 5. XYZO APP ICON (512x512)
// -------------------------------------------------------------
const xyzoAppIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="xyzoIconBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0c192c" />
      <stop offset="100%" stop-color="#030712" />
    </linearGradient>
    <linearGradient id="xyzoIconBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#fb7185" />
    </linearGradient>
    <radialGradient id="xyzoBackGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0284c7" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#020617" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect x="8" y="8" width="496" height="496" rx="120" fill="url(#xyzoIconBg)" stroke="url(#xyzoIconBorder)" stroke-width="8" />
  <circle cx="256" cy="240" r="190" fill="url(#xyzoBackGlow)" />

  <g transform="translate(15, 10) scale(0.94)">
    ${xyzoCharacterSvg.replace(/<\/?svg[^>]*>/g, '')}
  </g>
</svg>`;

// -------------------------------------------------------------
// 6. HOO (The Cyber Owl / Night Gamer Guardian)
// -------------------------------------------------------------
const hooCharacterSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <linearGradient id="owlBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#5b21b6" />
    </linearGradient>
    <linearGradient id="owlBelly" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc" />
      <stop offset="100%" stop-color="#cbd5e1" />
    </linearGradient>
  </defs>

  <ellipse cx="250" cy="455" rx="130" ry="16" fill="#0f172a" opacity="0.15" />

  <!-- Feet (Claws on perch) -->
  <rect x="195" y="420" width="35" height="20" rx="10" fill="#facc15" stroke="#0f172a" stroke-width="8" />
  <rect x="270" y="420" width="35" height="20" rx="10" fill="#facc15" stroke="#0f172a" stroke-width="8" />

  <!-- Owl Headphone Band -->
  <path d="M 110 190 C 110 60 390 60 390 190" fill="none" stroke="#0f172a" stroke-width="26" stroke-linecap="round" />
  <path d="M 110 190 C 110 60 390 60 390 190" fill="none" stroke="#facc15" stroke-width="12" stroke-linecap="round" />

  <!-- Owl Ear Tufts (Cyber Feather Horns) -->
  <polygon points="150,110 120,40 190,80" fill="#8b5cf6" stroke="#0f172a" stroke-width="12" stroke-linejoin="round" />
  <polygon points="350,110 380,40 310,80" fill="#8b5cf6" stroke="#0f172a" stroke-width="12" stroke-linejoin="round" />

  <!-- Main Body Silhouette (Round & Chubby) -->
  <ellipse cx="250" cy="260" rx="145" ry="170" fill="url(#owlBody)" stroke="#0f172a" stroke-width="14" />

  <!-- Left Wing -->
  <path d="M 105 240 Q 80 340 145 380 Q 155 330 145 280 Z" fill="#7c3aed" stroke="#0f172a" stroke-width="12" stroke-linejoin="round" />
  <!-- Right Wing (Tucking a Game Controller) -->
  <path d="M 395 240 Q 420 340 355 380 Q 345 330 355 280 Z" fill="#7c3aed" stroke="#0f172a" stroke-width="12" stroke-linejoin="round" />

  <!-- Belly -->
  <ellipse cx="250" cy="330" rx="90" ry="95" fill="url(#owlBelly)" stroke="#0f172a" stroke-width="10" />

  <!-- Belly Gamer Chevrons / Scales -->
  <path d="M 230 300 L 250 315 L 270 300" fill="none" stroke="#6366f1" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 220 335 L 250 355 L 280 335" fill="none" stroke="#6366f1" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 235 370 L 250 380 L 265 370" fill="none" stroke="#6366f1" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />

  <!-- Big Owl Eye Goggles (Neon Night Vision!) -->
  <g id="owl-eyes">
    <!-- Left Eye Ring -->
    <circle cx="190" cy="190" r="50" fill="#0f172a" stroke="#0f172a" stroke-width="6" />
    <circle cx="190" cy="190" r="42" fill="#22d3ee" />
    <circle cx="190" cy="190" r="28" fill="#0f172a" />
    <circle cx="180" cy="180" r="10" fill="#ffffff" />
    <circle cx="198" cy="198" r="4" fill="#38bdf8" />

    <!-- Right Eye Ring -->
    <circle cx="310" cy="190" r="50" fill="#0f172a" stroke="#0f172a" stroke-width="6" />
    <circle cx="310" cy="190" r="42" fill="#22d3ee" />
    <circle cx="310" cy="190" r="28" fill="#0f172a" />
    <circle cx="300" cy="180" r="10" fill="#ffffff" />
    <circle cx="318" cy="198" r="4" fill="#38bdf8" />

    <!-- Goggle Bridge Connector -->
    <rect x="230" y="182" width="40" height="16" rx="6" fill="#facc15" stroke="#0f172a" stroke-width="6" />
  </g>

  <!-- Cute Golden Beak -->
  <polygon points="250,210 236,238 264,238" fill="#facc15" stroke="#0f172a" stroke-width="8" stroke-linejoin="round" />

  <!-- Headset Ear Muff Dials -->
  <rect x="90" y="165" width="28" height="55" rx="14" fill="#22d3ee" stroke="#0f172a" stroke-width="10" />
  <rect x="382" y="165" width="28" height="55" rx="14" fill="#22d3ee" stroke="#0f172a" stroke-width="10" />
</svg>`;

// Write all SVGs
const assets = [
  { name: 'botxy-mascot.svg', content: botxyCharacterSvg },
  { name: 'botxy-horizontal.svg', content: botxyHorizontalSvg },
  { name: 'botxy-app-icon.svg', content: botxyAppIconSvg },
  { name: 'xyzo-mascot.svg', content: xyzoCharacterSvg },
  { name: 'xyzo-app-icon.svg', content: xyzoAppIconSvg },
  { name: 'hoo-mascot.svg', content: hooCharacterSvg },
];

for (const asset of assets) {
  const filePath = path.join(outputDir, asset.name);
  fs.writeFileSync(filePath, asset.content, 'utf8');
  fs.writeFileSync(path.join(artDir, asset.name), asset.content, 'utf8');
}

// Convert each SVG to high-res PNG
async function convertAll() {
  console.log('Rendering high-res PNGs...');

  const conversions = [
    { svg: botxyCharacterSvg, file: 'botxy-mascot.png', w: 1024, h: 1024 },
    { svg: botxyAppIconSvg, file: 'botxy-app-icon-512.png', w: 512, h: 512 },
    { svg: botxyAppIconSvg, file: 'botxy-app-icon-1024.png', w: 1024, h: 1024 },
    { svg: botxyHorizontalSvg, file: 'botxy-horizontal.png', w: 1200, h: 384 },
    { svg: xyzoCharacterSvg, file: 'xyzo-mascot.png', w: 1024, h: 1024 },
    { svg: xyzoAppIconSvg, file: 'xyzo-app-icon-512.png', w: 512, h: 512 },
    { svg: hooCharacterSvg, file: 'hoo-mascot.png', w: 1024, h: 1024 },
  ];

  for (const c of conversions) {
    const pubPath = path.join(outputDir, c.file);
    const artPath = path.join(artDir, c.file);
    const buf = await sharp(Buffer.from(c.svg))
      .resize(c.w, c.h)
      .png({ quality: 100 })
      .toBuffer();
    fs.writeFileSync(pubPath, buf);
    fs.writeFileSync(artPath, buf);
    console.log(`Rendered: ${c.file} (${c.w}x${c.h})`);
  }
}

await convertAll();
console.log('Done!');
