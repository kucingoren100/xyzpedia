async function m() {
  const res = await fetch("https://waroengkuy.com/reseller/docs");
  const text = await res.text();
  const searchStr = "POST /orders — Beli akun / paket";
  const idx = text.indexOf(searchStr);
  if (idx !== -1) {
    console.log(text.slice(idx, idx + 2000).replace(/<[^>]+>/g, " "));
  } else {
    const idx2 = text.indexOf("POST /orders");
    if (idx2 !== -1) {
      console.log(text.slice(idx2, idx2 + 2000).replace(/<[^>]+>/g, " "));
    }
  }
}

m().catch(console.error);
