import fs from 'fs';
import path from 'path';

const outDir = path.join(process.cwd(), 'public', 'images', 'pulsa-ewallet');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

interface ItemConfig {
  slug: string;
  title: string;
  subtitle: string;
  categoryBadge: string;
  color: string;
  textColor: string;
  accentColor: string;
  iconSvg: string;
}

const configs: ItemConfig[] = [
  // PULSA
  {
    slug: 'pulsa-telkomsel',
    title: 'TELKOMSEL',
    subtitle: 'Pulsa Reguler &amp; Masa Aktif',
    categoryBadge: 'PULSA ALL OPERATOR',
    color: '#ED0226',
    textColor: '#FFFFFF',
    accentColor: '#FFD731',
    iconSvg: `<circle cx="240" cy="230" r="75" fill="#FFFFFF" stroke="#000000" stroke-width="6"/>
      <path d="M210 210 L270 210 L240 265 Z" fill="#ED0226" stroke="#000000" stroke-width="4"/>
      <circle cx="240" cy="195" r="14" fill="#ED0226" stroke="#000000" stroke-width="3"/>`
  },
  {
    slug: 'pulsa-indosat',
    title: 'INDOSAT IM3',
    subtitle: 'Pulsa Reguler Ooredoo',
    categoryBadge: 'PULSA ALL OPERATOR',
    color: '#FFC700',
    textColor: '#000000',
    accentColor: '#ED0226',
    iconSvg: `<rect x="165" y="155" width="150" height="150" rx="36" fill="#ED0226" stroke="#000000" stroke-width="6"/>
      <text x="240" y="245" font-family="system-ui, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" text-anchor="middle">im3</text>`
  },
  {
    slug: 'pulsa-xl',
    title: 'XL AXIATA',
    subtitle: 'Pulsa Reguler Prabayar',
    categoryBadge: 'PULSA ALL OPERATOR',
    color: '#002DBB',
    textColor: '#FFFFFF',
    accentColor: '#00D1FF',
    iconSvg: `<rect x="165" y="155" width="150" height="150" rx="36" fill="#00D1FF" stroke="#000000" stroke-width="6"/>
      <text x="240" y="250" font-family="system-ui, sans-serif" font-size="64" font-weight="900" fill="#002DBB" text-anchor="middle">XL</text>`
  },
  {
    slug: 'pulsa-axis',
    title: 'AXIS',
    subtitle: 'Pulsa Irit 24 Jam',
    categoryBadge: 'PULSA ALL OPERATOR',
    color: '#822980',
    textColor: '#FFFFFF',
    accentColor: '#FFD731',
    iconSvg: `<rect x="165" y="155" width="150" height="150" rx="75" fill="#FFD731" stroke="#000000" stroke-width="6"/>
      <text x="240" y="245" font-family="system-ui, sans-serif" font-size="44" font-weight="900" fill="#822980" text-anchor="middle">axis</text>`
  },
  {
    slug: 'pulsa-tri',
    title: 'TRI (3)',
    subtitle: 'Pulsa Tri Happy &amp; AON',
    categoryBadge: 'PULSA ALL OPERATOR',
    color: '#111111',
    textColor: '#FFFFFF',
    accentColor: '#FF4A00',
    iconSvg: `<rect x="165" y="155" width="150" height="150" rx="36" fill="#FF4A00" stroke="#000000" stroke-width="6"/>
      <text x="240" y="255" font-family="system-ui, sans-serif" font-size="76" font-weight="900" fill="#FFFFFF" text-anchor="middle">3</text>`
  },
  {
    slug: 'pulsa-smartfren',
    title: 'SMARTFREN',
    subtitle: 'Pulsa 4G LTE Nasional',
    categoryBadge: 'PULSA ALL OPERATOR',
    color: '#E6007E',
    textColor: '#FFFFFF',
    accentColor: '#FFD731',
    iconSvg: `<rect x="165" y="155" width="150" height="150" rx="36" fill="#FFFFFF" stroke="#000000" stroke-width="6"/>
      <text x="240" y="245" font-family="system-ui, sans-serif" font-size="40" font-weight="900" fill="#E6007E" text-anchor="middle">smart</text>`
  },
  {
    slug: 'pulsa-byu',
    title: 'by.U',
    subtitle: 'Pulsa Digital Telkomsel',
    categoryBadge: 'PULSA ALL OPERATOR',
    color: '#00A8E8',
    textColor: '#FFFFFF',
    accentColor: '#FFD731',
    iconSvg: `<rect x="165" y="155" width="150" height="150" rx="40" fill="#FFD731" stroke="#000000" stroke-width="6"/>
      <text x="240" y="248" font-family="system-ui, sans-serif" font-size="48" font-weight="900" fill="#00A8E8" text-anchor="middle">by.U</text>`
  },

  // E-WALLET
  {
    slug: 'saldo-dana',
    title: 'DANA',
    subtitle: 'Top Up Saldo Dompet Digital',
    categoryBadge: 'DOMPET DIGITAL E-WALLET',
    color: '#118EEA',
    textColor: '#FFFFFF',
    accentColor: '#FFD731',
    iconSvg: `<rect x="165" y="155" width="150" height="150" rx="40" fill="#FFFFFF" stroke="#000000" stroke-width="6"/>
      <text x="240" y="248" font-family="system-ui, sans-serif" font-size="42" font-weight="900" fill="#118EEA" text-anchor="middle">DANA</text>`
  },
  {
    slug: 'saldo-gopay',
    title: 'GOPAY',
    subtitle: 'Saldo Customer &amp; Driver',
    categoryBadge: 'DOMPET DIGITAL E-WALLET',
    color: '#00AED6',
    textColor: '#FFFFFF',
    accentColor: '#00AA13',
    iconSvg: `<rect x="165" y="155" width="150" height="150" rx="40" fill="#00AA13" stroke="#000000" stroke-width="6"/>
      <circle cx="240" cy="230" r="38" fill="#FFFFFF" stroke="#000000" stroke-width="4"/>
      <circle cx="240" cy="230" r="16" fill="#00AA13"/>`
  },
  {
    slug: 'saldo-ovo',
    title: 'OVO',
    subtitle: 'Top Up OVO Cash Resmi',
    categoryBadge: 'DOMPET DIGITAL E-WALLET',
    color: '#4C2A86',
    textColor: '#FFFFFF',
    accentColor: '#00D1FF',
    iconSvg: `<rect x="165" y="155" width="150" height="150" rx="40" fill="#FFFFFF" stroke="#000000" stroke-width="6"/>
      <text x="240" y="248" font-family="system-ui, sans-serif" font-size="46" font-weight="900" fill="#4C2A86" text-anchor="middle">OVO</text>`
  },
  {
    slug: 'saldo-shopeepay',
    title: 'SHOPEEPAY',
    subtitle: 'Top Up Saldo Shopee',
    categoryBadge: 'DOMPET DIGITAL E-WALLET',
    color: '#EE4D2D',
    textColor: '#FFFFFF',
    accentColor: '#FFD731',
    iconSvg: `<rect x="165" y="155" width="150" height="150" rx="40" fill="#FFFFFF" stroke="#000000" stroke-width="6"/>
      <path d="M220 195 C220 185 228 175 240 175 C252 175 260 185 260 195 L260 205 L220 205 Z" fill="none" stroke="#EE4D2D" stroke-width="5"/>
      <rect x="210" y="205" width="60" height="55" rx="8" fill="#EE4D2D"/>
      <text x="240" y="244" font-family="system-ui, sans-serif" font-size="28" font-weight="900" fill="#FFFFFF" text-anchor="middle">S</text>`
  },
  {
    slug: 'saldo-linkaja',
    title: 'LINKAJA',
    subtitle: 'Top Up Saldo LinkAja BUMN',
    categoryBadge: 'DOMPET DIGITAL E-WALLET',
    color: '#ED1C24',
    textColor: '#FFFFFF',
    accentColor: '#FFD731',
    iconSvg: `<rect x="165" y="155" width="150" height="150" rx="40" fill="#FFFFFF" stroke="#000000" stroke-width="6"/>
      <text x="240" y="235" font-family="system-ui, sans-serif" font-size="30" font-weight="900" fill="#ED1C24" text-anchor="middle">Link</text>
      <text x="240" y="265" font-family="system-ui, sans-serif" font-size="30" font-weight="900" fill="#ED1C24" text-anchor="middle">Aja!</text>`
  },
  {
    slug: 'saldo-astrapay',
    title: 'ASTRAPAY',
    subtitle: 'Top Up Saldo AstraPay',
    categoryBadge: 'DOMPET DIGITAL E-WALLET',
    color: '#004481',
    textColor: '#FFFFFF',
    accentColor: '#FFC700',
    iconSvg: `<rect x="165" y="155" width="150" height="150" rx="40" fill="#FFC700" stroke="#000000" stroke-width="6"/>
      <text x="240" y="242" font-family="system-ui, sans-serif" font-size="34" font-weight="900" fill="#004481" text-anchor="middle">ASTRA</text>`
  },
  {
    slug: 'saldo-isaku',
    title: 'i.SAKU',
    subtitle: 'Top Up Saldo Indomaret',
    categoryBadge: 'DOMPET DIGITAL E-WALLET',
    color: '#004B90',
    textColor: '#FFFFFF',
    accentColor: '#FF4A00',
    iconSvg: `<rect x="165" y="155" width="150" height="150" rx="40" fill="#FFFFFF" stroke="#000000" stroke-width="6"/>
      <text x="240" y="248" font-family="system-ui, sans-serif" font-size="40" font-weight="900" fill="#004B90" text-anchor="middle">i.saku</text>`
  },
  {
    slug: 'saldo-grabpay',
    title: 'GRABPAY',
    subtitle: 'Saldo Penumpang &amp; Driver',
    categoryBadge: 'DOMPET DIGITAL E-WALLET',
    color: '#00B14F',
    textColor: '#FFFFFF',
    accentColor: '#FFFFFF',
    iconSvg: `<rect x="165" y="155" width="150" height="150" rx="40" fill="#FFFFFF" stroke="#000000" stroke-width="6"/>
      <text x="240" y="248" font-family="system-ui, sans-serif" font-size="38" font-weight="900" fill="#00B14F" text-anchor="middle">Grab</text>`
  }
];

