async function m() {
  const res = await fetch("https://waroengkuy.com/reseller/docs");
  const text = await res.text();
  const regex = /POST\s+\/ppob\/orders[\s\S]{1,1500}/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    console.log("MATCH:\n", match[0].replace(/<[^>]+>/g, " ").slice(0, 500));
  }
}

m().catch(console.error);
