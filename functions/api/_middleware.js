// Site API'den farklı bir adreste (ör. GitHub Pages) yayınlanıyorsa tarayıcının API'ye
// erişebilmesi için CORS izni verir. İzinli kökenler: IZINLI_KOKENLER (virgülle ayrılmış).
export async function onRequest({ request, env, next }) {
  const koken = request.headers.get("origin");
  const izinli = (env.IZINLI_KOKENLER || "").split(",").map((k) => k.trim()).filter(Boolean);
  const cors = koken && izinli.includes(koken)
    ? {
        "access-control-allow-origin": koken,
        "access-control-allow-methods": "GET, POST, OPTIONS",
        "access-control-allow-headers": "content-type",
        "access-control-max-age": "86400",
        vary: "origin",
      }
    : null;

  if (request.method === "OPTIONS") {
    return new Response(null, { status: cors ? 204 : 403, headers: cors || {} });
  }

  const yanit = await next();
  if (!cors) return yanit;
  const yeni = new Response(yanit.body, yanit);
  for (const [k, v] of Object.entries(cors)) yeni.headers.set(k, v);
  return yeni;
}
