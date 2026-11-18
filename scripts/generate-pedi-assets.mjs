import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const outputDir = path.resolve('public/brand');
const artDir = 'C:/Users/LENOVO/.gemini/antigravity/brain/e7681e0f-f6e2-46e8-969f-ee61f6e42f2f';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// =============================================================
// REFINED PEDI MASCOT (The Gamepad Capsule with Glowing X Emblem)
// =============================================================
const pediCharacterSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <!-- Body Capsule Gradient (Electric Cyan & Deep Indigo Gamer Tone) -->
    <linearGradient id="pediBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="45%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>

    <!-- Visor Screen Gradient -->
    <linearGradient id="pediOledGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0b1329" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>

    <!-- Glowing Yellow Accent -->
    <linearGradient id="pediYellowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>

    <!-- Thruster Flame Gradient -->
    <linearGradient id="flameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="40%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" stop-opacity="0" />
    </linearGradient>

    <!-- Glow Filter for X and Visor -->
    <filter id="pediGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Soft Drop Shadow -->
    <filter id="pediShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#020617" flood-opacity="0.25" />
    </filter>
  </defs>

  <g id="pedi-character" filter="url(#pediShadow)">
    <!-- Ambient Floating Hover Shadow on Floor -->
    <ellipse cx="250" cy="460" rx="135" ry="16" fill="#0f172a" opacity="0.18" />

    <!-- Jet Booster Thruster Flames (Floating Hover Effect) -->
    <g id="thrusters">
      <!-- Left Flame -->
      <path d="M 190 395 Q 200 450 210 395 Z" fill="url(#flameGrad)" />
      <path d="M 194 395 Q 200 435 206 395 Z" fill="#ffffff" />
      <!-- Right Flame -->
      <path d="M 290 395 Q 300 450 310 395 Z" fill="url(#flameGrad)" />
      <path d="M 294 395 Q 300 435 306 395 Z" fill="#ffffff" />
      <!-- Thruster Nozzles -->
      <rect x="184" y="385" width="32" height="15" rx="7" fill="#0f172a" stroke="#0f172a" stroke-width="2" />
      <rect x="284" y="385" width="32" height="15" rx="7" fill="#0f172a" stroke="#0f172a" stroke-width="2" />
    </g>

    <!-- Top Shoulder Bumper Buttons (L & R triggers) -->
    <g id="shoulder-buttons">
      <!-- L Button -->
      <rect x="125" y="90" width="75" height="34" rx="16" fill="url(#pediYellowGrad)" stroke="#0f172a" stroke-width="12" />
      <line x1="145" y1="102" x2="180" y2="102" stroke="#0f172a" stroke-width="5" stroke-linecap="round" />
      <!-- R Button -->
      <rect x="300" y="90" width="75" height="34" rx="16" fill="url(#pediYellowGrad)" stroke="#0f172a" stroke-width="12" />
      <line x1="320" y1="102" x2="355" y2="102" stroke="#0f172a" stroke-width="5" stroke-linecap="round" />
    </g>

    <!-- Antenna on Top with Glowing Yellow Orb -->
    <g id="antenna">
      <line x1="250" y1="105" x2="250" y2="55" stroke="#0f172a" stroke-width="14" stroke-linecap="round" />
      <rect x="236" y="95" width="28" height="14" rx="6" fill="#0f172a" />
      <circle cx="250" cy="46" r="20" fill="url(#pediYellowGrad)" stroke="#0f172a" stroke-width="10" />
      <circle cx="244" cy="40" r="5" fill="#ffffff" />
      <!-- Radio Pulse Rings -->
      <path d="M 224 28 A 30 30 0 0 1 276 28" fill="none" stroke="#38bdf8" stroke-width="5" stroke-linecap="round" opacity="0.8" />
    </g>

    <!-- Main Controller Capsule Body Silhouette -->
    <!-- Ergonomic handheld gamepad curve with bottom grips -->
    <path d="M 140 115 
             C 195 95, 305 95, 360 115 
             C 430 140, 450 280, 400 375 
             C 380 410, 335 405, 305 365 
             C 275 330, 225 330, 195 365 
             C 165 405, 120 410, 100 375 
             C 50 280, 70 140, 140 115 Z" 
          fill="url(#pediBodyGrad)" stroke="#0f172a" stroke-width="14" stroke-linejoin="round" />

    <!-- Sleek Glossy Head Highlight Arc -->
    <path d="M 160 125 Q 250 112 340 125 C 348 126 348 134 338 134 Q 250 122 162 134 C 152 134 152 126 160 125 Z" 
          fill="#ffffff" opacity="0.4" />

    <!-- Left Controller Grip Detail: D-Pad -->
    <g transform="translate(100, 220)">
      <circle cx="25" cy="25" r="28" fill="#0f172a" opacity="0.3" />
      <!-- D-pad cross -->
      <rect x="10" y="20" width="30" height="10" rx="3" fill="#0f172a" stroke="#0f172a" stroke-width="2" />
      <rect x="20" y="10" width="10" height="30" rx="3" fill="#0f172a" stroke="#0f172a" stroke-width="2" />
      <circle cx="25" cy="25" r="4" fill="#38bdf8" />
      <!-- D-Pad Directional Triangles -->
      <polygon points="25,12 22,16 28,16" fill="#38bdf8" />
      <polygon points="25,38 22,34 28,34" fill="#38bdf8" />
      <polygon points="12,25 16,22 16,28" fill="#38bdf8" />
      <polygon points="38,25 34,22 34,28" fill="#38bdf8" />
    </g>

    <!-- Right Controller Grip Detail: Colorful Action Buttons (ABXY) -->
    <g transform="translate(350, 220)">
      <circle cx="25" cy="25" r="28" fill="#0f172a" opacity="0.3" />
      <!-- 4 Face Buttons -->
      <circle cx="25" cy="8" r="8" fill="#fb7185" stroke="#0f172a" stroke-width="4" /> <!-- Y (Pink) -->
      <circle cx="8" cy="25" r="8" fill="#38bdf8" stroke="#0f172a" stroke-width="4" /> <!-- X (Cyan) -->
      <circle cx="42" cy="25" r="8" fill="#facc15" stroke="#0f172a" stroke-width="4" /> <!-- B (Yellow) -->
      <circle cx="25" cy="42" r="8" fill="#4ade80" stroke="#0f172a" stroke-width="4" /> <!-- A (Green) -->
      <text x="25" y="11" font-family="'Plus Jakarta Sans', sans-serif" font-size="7" font-weight="900" fill="#ffffff" text-anchor="middle">Y</text>
      <text x="8" y="28" font-family="'Plus Jakarta Sans', sans-serif" font-size="7" font-weight="900" fill="#ffffff" text-anchor="middle">X</text>
      <text x="42" y="28" font-family="'Plus Jakarta Sans', sans-serif" font-size="7" font-weight="900" fill="#ffffff" text-anchor="middle">B</text>
      <text x="25" y="45" font-family="'Plus Jakarta Sans', sans-serif" font-size="7" font-weight="900" fill="#ffffff" text-anchor="middle">A</text>
    </g>

    <!-- Friendly Waving Hand (Right Side Floating Glove) -->
    <g transform="translate(415, 175) rotate(-15)">
      <!-- Wave Motion Arcs -->
      <path d="M 22 -14 Q 32 -8 30 10" fill="none" stroke="#38bdf8" stroke-width="5" stroke-linecap="round" />
      <path d="M 32 -22 Q 44 -12 42 16" fill="none" stroke="#38bdf8" stroke-width="5" stroke-linecap="round" />
      <!-- Waving Glove/Mitten -->
      <ellipse cx="0" cy="0" rx="20" ry="24" fill="#ffffff" stroke="#0f172a" stroke-width="11" />
      <ellipse cx="-13" cy="5" rx="8" ry="10" fill="#ffffff" stroke="#0f172a" stroke-width="8" />
      <!-- Cyan cuff band -->
      <rect x="-16" y="14" width="32" height="10" rx="5" fill="#38bdf8" stroke="#0f172a" stroke-width="5" />
    </g>

    <!-- Left Resting Hand/Glove -->
    <g transform="translate(85, 290)">
      <ellipse cx="0" cy="0" rx="18" ry="20" fill="#ffffff" stroke="#0f172a" stroke-width="10" />
      <rect x="-14" y="10" width="28" height="9" rx="4" fill="#38bdf8" stroke="#0f172a" stroke-width="5" />
    </g>

    <!-- Center OLED Visor Display (Face Screen) -->
    <rect x="155" y="140" width="190" height="125" rx="42" fill="url(#pediOledGrad)" stroke="#0f172a" stroke-width="12" />

    <!-- Visor Face Expression -->
    <g id="pedi-face">
      <!-- Left Happy Arched Eye (^ glow) -->
      <path d="M 188 198 Q 206 168 224 198" fill="none" stroke="#22d3ee" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M 188 198 Q 206 168 224 198" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" />

      <!-- Right Happy Arched Eye (^ glow) -->
      <path d="M 276 198 Q 294 168 312 198" fill="none" stroke="#22d3ee" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M 276 198 Q 294 168 312 198" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" />

      <!-- Cute Glowing Pink Blush Cheeks -->
      <ellipse cx="180" cy="216" rx="14" ry="8" fill="#fb7185" opacity="0.9" />
      <ellipse cx="320" cy="216" rx="14" ry="8" fill="#fb7185" opacity="0.9" />

      <!-- Happy Smiling Visor Mouth -->
      <path d="M 238 214 Q 250 232 262 214" fill="none" stroke="#22d3ee" stroke-width="8" stroke-linecap="round" />

      <!-- Cute Sparkle in Corner -->
      <polygon points="328,155 331,160 336,163 331,166 328,171 325,166 320,163 325,160" fill="#facc15" />
    </g>

    <!-- ======================================================== -->
    <!-- PROMINENT 'X' CONTROLLER BADGE ON CHEST (Just like Botxy) -->
    <!-- ======================================================== -->
    <g id="pedi-x-badge" transform="translate(250, 310)">
      <!-- Outer Metal Ring -->
      <circle cx="0" cy="0" r="34" fill="#0f172a" stroke="#38bdf8" stroke-width="4" />
      <!-- Inner Dark Plate -->
      <circle cx="0" cy="0" r="28" fill="#090d16" />
      <!-- Subtle Golden Rim Glow -->
      <circle cx="0" cy="0" r="26" fill="none" stroke="#facc15" stroke-width="1.5" opacity="0.6" />

      <!-- BOLD GLOWING 'X' SYMBOL -->
      <g filter="url(#pediGlow)">
        <!-- Diagonal 1 -->
        <line x1="-14" y1="-14" x2="14" y2="14" stroke="#22d3ee" stroke-width="10" stroke-linecap="round" />
        <line x1="-14" y1="-14" x2="14" y2="14" stroke="#ffffff" stroke-width="4" stroke-linecap="round" />
        <!-- Diagonal 2 -->
        <line x1="14" y1="-14" x2="-14" y2="14" stroke="#22d3ee" stroke-width="10" stroke-linecap="round" />
        <line x1="14" y1="-14" x2="-14" y2="14" stroke="#ffffff" stroke-width="4" stroke-linecap="round" />
      </g>
      <!-- Center Core Glint -->
      <circle cx="0" cy="0" r="4" fill="#ffffff" />
    </g>
  </g>
