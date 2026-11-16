async function m() {
  const res = await fetch("https://waroengkuy.com/api/reseller/v1/profile", {
    headers: { Authorization: "Bearer wrk_15f6505ecd7be057da1448373998d9fb39b7d24a" },
  });
  const data = await res.json();
  console.log("Full error data:", JSON.stringify(data, null, 2));

  // Check /balance
  const bRes = await fetch("https://waroengkuy.com/api/reseller/v1/balance", {
    headers: { Authorization: "Bearer wrk_15f6505ecd7be057da1448373998d9fb39b7d24a" },
  });
  console.log("Balance data:", JSON.stringify(await bRes.json(), null, 2));
}

m().catch(console.error);
