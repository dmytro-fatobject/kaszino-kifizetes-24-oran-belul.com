const SITE_ID = "kaszino-kifizetes-24-oran-belul-com";

const CTA_RESOLVE_PATH = "/api/cta/resolve";
const CTA_REDIRECT_PATH = "/api/cta/go";

const CTA_MAP = {
  siteId: SITE_ID,
  defaultUrl: "https://link.appcasino.site/fXDjQbV9?keyword=casoola",
  global: {
    vox:          "https://link.appcasino.site/fXDjQbV9?keyword=vox",
    slotoro:      "https://link.appcasino.site/fXDjQbV9?keyword=slotoro",
    bigclash:     "https://link.appcasino.site/fXDjQbV9?keyword=bigclash",
    alawin:       "https://link.appcasino.site/fXDjQbV9?keyword=alawin",
    hitnspin:     "https://link.appcasino.site/fXDjQbV9?keyword=hitnspin",
    vvegas:       "https://link.appcasino.site/fXDjQbV9?keyword=vvegas",
    casoola:      "https://link.appcasino.site/fXDjQbV9?keyword=casoola",
    stonevegas:   "https://link.appcasino.site/fXDjQbV9?keyword=stonevegas",
    glorion:      "https://link.appcasino.site/fXDjQbV9?keyword=glorion",
    rollingslots: "https://link.appcasino.site/fXDjQbV9?keyword=rollingslots",
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

// >>> ACCESS CONTROL — managed by emd-publisher — do not edit by hand
const ACCESS_CONTROL_ENABLED = false;
const ACCESS_CONTROL_SECRET = "ef27d449e94bd71fbc50ac58d3fd6ce04f216db79613155ac9c511c01dec0720";
const ACCESS_CONTROL_COOKIE = "cf_ac_session";
const ACCESS_CONTROL_PLATFORM_DENY = ["81.28.12.12/32"];
const ACCESS_CONTROL_POLICY = {
  searchReferrerDomains: ["google.com", "google.pl", "google.de", "google.co.uk", "google.hu", "google.si", "google.cz", "google.fr", "google.hr", "bing.com", "duckduckgo.com", "yahoo.com", "yandex.com", "yandex.ru", "baidu.com", "ecosia.org", "search.brave.com"],
  verifiedSearchUaTokens: ["googlebot", "bingbot", "yandexbot", "duckduckbot", "baiduspider", "applebot", "oai-searchbot", "perplexitybot", "claude-searchbot"],
  publicPaths: ["/robots.txt", "/sitemap.xml"],
  blockedIps: [],
  sessionTtlSeconds: 1800,
};
const DESKTOP_GEO_BLOCK_ENABLED = true;
const DESKTOP_GEO_BLOCK_COUNTRY = "HU";

function acNormalizeHost(value) {
  return String(value || "").trim().toLowerCase().replace(/^www\./, "").replace(/\.$/, "");
}
function acHostMatches(host, domain) {
  const h = acNormalizeHost(host);
  const d = acNormalizeHost(domain);
  return Boolean(h && d && (h === d || h.endsWith("." + d)));
}
function acReferrerHost(request) {
  try {
    const value = request.headers.get("referer") || "";
    return value ? acNormalizeHost(new URL(value).hostname) : "";
  } catch {
    return "";
  }
}
function acIsOrganicSearch(request) {
  const host = acReferrerHost(request);
  return Boolean(host) && ACCESS_CONTROL_POLICY.searchReferrerDomains.some((d) => acHostMatches(host, d));
}
function acIsMobile(request) {
  const hint = request.headers.get("sec-ch-ua-mobile");
  if (hint === "?1") return true;
  if (hint === "?0") return false;
  return /android|iphone|ipad|ipod|mobile|windows phone|opera mini|iemobile/i.test(request.headers.get("user-agent") || "");
}
function acIsNavigation(request) {
  if (!["GET", "HEAD"].includes(request.method)) return false;
  const destination = request.headers.get("sec-fetch-dest") || "";
  const accept = request.headers.get("accept") || "";
  return destination === "document" || accept.includes("text/html");
}
function acIsVerifiedSearchBot(request) {
  if (!["GET", "HEAD"].includes(request.method)) return false;
  const bm = request.cf && request.cf.botManagement;
  if (!bm || bm.verifiedBot !== true) return false;
  const category = String((request.cf && request.cf.verifiedBotCategory) || "").toLowerCase();
  const accepted = new Set(["search", "search engine crawler", "ai search"]);
  if (accepted.has(category)) return true;
  // UA only narrows already-verified traffic — it never grants bypass on its own.
  const ua = (request.headers.get("user-agent") || "").toLowerCase();
  return ACCESS_CONTROL_POLICY.verifiedSearchUaTokens.some((token) => ua.includes(token));
}
function acNormalizeIp(value) {
  return String(value || "").split(",")[0].trim().replace(/^::ffff:/, "");
}
function acIpv4Number(value) {
  const parts = String(value || "").split(".");
  if (parts.length !== 4) return null;
  const bytes = parts.map(Number);
  if (bytes.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return (((bytes[0] * 256 + bytes[1]) * 256 + bytes[2]) * 256 + bytes[3]) >>> 0;
}
function acIpMatches(ipValue, ruleValue) {
  const ip = acNormalizeIp(ipValue);
  const rule = String(ruleValue || "").trim();
  if (!ip || !rule) return false;
  if (!rule.includes("/")) return ip.toLowerCase() === acNormalizeIp(rule).toLowerCase();
  const [network, rawPrefix] = rule.split("/");
  const ip4 = acIpv4Number(ip);
  const net4 = acIpv4Number(acNormalizeIp(network));
  const prefix = Number(rawPrefix);
  if (ip4 === null || net4 === null || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) return false;
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return (ip4 & mask) === (net4 & mask);
}
function acIsDeniedIp(request) {
  const ip = request.headers.get("cf-connecting-ip") || "";
  return [...ACCESS_CONTROL_PLATFORM_DENY, ...ACCESS_CONTROL_POLICY.blockedIps].some((rule) => acIpMatches(ip, rule));
}
function acPublicPath(pathname) {
  const exact = new Set(ACCESS_CONTROL_POLICY.publicPaths);
  if (exact.has(pathname)) return true;
  return /^\/sitemap(?:[-_][a-z0-9.-]+)?\.xml$/i.test(pathname);
}
function acBlockedResponse(reason, status) {
  const body = "<!doctype html><html><head><meta charset=utf-8>" +
    "<meta name=robots content='noindex,nofollow'><title>Access denied</title></head>" +
    "<body><main><h1>Access denied</h1><p>This site is unavailable for this request.</p></main></body></html>";
  return new Response(body, {
    status: status || 403,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "private, no-store, max-age=0",
      "x-robots-tag": "noindex, nofollow",
      "x-content-type-options": "nosniff",
      "x-access-decision": reason,
    },
  });
}
const acEncoder = new TextEncoder();
function acB64url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function acFromB64url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}
async function acHmacKey() {
  return crypto.subtle.importKey("raw", acEncoder.encode(ACCESS_CONTROL_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
async function acUaHash(request) {
  const ua = (request.headers.get("user-agent") || "").toLowerCase();
  return acB64url(new Uint8Array(await crypto.subtle.digest("SHA-256", acEncoder.encode(ua))));
}
async function acIssueSession(request, url) {
  const ttl = Math.min(Math.max(Number(ACCESS_CONTROL_POLICY.sessionTtlSeconds) || 1800, 60), 86400);
  const payload = {
    v: 1,
    host: acNormalizeHost(url.hostname),
    ua: await acUaHash(request),
    exp: Math.floor(Date.now() / 1000) + ttl,
  };
  const body = acB64url(acEncoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", await acHmacKey(), acEncoder.encode(body));
  return { token: `${body}.${acB64url(new Uint8Array(signature))}`, ttl };
}
function acCookieValue(request, name) {
  const raw = request.headers.get("cookie") || "";
  for (const pair of raw.split(";")) {
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    if (pair.slice(0, idx).trim() === name) return pair.slice(idx + 1).trim();
  }
  return "";
}
async function acValidSession(request, url) {
  try {
    const token = acCookieValue(request, ACCESS_CONTROL_COOKIE);
    const [body, sig] = token.split(".");
    if (!body || !sig) return false;
    const ok = await crypto.subtle.verify("HMAC", await acHmacKey(), acFromB64url(sig), acEncoder.encode(body));
    if (!ok) return false;
    const payload = JSON.parse(new TextDecoder().decode(acFromB64url(body)));
    return payload.v === 1 && payload.exp > Math.floor(Date.now() / 1000)
      && payload.host === acNormalizeHost(url.hostname)
      && payload.ua === (await acUaHash(request)) && acIsMobile(request);
  } catch {
    return false;
  }
}
// Returns a Response to short-circuit fetch() with (a block, or an allowed
// first-navigation response carrying the new session cookie), or null to let
// the rest of fetch() run unchanged. Both gates below share the platform
// deny/public-path/verified-bot checks so neither can accidentally block a
// search crawler or robots.txt/sitemap — each gate's own condition only runs
// if its own flag is on.
async function acEvaluate(request, env, url) {
  if (acIsDeniedIp(request)) return acBlockedResponse("blocked-ip", 403);
  if (["GET", "HEAD"].includes(request.method) && acPublicPath(url.pathname)) return null;
  if (acIsVerifiedSearchBot(request)) return null;

  if (DESKTOP_GEO_BLOCK_ENABLED && DESKTOP_GEO_BLOCK_COUNTRY && !acIsMobile(request)) {
    const country = (request.cf && request.cf.country) || "";
    // 200, not 403 — a real audience-mismatch block (unlike the IP-deny hard
    // block above), so it should read the same way a tool checking "does
    // this URL exist" sees it. noindex (meta tag + header, both already in
    // acBlockedResponse) is what actually keeps it out of search results;
    // a non-200 status is what made Google's own Rich Results Test report
    // "Crawl failed" on a live site here, even though real Googlebot indexing
    // wasn't necessarily affected — see acBlockedResponse's own note.
    if (country === DESKTOP_GEO_BLOCK_COUNTRY) return acBlockedResponse("blocked-desktop-geo", 200);
  }

  if (ACCESS_CONTROL_ENABLED) {
    if (await acValidSession(request, url)) return null;
    if (acIsNavigation(request) && acIsMobile(request) && acIsOrganicSearch(request)) {
      const response = await env.ASSETS.fetch(request);
      const out = new Response(response.body, response);
      const { token, ttl } = await acIssueSession(request, url);
      out.headers.append("set-cookie", `${ACCESS_CONTROL_COOKIE}=${token}; Max-Age=${ttl}; Path=/; HttpOnly; Secure; SameSite=Lax`);
      out.headers.set("cache-control", "private, no-store, max-age=0");
      out.headers.set("x-access-decision", "mobile-organic");
      return out;
    }
    return acBlockedResponse("blocked-audience", 200); // see the 200-not-403 note above the desktop-geo-block check
  }

  return null;
}
// <<< ACCESS CONTROL

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (ACCESS_CONTROL_ENABLED || DESKTOP_GEO_BLOCK_ENABLED) {
      const acResponse = await acEvaluate(request, env, url);
      if (acResponse) return acResponse;
    }

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
