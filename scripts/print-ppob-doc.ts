async function m() {
  const res = await fetch("https://waroengkuy.com/reseller/docs");
  const text = await res.text();
  const searchStr = "POST /ppob/orders — PPOB: isi pulsa / e-wallet / token / game";
  const idx = text.indexOf(searchStr);
  if (idx !== -1) {
    console.log(text.slice(idx, idx + 3000).replace(/<[^>]+>/g, " "));
  }
}

m().catch(console.error);
