const SITE_ID = "kaszino-kifizetes-24-oran-belul-com";

const CTA_RESOLVE_PATH = "/api/cta/resolve";
const CTA_REDIRECT_PATH = "/api/cta/go";

const CTA_MAP = {
  siteId: SITE_ID,
  defaultUrl: "https://go.kaszino-kifizetes-24-oran-belul.com/yNDw7L64?keyword=casoola",
  global: {
    vox:          "https://go.kaszino-kifizetes-24-oran-belul.com/yNDw7L64?keyword=vox",
    slotoro:      "https://go.kaszino-kifizetes-24-oran-belul.com/yNDw7L64?keyword=slotoro",
    bigclash:     "https://go.kaszino-kifizetes-24-oran-belul.com/yNDw7L64?keyword=bigclash",
    alawin:       "https://go.kaszino-kifizetes-24-oran-belul.com/yNDw7L64?keyword=alawin",
    hitnspin:     "https://go.kaszino-kifizetes-24-oran-belul.com/yNDw7L64?keyword=hitnspin",
    vvegas:       "https://go.kaszino-kifizetes-24-oran-belul.com/yNDw7L64?keyword=vvegas",
    casoola:      "https://go.kaszino-kifizetes-24-oran-belul.com/yNDw7L64?keyword=casoola",
    stonevegas:   "https://go.kaszino-kifizetes-24-oran-belul.com/yNDw7L64?keyword=stonevegas",
    glorion:      "https://go.kaszino-kifizetes-24-oran-belul.com/yNDw7L64?keyword=glorion",
    rollingslots: "https://go.kaszino-kifizetes-24-oran-belul.com/yNDw7L64?keyword=rollingslots",
  },
};

function buildDestination(ctaName, path, section) {
  const base = CTA_MAP.global[ctaName] || CTA_MAP.defaultUrl || "";
  if (!base) return "";

  const destination = new URL(base);
  destination.searchParams.set("location", path);
  destination.searchParams.set("element", section);
  return destination.toString();
}

function logEvent(kind, fields) {
  console.log(JSON.stringify({ kind, ...fields, ts: Date.now() }));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === CTA_REDIRECT_PATH || url.pathname === CTA_RESOLVE_PATH) {
      if (request.method !== "GET") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
      }

      const params = url.searchParams;
      const siteId = params.get("siteId");

      if (siteId && siteId !== CTA_MAP.siteId) {
        return Response.json({ error: "Unknown site" }, { status: 404 });
      }

      const ctaName = params.get("ctaName") || "primary";
      const section = params.get("section") || "";
      const path = params.get("path") || "/";

      const destination = buildDestination(ctaName, path, section);

      if (!destination) {
        return Response.json({ error: "CTA target is not configured" }, { status: 404 });
      }

      logEvent("cta_redirect", { ctaName, section, path, destination });

      if (url.pathname === CTA_RESOLVE_PATH) {
        return Response.json({ destination });
      }

      return new Response(null, {
        status: 302,
        headers: {
          Location: destination,
          "Cache-Control": "private, no-store, max-age=0",
          "Referrer-Policy": "no-referrer",
        },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
