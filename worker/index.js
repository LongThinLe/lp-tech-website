// Worker "xem trước khi chia sẻ link" cho LP Tech.
// Zalo / Facebook không chạy JavaScript của web, nên chúng chỉ thấy thẻ <meta> trong index.html.
// Worker này đọc dữ liệu (bài tin tức, sản phẩm, SEO trang chủ) từ Firestore rồi gắn đúng
// tiêu đề, mô tả, ảnh vào index.html TRƯỚC khi trả về. Khách thường vẫn dùng web như cũ.
// Có lỗi gì thì trả về index.html nguyên bản — web không bao giờ bị hỏng vì Worker này.

const PROJECT_ID = "webbanvattu";
const SITE_NAME = "LP Tech";
const DEFAULT_IMAGE_PATH = "/logo-icon.png";
const CACHE_SECONDS = 120;

const firestoreBase = (env) =>
  (env && env.FIRESTORE_BASE) ||
  `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

/* ---------- Đọc dữ liệu từ Firestore (REST, không cần khóa vì web cho khách đọc công khai) ---------- */

// Đổi giá trị kiểu Firestore ({ stringValue: ... }) về giá trị thường
function decode(v) {
  if (!v || typeof v !== "object") return undefined;
  if ("stringValue" in v) return v.stringValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(decode);
  if ("mapValue" in v) return decodeFields(v.mapValue.fields || {});
  return null;
}
function decodeFields(fields) {
  const out = {};
  for (const k of Object.keys(fields)) out[k] = decode(fields[k]);
  return out;
}

async function cached(key, producer) {
  const cache = caches.default;
  const cacheKey = new Request(`https://cache.lp-tech.internal/${key}`);
  const hit = await cache.match(cacheKey);
  if (hit) return hit.json();
  const data = await producer();
  await cache.put(
    cacheKey,
    new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json", "Cache-Control": `max-age=${CACHE_SECONDS}` },
    })
  );
  return data;
}

