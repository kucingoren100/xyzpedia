async function m() {
  const res = await fetch("https://waroengkuy.com/reseller/docs");
  const text = await res.text();
  console.log("Docs length:", text.length);
  // find ppob orders
  const idx = text.indexOf("/ppob/orders");
  if (idx !== -1) {
    console.log("PPOB docs snippet:\n", text.slice(idx - 100, idx + 500));
  } else {
    console.log("First 1000 chars:", text.slice(0, 1000));
  }
}

m().catch(console.error);