for (const c of configs) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 600" width="480" height="600">
  <!-- Background Base -->
  <rect x="6" y="6" width="468" height="588" rx="32" fill="#FBFBFD" stroke="#000000" stroke-width="6" />

  <!-- Top Brand Banner with Neo-brutalist Border -->
  <path d="M 6 38 Q 6 6 38 6 L 442 6 Q 474 6 474 38 L 474 360 L 6 360 Z" fill="${c.color}" stroke="#000000" stroke-width="6" />

  <!-- Dots Accent Pattern -->
  <g fill="${c.accentColor}" opacity="0.3">
    <circle cx="45" cy="45" r="5" /><circle cx="75" cy="45" r="5" /><circle cx="105" cy="45" r="5" />
    <circle cx="45" cy="75" r="5" /><circle cx="75" cy="75" r="5" /><circle cx="105" cy="75" r="5" />
    <circle cx="45" cy="105" r="5" /><circle cx="75" cy="105" r="5" /><circle cx="105" cy="105" r="5" />
    <circle cx="375" cy="45" r="5" /><circle cx="405" cy="45" r="5" /><circle cx="435" cy="45" r="5" />
    <circle cx="375" cy="75" r="5" /><circle cx="405" cy="75" r="5" /><circle cx="435" cy="75" r="5" />
  </g>

  <!-- Category Sticker Badge -->
  <rect x="35" y="32" width="220" height="32" rx="8" fill="#FFFFFF" stroke="#000000" stroke-width="3" />
  <text x="145" y="53" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#000000" text-anchor="middle" letter-spacing="1">${c.categoryBadge}</text>

  <!-- Center Icon Graphic -->
  <g>
    ${c.iconSvg}
  </g>

  <!-- Banner Bottom Divider Strip -->
  <rect x="6" y="356" width="468" height="8" fill="#000000" />

  <!-- Content Section -->
  <text x="40" y="420" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="900" fill="#000000" letter-spacing="-0.5">${c.title}</text>
  <text x="40" y="455" font-family="system-ui, -apple-system, sans-serif" font-size="17" font-weight="700" fill="#4B5563">${c.subtitle}</text>

  <!-- Bottom Badges -->
  <g transform="translate(40, 500)">
    <!-- Instant Badge -->
    <rect x="0" y="0" width="145" height="42" rx="10" fill="#FFD731" stroke="#000000" stroke-width="3" />
    <text x="72" y="26" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#000000" text-anchor="middle" letter-spacing="0.5">INJEKSI 1-3 DETIK</text>

    <!-- 24 Jam Badge -->
    <rect x="160" y="0" width="115" height="42" rx="10" fill="#55DB9C" stroke="#000000" stroke-width="3" />
    <text x="217" y="26" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#000000" text-anchor="middle" letter-spacing="0.5">ONLINE 24 JAM</text>

    <!-- Official Waroengkuy Badge -->
    <rect x="290" y="0" width="110" height="42" rx="10" fill="#FFFFFF" stroke="#000000" stroke-width="3" />
    <text x="345" y="26" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#000000" text-anchor="middle" letter-spacing="0.5">TERVERIFIKASI</text>
  </g>
</svg>`;

  const filePath = path.join(outDir, `${c.slug}.svg`);
  fs.writeFileSync(filePath, svg, 'utf-8');
  console.log(`Regenerated 100% valid XML: ${c.slug}.svg`);
}

console.log('All 15 SVGs updated with valid XML &amp;!');