async function queryBySlug(env, collectionId, slug) {
  const res = await fetch(`${firestoreBase(env)}:runQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId }],
        where: { fieldFilter: { field: { fieldPath: "slug" }, op: "EQUAL", value: { stringValue: slug } } },
        limit: 1,
      },
    }),
    signal: AbortSignal.timeout(3000),
  });
  if (!res.ok) return null;
  const rows = await res.json();
  const row = Array.isArray(rows) ? rows.find((r) => r.document) : null;
  return row ? decodeFields(row.document.fields || {}) : null;
}

async function getById(env, collectionId, id) {
  const res = await fetch(`${firestoreBase(env)}/${collectionId}/${encodeURIComponent(id)}`, {
    signal: AbortSignal.timeout(3000),
  });
  if (!res.ok) return null;
  const doc = await res.json();
  return decodeFields(doc.fields || {});
}

const loadNews = (env, slug) =>
  cached(`news/${slug}`, async () => (await queryBySlug(env, "news", slug)) || (await getById(env, "news", slug)));

const loadProduct = (env, id) =>
  cached(`product/${id}`, async () => (await queryBySlug(env, "products", id)) || (await getById(env, "products", id)));

const loadSettings = (env) => cached("settings", () => getById(env, "settings", "company"));

/* ---------- Làm sạch chữ ---------- */

const ENTITIES = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " " };

function plain(text) {
  return String(text || "")
    .replace(/<\/(p|div|li)>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (m) => ENTITIES[m] || m)
    .replace(/\s+/g, " ")
    .trim();
}

function clip(text, max) {
  const t = plain(text);
  return t.length <= max ? t : t.slice(0, max - 1).trimEnd() + "…";
}

function keywordList(s) {
  return String(s || "")
    .split(/[;\n]/)
    .map((k) => k.trim())
    .filter(Boolean);
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ---------- Dựng thông tin xem trước cho từng loại trang ---------- */

function newsMeta(post, origin) {
  if (!post || post.hidden) return null;
  const firstImage = (post.blocks || []).find((b) => b && b.type === "image" && b.url);
  const firstText = (post.blocks || []).find((b) => b && b.type === "text" && plain(b.text));
  return {
    title: `${post.title} | ${SITE_NAME}`,
    ogTitle: post.title,
    description: clip(post.summary || (firstText && firstText.text) || "", 160),
    image: post.cover || (firstImage && firstImage.url) || origin + DEFAULT_IMAGE_PATH,
    keywords: keywordList(post.seoKeywords),
    type: "article",
  };
}

function productMeta(p, origin) {
  if (!p || p.hidden) return null;
  const kw = keywordList(p.seoKeywords);
  const desc = kw.length
    ? `${p.name} — ${kw.slice(0, 5).join(", ")}. Liên hệ ${SITE_NAME} để nhận báo giá.`
    : `${p.name}. Liên hệ ${SITE_NAME} để nhận báo giá.`;
  return {
    title: `${p.name} | ${SITE_NAME}`,
    ogTitle: p.name,
    description: clip(desc, 160),
    image: p.image || origin + DEFAULT_IMAGE_PATH,
    keywords: kw,
    type: "product",
  };
}

function homeMeta(s, origin) {
  if (!s || (!s.seoTitle && !s.seoDescription)) return null;
  return {
    title: s.seoTitle || SITE_NAME,
    ogTitle: s.seoTitle || SITE_NAME,
    description: clip(s.seoDescription || "", 160),
    image: s.logoHeader || origin + DEFAULT_IMAGE_PATH,
    keywords: keywordList(s.seoKeywords),
    type: "website",
  };
}

/* ---------- Gắn thẻ vào index.html ---------- */

function inject(response, meta, pageUrl) {
  const tags = [
    `<meta name="description" content="${esc(meta.description)}">`,
    meta.keywords.length ? `<meta name="keywords" content="${esc(meta.keywords.join(", "))}">` : "",
    `<meta property="og:site_name" content="${SITE_NAME}">`,
    `<meta property="og:type" content="${meta.type}">`,
    `<meta property="og:title" content="${esc(meta.ogTitle)}">`,
    `<meta property="og:description" content="${esc(meta.description)}">`,
    `<meta property="og:image" content="${esc(meta.image)}">`,
    `<meta property="og:url" content="${esc(pageUrl)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(meta.ogTitle)}">`,
    `<meta name="twitter:description" content="${esc(meta.description)}">`,
    `<meta name="twitter:image" content="${esc(meta.image)}">`,
  ].join("\n");

  return new HTMLRewriter()
    .on("title", { element: (e) => e.setInnerContent(meta.title) })
    // Bỏ thẻ cũ để không bị trùng
    .on('meta[name="description"]', { element: (e) => e.remove() })
    .on('meta[name="keywords"]', { element: (e) => e.remove() })
    .on('meta[property^="og:"]', { element: (e) => e.remove() })
    .on('meta[name^="twitter:"]', { element: (e) => e.remove() })
    .on("head", { element: (e) => e.append(tags, { html: true }) })
    .transform(response);
}

/* ---------- Cửa vào ---------- */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Lấy index.html (web React) làm nền
    const pageRequest = new Request(new URL("/", url).toString(), {
      method: "GET",
      headers: { Accept: "text/html" },
    });
    const page = await env.ASSETS.fetch(pageRequest);

    if (request.method !== "GET" || !page.ok) return env.ASSETS.fetch(request);

    try {
      const path = url.pathname.replace(/\/+$/, "") || "/";
      let meta = null;

      const news = path.match(/^\/tin-tuc\/([^/]+)$/);
      const product = path.match(/^\/san-pham\/([^/]+)$/);
      if (news) meta = newsMeta(await loadNews(env, decodeURIComponent(news[1])), url.origin);
      else if (product) meta = productMeta(await loadProduct(env, decodeURIComponent(product[1])), url.origin);
      else if (path === "/") meta = homeMeta(await loadSettings(env), url.origin);

      if (!meta) return page;
      return inject(page, meta, url.origin + url.pathname);
    } catch (err) {
      console.error("Worker xem trước link lỗi:", err);
      return page;
    }
  },
};