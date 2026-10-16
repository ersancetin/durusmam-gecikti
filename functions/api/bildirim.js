import {
  ILLER, MAHKEME_TURLERI, adliyeListesi, ADLIYE_SERBEST_DESEN,
  KABUL_PENCERESI_GUN, AZAMI_GECIKME_DK, bugunTR, gunEkle,
} from "../../public/assets/js/veri.js";
import { json, hata, turnstileDogrula } from "../../lib/yardimci.js";

const TARIH = /^\d{4}-\d{2}-\d{2}$/;
const SAAT = /^([01]\d|2[0-3]):([0-5]\d)$/;

function dakika(saat) {
  const [, h, m] = saat.match(SAAT);
  return Number(h) * 60 + Number(m);
}

function bosluklariTemizle(metin) {
  return String(metin ?? "").trim().replace(/\s+/g, " ");
}

// Anonim gecikme bildirimi. Bu uç noktada IP, User-Agent veya herhangi bir başlık
// okunmaz ve saklanmaz; gönderilen saatler gecikme hesaplandıktan sonra atılır.
export async function onRequestPost({ request, env }) {
  let g;
  try {
    g = await request.json();
  } catch {
    return hata("Geçersiz istek.");
  }

  if (!(await turnstileDogrula(g.turnstile, env.TURNSTILE_SECRET))) {
    return hata("Robot doğrulaması başarısız. Sayfayı yenileyip tekrar deneyin.", 403);
  }

  const tarih = String(g.tarih ?? "");
  const bugun = bugunTR();
  if (!TARIH.test(tarih) || tarih > bugun || tarih < gunEkle(bugun, -KABUL_PENCERESI_GUN)) {
    return hata(`Yalnızca son ${KABUL_PENCERESI_GUN} gün içindeki duruşmalar bildirilebilir.`);
  }

  const il = String(g.il ?? "");
  if (!ILLER.includes(il)) return hata("Geçersiz il.");

  const adliye = bosluklariTemizle(g.adliye);
  if (!adliyeListesi(il).includes(adliye) && !ADLIYE_SERBEST_DESEN.test(adliye)) {
    return hata("Geçersiz adliye adı. Yalnızca harf kullanın.");
  }

  const tur = String(g.mahkeme_turu ?? "");
  if (!MAHKEME_TURLERI.includes(tur)) return hata("Geçersiz mahkeme türü.");

  const no = g.mahkeme_no === "" || g.mahkeme_no == null ? 0 : Number(g.mahkeme_no);
  if (!Number.isInteger(no) || no < 0 || no > 200) return hata("Geçersiz mahkeme numarası.");

  if (!SAAT.test(g.planlanan ?? "") || !SAAT.test(g.baslama ?? "")) {
    return hata("Saatleri SS:DD biçiminde girin.");
  }
  const planlanan = dakika(g.planlanan);
  const gecikme = Math.max(0, dakika(g.baslama) - planlanan);
  if (gecikme > AZAMI_GECIKME_DK) {
    return hata("Gecikme 10 saati aşamaz; saatleri kontrol edin.");
  }

  await env.DB.prepare(
    `INSERT INTO bildirimler (ay, il, adliye, mahkeme_turu, mahkeme_no, saat_dilimi, gecikme_dk)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).bind(tarih.slice(0, 7), il, adliye, tur, no, Math.floor(planlanan / 60), gecikme).run();

  return json({ tamam: true, gecikme_dk: gecikme }, 201, { "cache-control": "no-store" });
}
