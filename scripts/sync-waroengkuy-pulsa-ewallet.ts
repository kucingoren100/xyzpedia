process.loadEnvFile('.env');
import { prisma } from '../src/lib/prisma';
import { WaroengkuyClient } from '../src/lib/waroengkuy';

interface PulsaEwalletProductDef {
  slug: string;
  name: string;
  type: 'pulsa' | 'ewallet';
  operator: string;
  match: (item: any) => boolean;
  tagline: string;
  description: string;
  targetInputLabel: string;
  targetInputPlaceholder: string;
  instructions: string;
  badgeText: string;
  badgeColor: string;
}

const PRODUCT_DEFS: PulsaEwalletProductDef[] = [
  // PULSA
  {
    slug: 'pulsa-telkomsel',
    name: 'Pulsa Telkomsel',
    type: 'pulsa',
    operator: 'Telkomsel',
    match: (i) => i.product === 'Pulsa Telkomsel',
    tagline: 'Isi pulsa Telkomsel SimPATI, Loop & Kartu AS murah resmi',
    description: 'Layanan isi ulang pulsa reguler Telkomsel otomatis 24 jam nonstop dengan masa aktif bertambah.',
    targetInputLabel: 'Nomor HP Telkomsel',
    targetInputPlaceholder: 'Contoh: 081234567890',
    instructions: 'Pastikan nomor HP Telkomsel dalam masa aktif dan tidak salah memasukkan angka.',
    badgeText: 'PULSA RESMI',
    badgeColor: 'ember',
  },
  {
    slug: 'pulsa-indosat',
    name: 'Pulsa Indosat IM3',
    type: 'pulsa',
    operator: 'Indosat Ooredoo',
    match: (i) => i.product === 'Pulsa Indosat',
    tagline: 'Isi pulsa Indosat IM3 Ooredoo instan tanpa antri',
    description: 'Top up pulsa Indosat murah terpercaya, langsung masuk dalam 1-3 detik setelah verifikasi pembayaran.',
    targetInputLabel: 'Nomor HP Indosat IM3',
    targetInputPlaceholder: 'Contoh: 085712345678',
    instructions: 'Masukkan nomor Indosat IM3 tujuan dengan benar. Pulsa akan langsung terkirim otomatis.',
    badgeText: 'PULSA RESMI',
    badgeColor: 'sunburst',
  },
  {
    slug: 'pulsa-xl',
    name: 'Pulsa XL Axiata',
    type: 'pulsa',
    operator: 'XL Axiata',
    match: (i) => i.product === 'Pulsa XL',
    tagline: 'Isi pulsa XL Axiata termurah dan tercepat',
    description: 'Beli pulsa XL murah instan ke seluruh nomor prabayar XL Indonesia dengan jaminan terkirim.',
    targetInputLabel: 'Nomor HP XL',
    targetInputPlaceholder: 'Contoh: 087812345678',
    instructions: 'Masukkan nomor XL tujuan dengan format yang benar (awali dengan 08...).',
    badgeText: 'PULSA RESMI',
    badgeColor: 'electric-blue',
  },
  {
    slug: 'pulsa-axis',
    name: 'Pulsa Axis',
    type: 'pulsa',
    operator: 'Axis',
    match: (i) => i.product === 'Pulsa Axis',
    tagline: 'Isi pulsa Axis hemat dan cepat online 24 jam',
    description: 'Pulsa Axis prabayar harga agen murah, siap menambah pulsa dan masa aktif kartumu.',
    targetInputLabel: 'Nomor HP Axis',
    targetInputPlaceholder: 'Contoh: 083812345678',
    instructions: 'Pastikan nomor Axis tujuan sudah benar dan tidak sedang dalam masa tenggang kadaluarsa.',
    badgeText: 'PULSA RESMI',
    badgeColor: 'voltage-violet',
  },
  {
    slug: 'pulsa-tri',
    name: 'Pulsa Tri (3)',
    type: 'pulsa',
    operator: 'Tri Indonesia',
    match: (i) => i.product === 'Pulsa Tri',
    tagline: 'Isi pulsa Tri (Three) Indonesia proses kilat',
    description: 'Layanan isi ulang pulsa Tri online harga termurah, otomatis masuk hitungan detik.',
    targetInputLabel: 'Nomor HP Tri (3)',
    targetInputPlaceholder: 'Contoh: 089612345678',
    instructions: 'Masukkan nomor Tri tujuan. Pulsa akan bertambah dan masa aktif kartu diperpanjang.',
    badgeText: 'PULSA RESMI',
    badgeColor: 'mint-pop',
  },
  {
    slug: 'pulsa-smartfren',
    name: 'Pulsa Smartfren',
    type: 'pulsa',
    operator: 'Smartfren',
    match: (i) => i.product === 'Pulsa Smartfren',
    tagline: 'Isi pulsa Smartfren 4G LTE termurah online',
    description: 'Beli pulsa Smartfren reguler langsung masuk ke nomor kartu prabayar Anda.',
    targetInputLabel: 'Nomor HP Smartfren',
    targetInputPlaceholder: 'Contoh: 088112345678',
    instructions: 'Pastikan nomor Smartfren dalam status aktif untuk menerima pengisian pulsa.',
    badgeText: 'PULSA RESMI',
    badgeColor: 'ember',
  },
  {
    slug: 'pulsa-byu',
    name: 'Pulsa by.U',
    type: 'pulsa',
    operator: 'by.U Telkomsel',
    match: (i) => i.product === 'Pulsa By.U',
    tagline: 'Isi pulsa by.U Telkomsel serba digital cepat',
    description: 'Top up pulsa by.U resmi harga bersahabat untuk beli kuota yang bikin kamu happy.',
    targetInputLabel: 'Nomor HP by.U',
    targetInputPlaceholder: 'Contoh: 085112345678',
    instructions: 'Masukkan nomor by.U Anda. Pulsa akan masuk langsung ke saldo akun by.U.',
    badgeText: 'PULSA RESMI',
    badgeColor: 'electric-blue',
  },

  // E-WALLET
  {
    slug: 'saldo-dana',
    name: 'Saldo DANA',
    type: 'ewallet',
    operator: 'DANA Indonesia',
    match: (i) => i.product === 'Saldo DANA',
    tagline: 'Top up saldo DANA murah instan 24 jam',
    description: 'Isi saldo DANA dompet digital resmi tanpa repot, langsung terverifikasi dan masuk ke akun DANA Anda.',
    targetInputLabel: 'Nomor HP Terdaftar di DANA',
    targetInputPlaceholder: 'Contoh: 081234567890',
    instructions: 'Pastikan nomor HP sudah terdaftar di aplikasi DANA (bebas akun Premium / Regular).',
    badgeText: 'INSTAN 24 JAM',
    badgeColor: 'electric-blue',
  },
  {
    slug: 'saldo-gopay',
    name: 'Saldo GoPay',
    type: 'ewallet',
    operator: 'GoPay / GoTo',
    match: (i) => i.product === 'Saldo GoPay' || i.product === 'Saldo GoPay Driver' || i.product === 'Saldo GoPay Promo',
    tagline: 'Top up saldo GoPay Customer & Driver instan',
    description: 'Isi saldo GoPay untuk belanja di Gojek, Tokopedia, dan transfer online dengan biaya admin terjangkau.',
    targetInputLabel: 'Nomor HP Akun GoPay',
    targetInputPlaceholder: 'Contoh: 081234567890',
    instructions: 'Masukkan nomor handphone yang terdaftar di akun GoPay/Gojek Anda.',
    badgeText: 'INSTAN 24 JAM',
    badgeColor: 'mint-pop',
  },
  {
    slug: 'saldo-ovo',
    name: 'Saldo OVO',
    type: 'ewallet',
    operator: 'OVO',
    match: (i) => i.product === 'Saldo OVO' || i.product === 'Saldo OVO (Termasuk Admin)',
    tagline: 'Top up saldo OVO Cash instan termurah',
    description: 'Isi ulang saldo OVO Cash resmi tanpa ribet, langsung masuk dalam hitungan detik.',
    targetInputLabel: 'Nomor HP Akun OVO',
    targetInputPlaceholder: 'Contoh: 081234567890',
    instructions: 'Masukkan nomor HP yang terdaftar di akun OVO (Club/Premier).',
    badgeText: 'INSTAN 24 JAM',
    badgeColor: 'voltage-violet',
  },
  {
    slug: 'saldo-shopeepay',
    name: 'Saldo ShopeePay',
    type: 'ewallet',
    operator: 'ShopeePay',
    match: (i) => i.product === 'Saldo ShopeePay' || i.product === 'Saldo ShopeePay (Belum Termasuk Admin)',
    tagline: 'Top up saldo ShopeePay murah instan',
    description: 'Beli saldo ShopeePay untuk belanja checkout hemat di Shopee dan bayar merchant QRIS.',
    targetInputLabel: 'Nomor HP Akun ShopeePay',
    targetInputPlaceholder: 'Contoh: 081234567890',
    instructions: 'Masukkan nomor handphone yang terhubung dengan akun Shopee / ShopeePay Anda.',
    badgeText: 'INSTAN 24 JAM',
    badgeColor: 'ember',
  },
  {
    slug: 'saldo-linkaja',
    name: 'Saldo LinkAja',
    type: 'ewallet',
    operator: 'LinkAja',
    match: (i) => i.product === 'Saldo LinkAja' || i.product === 'Saldo LinkAja (Entitas)',
    tagline: 'Top up saldo LinkAja BUMN murah terpercaya',
    description: 'Isi ulang saldo LinkAja reguler dan entitas untuk transaksi sehari-hari dan bayar tagihan.',
    targetInputLabel: 'Nomor HP Akun LinkAja',
    targetInputPlaceholder: 'Contoh: 081234567890',
    instructions: 'Masukkan nomor HP yang terdaftar di aplikasi LinkAja.',
    badgeText: 'INSTAN 24 JAM',
    badgeColor: 'ember',
  },
  {
    slug: 'saldo-astrapay',
    name: 'Saldo AstraPay',
    type: 'ewallet',
    operator: 'AstraPay',
    match: (i) => i.product === 'Saldo AstraPay',
    tagline: 'Top up saldo AstraPay instan resmi',
    description: 'Isi saldo AstraPay untuk bayar angsuran FIF, servis motor Honda, hingga QRIS.',
    targetInputLabel: 'Nomor HP Akun AstraPay',
    targetInputPlaceholder: 'Contoh: 081234567890',
    instructions: 'Masukkan nomor HP yang terdaftar pada akun AstraPay Anda.',
    badgeText: 'INSTAN 24 JAM',
    badgeColor: 'electric-blue',
  },
  {
    slug: 'saldo-isaku',
    name: 'Saldo i.saku',
    type: 'ewallet',
    operator: 'i.saku Indomaret',
    match: (i) => i.product === 'Saldo i.saku',
    tagline: 'Top up saldo i.saku Indomaret cepat',
    description: 'Isi saldo i.saku untuk belanja mudah di Indomaret dan merchant mitra.',
    targetInputLabel: 'Nomor HP Akun i.saku',
    targetInputPlaceholder: 'Contoh: 081234567890',
    instructions: 'Masukkan nomor HP yang terdaftar pada aplikasi i.saku.',
    badgeText: 'INSTAN 24 JAM',
    badgeColor: 'sunburst',
  },
  {
    slug: 'saldo-grabpay',
    name: 'Saldo GrabPay',
    type: 'ewallet',
    operator: 'Grab',
    match: (i) => i.product === 'Saldo GrabPay' || i.product === 'Saldo GrabPay Driver',
    tagline: 'Top up saldo GrabPay Penumpang & Driver',
    description: 'Isi saldo dompet GrabPay penumpang maupun dompet kredit driver Grab.',
    targetInputLabel: 'Nomor HP Akun Grab',
    targetInputPlaceholder: 'Contoh: 081234567890',
    instructions: 'Masukkan nomor handphone akun Grab aktif.',
    badgeText: 'INSTAN 24 JAM',
    badgeColor: 'mint-pop',
  }
];

