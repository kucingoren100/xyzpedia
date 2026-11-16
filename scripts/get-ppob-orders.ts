async function m() {
  const res = await fetch("https://waroengkuy.com/api/reseller/v1/ppob/orders?limit=3", {
    headers: { Authorization: "Bearer wrk_15f6505ecd7be057da1448373998d9fb39b7d24a" },
  });
  const data = await res.json();
  console.log("PPOB Orders sample:", JSON.stringify(data.orders?.slice(0, 2), null, 2));
}

m().catch(console.error);