</svg>`;

// =============================================================
// PEDI HORIZONTAL BRAND LOGO (1000x320)
// =============================================================
const pediHorizontalSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 320" width="100%" height="100%">
  <!-- Left: Pedi Mascot Scaled & Centered -->
  <g transform="translate(15, -60) scale(0.86)">
    ${pediCharacterSvg.replace(/<\/?svg[^>]*>/g, '')}
  </g>

  <!-- Right: Modern Brand Typography xyzpedia -->
  <g transform="translate(420, 70)">
    <!-- Main Brand Name -->
    <g id="brand-text">
      <text x="0" y="115" font-family="'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" font-size="108" font-weight="900" fill="#ffffff" letter-spacing="-2">
        <tspan fill="#38bdf8">x</tspan><tspan fill="#2dd4bf">y</tspan><tspan fill="#facc15">z</tspan><tspan fill="#ffffff" font-weight="800">pedia</tspan>
      </text>

      <!-- Gaming Cross Sparkle above 'i' in pedia -->
      <g transform="translate(390, 48)">
        <polygon points="0,-12 4,-3 13,0 4,3 0,12 -4,3 -13,0 -4,-3" fill="#38bdf8" />
        <circle cx="0" cy="0" r="3" fill="#ffffff" />
      </g>
    </g>

    <!-- Subtitle / Tagline Pill Badge -->
    <g transform="translate(4, 155)">
      <!-- Pill Container -->
      <rect x="0" y="0" width="460" height="42" rx="21" fill="#1e293b" stroke="#334155" stroke-width="2" />
      
      <!-- Instant Delivery Lightning Icon -->
      <path d="M 24 13 L 14 26 L 22 26 L 18 36 L 30 22 L 22 22 Z" fill="#facc15" />

      <!-- Text -->
      <text x="42" y="27" font-family="'Plus Jakarta Sans', 'Inter', sans-serif" font-size="17" font-weight="800" fill="#cbd5e1" letter-spacing="2">
        FAST &amp; LEGAL GAME STORE
      </text>

      <!-- Active Green Status Pulse -->
      <circle cx="434" cy="21" r="5" fill="#22c55e" />
      <circle cx="434" cy="21" r="9" fill="#22c55e" opacity="0.35" />
    </g>
  </g>
</svg>`;