async function main() {
  console.log('=== SINKRONISASI PULSA & E-WALLET DARI WAROENGKUY ===');

  // 1. Ensure category 'pulsa-ewallet' exists
  const category = await prisma.category.upsert({
    where: { slug: 'pulsa-ewallet' },
    update: {
      name: 'Pulsa & E-Wallet',
      icon: 'Smartphone',
      badge: 'Injeksi Otomatis',
      order: 4
    },
    create: {
      name: 'Pulsa & E-Wallet',
      slug: 'pulsa-ewallet',
      icon: 'Smartphone',
      badge: 'Injeksi Otomatis',
      order: 4
    }
  });

  console.log(`Kategori '${category.name}' (${category.slug}) siap.`);

  // 2. Fetch PPOB items from Waroengkuy
  const client = new WaroengkuyClient();
  const ppob = await client.fetchPpobProducts();
  console.log(`Ditemukan ${ppob.length} total item PPOB dari Waroengkuy.`);

  let totalProductsSynced = 0;
  let totalVariantsSynced = 0;
  let totalAvailable = 0;
  let totalOutOfStock = 0;

  // 3. Process each defined product
  for (const def of PRODUCT_DEFS) {
    const matchedItems = ppob.filter(def.match);
    if (matchedItems.length === 0) {
      console.warn(`[SKIP] Tidak ada item ditemukan untuk ${def.name}`);
      continue;
    }

    console.log(`\n-> Memproses ${def.name} (${def.slug}) [${matchedItems.length} item]...`);

    const product = await prisma.product.upsert({
      where: { slug: def.slug },
      update: {
        name: def.name,
        category: { connect: { slug: category.slug } },
        developer: def.operator,
        tagline: def.tagline,
        description: def.description,
        thumbnailUrl: `/images/pulsa-ewallet/${def.slug}.svg`,
        bannerUrl: `/images/pulsa-ewallet/${def.slug}.svg`,
        requiresServer: false,
        targetInputLabel: def.targetInputLabel,
        targetInputPlaceholder: def.targetInputPlaceholder,
        instructions: def.instructions,
        badgeText: def.badgeText,
        badgeColor: def.badgeColor,
        isPopular: true
      },
      create: {
        name: def.name,
        slug: def.slug,
        categorySlug: category.slug,
        developer: def.operator,
        tagline: def.tagline,
        description: def.description,
        thumbnailUrl: `/images/pulsa-ewallet/${def.slug}.svg`,
        bannerUrl: `/images/pulsa-ewallet/${def.slug}.svg`,
        requiresServer: false,
        targetInputLabel: def.targetInputLabel,
        targetInputPlaceholder: def.targetInputPlaceholder,
        instructions: def.instructions,
        badgeText: def.badgeText,
        badgeColor: def.badgeColor,
        isPopular: true
      }
    });

    totalProductsSynced++;

    // Sort items by price ascending
    matchedItems.sort((a, b) => a.price - b.price);

    let orderIndex = 1;
    for (const item of matchedItems) {
      const sku = String(item.variant_id || item.id || item.sku);
      const isAvailable = Boolean(item.available);
      const originalPrice = Math.round(item.price * 1.05);

      await prisma.productItem.upsert({
        where: { sku },
        update: {
          productId: product.id,
          name: item.label,
          price: item.price,
          originalPrice: originalPrice,
          discountPercent: 5,
          stockStatus: isAvailable ? 'AVAILABLE' : 'OUT_OF_STOCK',
          order: orderIndex++
        },
        create: {
          productId: product.id,
          sku,
          name: item.label,
          price: item.price,
          originalPrice: originalPrice,
          discountPercent: 5,
          stockStatus: isAvailable ? 'AVAILABLE' : 'OUT_OF_STOCK',
          order: orderIndex++
        }
      });

      totalVariantsSynced++;
      if (isAvailable) totalAvailable++;
      else totalOutOfStock++;
    }
  }

  console.log('\n==================================================');
  console.log(`✅ SINKRONISASI BERHASIL!`);
  console.log(`- Total Produk Pulsa & E-Wallet: ${totalProductsSynced}`);
  console.log(`- Total Varian/Denominasi: ${totalVariantsSynced}`);
  console.log(`- Varian Siap Beli (AVAILABLE): ${totalAvailable}`);
  console.log(`- Varian Habis (OUT_OF_STOCK): ${totalOutOfStock}`);
  console.log('==================================================');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
