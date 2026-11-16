async function m() {
  const res = await fetch("https://waroengkuy.com/reseller/docs");
  const text = await res.text();
  const targetStr = 'id="ppob-order-create"';
  let idx = text.indexOf(targetStr);
  if (idx === -1) idx = text.indexOf('POST /ppob/orders');
  if (idx !== -1) {
    // strip HTML tags
    const snippet = text.slice(idx, idx + 2500).replace(/<[^>]+>/g, " ");
    console.log("Snippet:\n", snippet);
  }
}

m().catch(console.error);