// =============================================================
// PEDI APP ICON / DOKU SQUIRCLE BADGE (512x512)
// =============================================================
const pediAppIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <!-- Dark Tech Canvas Gradient -->
    <linearGradient id="pediIconBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#090d16" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <!-- Border Gradient -->
    <linearGradient id="pediIconBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#2dd4bf" />
      <stop offset="100%" stop-color="#facc15" />
    </linearGradient>
    <!-- Ambient Radial Glow behind Pedi -->
    <radialGradient id="pediBackGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0284c7" stop-opacity="0.45" />
      <stop offset="60%" stop-color="#38bdf8" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#020617" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Squircle Base for App Icon / DOKU Logo -->
  <rect x="8" y="8" width="496" height="496" rx="120" fill="url(#pediIconBg)" stroke="url(#pediIconBorder)" stroke-width="8" />

  <!-- Background Ambient Glow -->
  <circle cx="256" cy="240" r="190" fill="url(#pediBackGlow)" />

  <!-- Subtle Cyber Grid -->
  <g opacity="0.08" stroke="#38bdf8" stroke-width="1.5">
    <line x1="80" y1="0" x2="80" y2="512" /><line x1="160" y1="0" x2="160" y2="512" />
    <line x1="240" y1="0" x2="240" y2="512" /><line x1="320" y1="0" x2="320" y2="512" /><line x1="400" y1="0" x2="400" y2="512" />
    <line x1="0" y1="120" x2="512" y2="120" /><line x1="0" y1="200" x2="512" y2="200" />
    <line x1="0" y1="280" x2="512" y2="280" /><line x1="0" y1="360" x2="512" y2="360" />
  </g>

  <!-- Pedi Mascot Centered -->
  <g transform="translate(18, 5) scale(0.93)">
    ${pediCharacterSvg.replace(/<\/?svg[^>]*>/g, '')}
  </g>
