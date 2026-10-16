export function json(veri, durum = 200, ekBasliklar = {}) {
  return new Response(JSON.stringify(veri), {
    status: durum,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "x-content-type-options": "nosniff",
      ...ekBasliklar,
    },
  });
}

export function hata(mesaj, durum = 400) {
  return json({ hata: mesaj }, durum, { "cache-control": "no-store" });
}

export async function turnstileDogrula(token, gizliAnahtar) {
  // Gizli anahtar tanımlı değilse (yerel geliştirme) doğrulama atlanır.
  if (!gizliAnahtar) return true;
  if (!token) return false;
  const form = new FormData();
  form.append("secret", gizliAnahtar);
  form.append("response", token);
  // Bilinçli olarak `remoteip` gönderilmez: IP adresi hiçbir aşamada bizim tarafımızda işlenmez.
  const yanit = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });
  const sonuc = await yanit.json();
  return sonuc.success === true;
}

export function medyan(sirali) {
  if (sirali.length === 0) return 0;
  const orta = Math.floor(sirali.length / 2);
  return sirali.length % 2 ? sirali[orta] : Math.round((sirali[orta - 1] + sirali[orta]) / 2);
}

export function ozetle(gecikmeler) {
  const s = [...gecikmeler].sort((a, b) => a - b);
  const n = s.length;
  const toplam = s.reduce((a, b) => a + b, 0);
  return {
    n,
    ortalama: n ? Math.round(toplam / n) : 0,
    medyan: medyan(s),
    en_fazla: n ? s[n - 1] : 0,
    otuz_ustu_oran: n ? Math.round((s.filter((x) => x >= 30).length / n) * 100) : 0,
  };
}
