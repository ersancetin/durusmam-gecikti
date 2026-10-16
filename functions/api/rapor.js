import { ASGARI_BILDIRIM, bugunTR, mahkemeAdi } from "../../public/assets/js/veri.js";
import { json, hata, ozetle } from "../../lib/yardimci.js";

const AY = /^\d{4}-(0[1-9]|1[0-2])$/;

function grupla(satirlar, anahtar) {
  const gruplar = new Map();
  for (const s of satirlar) {
    const k = anahtar(s);
    if (!gruplar.has(k)) gruplar.set(k, { ornek: s, gecikmeler: [] });
    gruplar.get(k).gecikmeler.push(s.gecikme_dk);
  }
  return [...gruplar.values()];
}

function csv(mahkemeler, ay) {
  const kacis = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const satirlar = [
    ["ay", "il", "adliye", "mahkeme", "bildirim_sayisi", "medyan_dk", "ortalama_dk", "en_fazla_dk", "otuz_dk_ustu_yuzde"],
    ...mahkemeler.map((m) => [ay, m.il, m.adliye, m.mahkeme, m.n, m.medyan, m.ortalama, m.en_fazla, m.otuz_ustu_oran]),
  ];
  return "﻿" + satirlar.map((r) => r.map(kacis).join(",")).join("\r\n");
}

// Aylık özet rapor. Yalnızca toplulaştırılmış (agregat) veri döner; tekil bildirimler
// asla dışarı verilmez ve ASGARI_BILDIRIM altındaki gruplar gizlenir.
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const ay = url.searchParams.get("ay") || bugunTR().slice(0, 7);
  if (!AY.test(ay)) return hata("Ay YYYY-AA biçiminde olmalı.");

  const { results } = await env.DB.prepare(
    `SELECT il, adliye, mahkeme_turu, mahkeme_no, saat_dilimi, gecikme_dk
     FROM bildirimler WHERE ay = ?`,
  ).bind(ay).all();

  const yeterli = (g) => g.gecikmeler.length >= ASGARI_BILDIRIM;
  const sirala = (a, b) => b.medyan - a.medyan || b.n - a.n;

  const mahkemeler = grupla(results, (s) => `${s.il}|${s.adliye}|${s.mahkeme_turu}|${s.mahkeme_no}`)
    .filter(yeterli)
    .map((g) => ({
      il: g.ornek.il,
      adliye: g.ornek.adliye,
      mahkeme: mahkemeAdi(g.ornek.mahkeme_turu, g.ornek.mahkeme_no),
      ...ozetle(g.gecikmeler),
    }))
    .sort(sirala);

  // Geçmiş aylar artık değişmediği için daha uzun önbelleklenir.
  const gecmisAy = ay < bugunTR().slice(0, 7);
  const onbellek = { "cache-control": `public, max-age=${gecmisAy ? 3600 : 300}` };

  if (url.searchParams.get("bicim") === "csv") {
    return new Response(csv(mahkemeler, ay), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="durusmam-gecikti-${ay}.csv"`,
        ...onbellek,
      },
    });
  }

  const iller = grupla(results, (s) => s.il)
    .filter(yeterli)
    .map((g) => ({ ad: g.ornek.il, ...ozetle(g.gecikmeler) }))
    .sort(sirala);

  const turler = grupla(results, (s) => s.mahkeme_turu)
    .filter(yeterli)
    .map((g) => ({ ad: g.ornek.mahkeme_turu, ...ozetle(g.gecikmeler) }))
    .sort(sirala);

  const saatler = grupla(results, (s) => s.saat_dilimi)
    .filter(yeterli)
    .map((g) => ({ saat: g.ornek.saat_dilimi, ...ozetle(g.gecikmeler) }))
    .sort((a, b) => a.saat - b.saat);

  return json(
    {
      ay,
      asgari_bildirim: ASGARI_BILDIRIM,
      genel: ozetle(results.map((s) => s.gecikme_dk)),
      iller,
      turler,
      saatler,
      mahkemeler,
    },
    200,
    onbellek,
  );
}
