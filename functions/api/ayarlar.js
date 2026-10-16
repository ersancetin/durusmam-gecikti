import { json } from "../../lib/yardimci.js";

// Tarayıcının ihtiyaç duyduğu herkese açık ayarlar (gizli anahtarlar burada yer almaz).
export function onRequestGet({ env }) {
  return json({ turnstile_site_key: env.TURNSTILE_SITE_KEY || "" }, 200, {
    "cache-control": "public, max-age=3600",
  });
}