</svg>`;

// Save all Pedi SVG files
const pediAssets = [
  { name: 'pedi-mascot.svg', content: pediCharacterSvg },
  { name: 'pedi-horizontal.svg', content: pediHorizontalSvg },
  { name: 'pedi-app-icon.svg', content: pediAppIconSvg },
];

for (const asset of pediAssets) {
  const pubPath = path.join(outputDir, asset.name);
  const artPath = path.join(artDir, asset.name);
  fs.writeFileSync(pubPath, asset.content, 'utf8');
  fs.writeFileSync(artPath, asset.content, 'utf8');
  console.log(`Saved: ${pubPath}`);
}

// Convert all Pedi SVGs to high-res PNGs
async function renderPediPngs() {
  console.log('Rendering high-res Pedi PNGs...');

  const conversions = [
    { svg: pediCharacterSvg, file: 'pedi-mascot.png', w: 1024, h: 1024 },
    { svg: pediAppIconSvg, file: 'pedi-app-icon-512.png', w: 512, h: 512 },
    { svg: pediAppIconSvg, file: 'pedi-app-icon-1024.png', w: 1024, h: 1024 },
    { svg: pediHorizontalSvg, file: 'pedi-horizontal.png', w: 1200, h: 384 },
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

await renderPediPngs();
console.log('Pedi assets successfully generated!');
