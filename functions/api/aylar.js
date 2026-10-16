import { json } from "../../lib/yardimci.js";

// Bildirim bulunan aylar ve her aydaki toplam bildirim sayısı.
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT ay, COUNT(*) AS n FROM bildirimler GROUP BY ay ORDER BY ay DESC",
  ).all();
  return json(results, 200, { "cache-control": "public, max-age=300" });
}
