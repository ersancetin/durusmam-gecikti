import { bugunTR } from "./veri.js";
import { API_TABANI } from "./ayar.js";

const $ = (id) => document.getElementById(id);
const AY_ADLARI = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

function ayAdi(ay) {
  const [y, m] = ay.split("-");
  return `${AY_ADLARI[Number(m) - 1]} ${y}`;
}

const dk = (n) => `${n} dk`;

function el(etiket, ozellikler = {}, ...cocuklar) {
  const e = document.createElement(etiket);
  Object.assign(e, ozellikler);
  e.append(...cocuklar);
  return e;
}

function bos(hedef, kolon) {
  const metin = "Bu dönem için yeterli bildirim yok.";
  hedef.replaceChildren(
    kolon ? el("tr", {}, el("td", { colSpan: kolon, className: "bos", textContent: metin })) : el("li", { className: "bos", textContent: metin }),
  );
}

function cubuklar(hedef, satirlar, etiket) {
  if (!satirlar.length) return bos(hedef);
  const enBuyuk = Math.max(...satirlar.map((s) => s.medyan), 1);
  hedef.replaceChildren(
    ...satirlar.map((s) => {
      const cubuk = el("span", { className: "cubuk" });
      cubuk.style.width = `${(s.medyan / enBuyuk) * 100}%`;
      const li = el(
        "li",
        { title: `${etiket(s)} — medyan ${s.medyan} dk, ortalama ${s.ortalama} dk, ${s.n} bildirim` },
        el("span", { className: "etiket" }, etiket(s), " ", el("small", { textContent: `(${s.n})` })),
        el("span", { className: "cubuk-alan" }, cubuk, el("span", { className: "cubuk-deger", textContent: dk(s.medyan) })),
      );
      return li;
    }),
  );
}

function tablo(satirlar) {
  const hedef = $("t-mahkemeler");
  if (!satirlar.length) return bos(hedef, 7);
  hedef.replaceChildren(
    ...satirlar.map((m) =>
      el(
        "tr",
        {},
        el("td", { textContent: m.mahkeme }),
        el("td", { textContent: `${m.il} / ${m.adliye}` }),
        el("td", { className: "sayi", textContent: m.n }),
        el("td", { className: "sayi", textContent: dk(m.medyan) }),
        el("td", { className: "sayi", textContent: dk(m.ortalama) }),
        el("td", { className: "sayi", textContent: dk(m.en_fazla) }),
        el("td", { className: "sayi", textContent: `%${m.otuz_ustu_oran}` }),
      ),
    ),
  );
}

async function yukle(ay) {
  $("baslik-ay").textContent = ayAdi(ay);
  $("csv-indir").href = `${API_TABANI}/api/rapor?ay=${ay}&bicim=csv`;
  history.replaceState(null, "", `?ay=${ay}`);

  let r;
  try {
    const yanit = await fetch(`${API_TABANI}/api/rapor?ay=${ay}`);
    if (!yanit.ok) throw new Error();
    r = await yanit.json();
  } catch {
    r = { asgari_bildirim: 3, genel: { n: 0 }, iller: [], turler: [], saatler: [], mahkemeler: [] };
  }
  $("asgari").textContent = r.asgari_bildirim;
  $("k-n").textContent = r.genel.n;
  $("k-medyan").textContent = r.genel.n ? dk(r.genel.medyan) : "–";
  $("k-ort").textContent = r.genel.n ? dk(r.genel.ortalama) : "–";
  $("k-oran").textContent = r.genel.n ? `%${r.genel.otuz_ustu_oran}` : "–";

  tablo(r.mahkemeler);
  cubuklar($("c-iller"), r.iller, (s) => s.ad);
  cubuklar($("c-turler"), r.turler, (s) => s.ad);
  cubuklar($("c-saatler"), r.saatler, (s) => `${String(s.saat).padStart(2, "0")}:00 – ${String(s.saat).padStart(2, "0")}:59`);
}

async function baslat() {
  const buAy = bugunTR().slice(0, 7);
  let aylar = [];
  try {
    const yanit = await fetch(`${API_TABANI}/api/aylar`);
    if (yanit.ok) aylar = await yanit.json();
  } catch {
    // Liste alınamazsa yalnızca içinde bulunulan ay gösterilir.
  }
  if (!aylar.some((a) => a.ay === buAy)) aylar.unshift({ ay: buAy, n: 0 });

  const sec = $("ay-sec");
  for (const a of aylar) sec.append(new Option(`${ayAdi(a.ay)} (${a.n})`, a.ay));

  const istenen = new URLSearchParams(location.search).get("ay");
  if (istenen && aylar.some((a) => a.ay === istenen)) sec.value = istenen;

  sec.addEventListener("change", () => yukle(sec.value));
  $("yazdir").addEventListener("click", () => window.print());
  yukle(sec.value);
}

baslat();
