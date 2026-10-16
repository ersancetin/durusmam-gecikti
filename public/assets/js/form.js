import {
  ILLER, MAHKEME_TURLERI, adliyeListesi, KABUL_PENCERESI_GUN, AZAMI_GECIKME_DK, bugunTR, gunEkle,
} from "./veri.js";

const $ = (id) => document.getElementById(id);
const DIGER = "__diger__";

const form = $("bildirim-formu");
const il = $("il");
const adliye = $("adliye");
const adliyeDigerKap = $("adliye-diger-kap");
const adliyeDiger = $("adliye-diger");
const sonuc = $("sonuc");

function secenekler(select, degerler, ilkMetin) {
  select.replaceChildren();
  if (ilkMetin) select.append(new Option(ilkMetin, ""));
  for (const d of degerler) select.append(typeof d === "string" ? new Option(d, d) : new Option(d[1], d[0]));
}

function adliyeleriDoldur() {
  if (!il.value) {
    secenekler(adliye, [], "Önce il seçin");
  } else {
    secenekler(adliye, [...adliyeListesi(il.value), [DIGER, "Diğer (ilçe adliyesi)"]]);
  }
  adliyeDegisti();
}

function adliyeDegisti() {
  adliyeDigerKap.hidden = adliye.value !== DIGER;
}

function dakika(saat) {
  if (!saat) return null;
  const [h, m] = saat.split(":").map(Number);
  return h * 60 + m;
}

function gecikmeHesapla() {
  const p = dakika($("planlanan").value);
  const b = dakika($("baslama").value);
  if (p == null || b == null) return null;
  return Math.max(0, b - p);
}

function sureMetni(dk) {
  const s = Math.floor(dk / 60);
  const d = dk % 60;
  return s ? `${s} sa ${d} dk` : `${d} dk`;
}

function onizle() {
  const g = gecikmeHesapla();
  $("onizleme").textContent = g == null ? "" : `Hesaplanan gecikme: ${sureMetni(g)}`;
}

function mesajGoster(metin, tur) {
  sonuc.textContent = metin;
  sonuc.className = `mesaj ${tur}`;
  sonuc.hidden = false;
}

// --- Turnstile (bot koruması). Site anahtarı tanımlı değilse hiç yüklenmez. ---
let turnstileToken = "";
let turnstileWidget = null;

async function turnstileKur() {
  try {
    const ayar = await (await fetch("/api/ayarlar")).json();
    if (!ayar.turnstile_site_key) return;
    const betik = document.createElement("script");
    betik.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    betik.async = true;
    betik.onload = () => {
      turnstileWidget = window.turnstile.render("#turnstile-kap", {
        sitekey: ayar.turnstile_site_key,
        language: "tr",
        callback: (t) => { turnstileToken = t; },
        "expired-callback": () => { turnstileToken = ""; },
      });
    };
    document.head.append(betik);
  } catch {
    // Ayar alınamazsa sunucu doğrulaması zaten hatayı bildirir.
  }
}

async function gonder(olay) {
  olay.preventDefault();
  sonuc.hidden = true;

  const adliyeDegeri = adliye.value === DIGER ? adliyeDiger.value.trim() : adliye.value;
  const gecikme = gecikmeHesapla();
  const eksik =
    !$("tarih").value || !il.value || !adliyeDegeri || !$("mahkeme-turu").value || gecikme == null;
  if (eksik) return mesajGoster("Lütfen tüm zorunlu alanları doldurun.", "hata");
  if (gecikme > AZAMI_GECIKME_DK) return mesajGoster("Gecikme 10 saati aşamaz; saatleri kontrol edin.", "hata");

  const dugme = $("gonder");
  dugme.disabled = true;
  try {
    const yanit = await fetch("/api/bildirim", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        tarih: $("tarih").value,
        il: il.value,
        adliye: adliyeDegeri,
        mahkeme_turu: $("mahkeme-turu").value,
        mahkeme_no: $("mahkeme-no").value,
        planlanan: $("planlanan").value,
        baslama: $("baslama").value,
        turnstile: turnstileToken,
      }),
    });
    const veri = await yanit.json();
    if (!yanit.ok) throw new Error(veri.hata || "Bildirim kaydedilemedi.");
    mesajGoster(`Teşekkürler. ${sureMetni(veri.gecikme_dk)} gecikme anonim olarak kaydedildi.`, "basari");
    $("planlanan").value = "";
    $("baslama").value = "";
    onizle();
  } catch (e) {
    mesajGoster(e.message, "hata");
  } finally {
    dugme.disabled = false;
    if (turnstileWidget != null) {
      window.turnstile.reset(turnstileWidget);
      turnstileToken = "";
    }
  }
}

const bugun = bugunTR();
$("tarih").max = bugun;
$("tarih").min = gunEkle(bugun, -KABUL_PENCERESI_GUN);
$("tarih").value = bugun;
secenekler(il, ILLER, "İl seçin");
secenekler($("mahkeme-turu"), MAHKEME_TURLERI, "Mahkeme türü seçin");
adliyeleriDoldur();

il.addEventListener("change", adliyeleriDoldur);
adliye.addEventListener("change", adliyeDegisti);
$("planlanan").addEventListener("input", onizle);
$("baslama").addEventListener("input", onizle);
form.addEventListener("submit", gonder);
turnstileKur();
