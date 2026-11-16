export default function TopMarquee() {
  const content = (
    <span className="px-6 flex items-center gap-3">
      <span>⚡ PROSES OTOMATIS INSTAN 24/7</span>
      <span className="text-[#ffd731]">✦</span>
      <span>100% API RESMI PUBLISHER</span>
      <span className="text-[#55db9c]">✦</span>
      <span>CHECKOUT LANGSUNG (TANPA PERLU LOGIN)</span>
      <span className="text-[#fb4903]">✦</span>
      <span>QRIS 0% BIAYA ADMIN</span>
      <span className="text-[#4da2ff]">✦</span>
      <span>PENGIRIMAN KILAT DI BAWAH 5 DETIK</span>
    </span>
  );

  return (
    <div className="w-full bg-[#000000] text-[#ffffff] overflow-hidden py-2 border-b border-[#000000] select-none z-50">
      <div className="animate-marquee whitespace-nowrap flex items-center text-xs font-black tracking-wider uppercase">
        {content}
        {content}
      </div>
    </div>
  );
}
