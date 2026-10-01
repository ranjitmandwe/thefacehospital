import { mkdir, writeFile, readFile, readdir, stat, copyFile } from "node:fs/promises";
import path from "node:path";

const SOURCE = process.env.MIRROR_SOURCE || "https://www.thefacehospital.in";
const SITE = "https://www.thefacehospital.in";
const OUT = path.resolve("dist");
const OVERRIDES = path.resolve("overrides");
const queue = [new URL("/", SOURCE)];
const seen = new Set();

const assetLike = /\.(?:html?|css|js|mjs|json|xml|txt|ico|png|jpe?g|webp|gif|svg|avif|woff2?|ttf|otf|pdf|mp4|webm)$/i;

const SEO = {
  "/": {
    title: "The Face Hospital | Specialist Face, Head & Neck Care in Amravati",
    description: "The Face Hospital, Amravati — specialist care for head and neck cancer, facial surgery and aesthetics, dental implants, braces and clear aligners.",
    image: "/assets/v137/home-hero-core.jpg"
  },
  "/cancer/": {
    title: "Head & Neck Cancer Centre in Amravati | The Face Hospital",
    description: "Specialist head and neck oncology care in Amravati for oral, tongue, throat, thyroid, salivary, jaw, skin and orbital cancers, with reconstruction and rehabilitation.",
    image: "/assets/v137/card-cancer.jpg"
  },
  "/facial/": {
    title: "Facial Surgery & Aesthetics in Amravati | The Face Hospital",
    description: "Surgeon-led facial surgery and aesthetics in Amravati for jaw correction, rhinoplasty, facial contouring, rejuvenation, corrective facial surgery and hair restoration.",
    image: "/assets/v137/card-facial.jpg"
  },
  "/dental/": {
    title: "Dental Implants & Orthodontics in Amravati | The Face Hospital",
    description: "Dental implants, braces, clear aligners and smile correction at The Face Hospital, Amravati, with planning focused on function, stability and natural-looking results.",
    image: "/assets/v137/card-dental.jpg"
  },
  "/dental/implants/": {
    title: "Advanced Dental Implants in Amravati | The Face Hospital",
    description: "Advanced dental implants in Amravati including immediate implants, full-mouth rehabilitation, zygomatic and pterygoid implant planning, bone-loss and revision cases.",
    image: "/assets/dental-v120/implant-hero-approved.jpg"
  },
  "/dental/orthodontics/": {
    title: "Braces & Clear Aligners in Amravati | The Face Hospital",
    description: "Braces, clear aligners and bite correction for children, teens and adults at The Face Hospital, Amravati, with emphasis on function and long-term stability.",
    image: "/assets/ortho-v122/orthodontics-hero-approved.jpg"
  }
};

const ALIASES = {
  "/head-neck-cancer.html": "/cancer/",
  "/facial-surgery-aesthetics.html": "/facial/",
  "/implants-orthodontics.html": "/dental/",
  "/dental-implants.html": "/dental/implants/",
  "/jaw-craniofacial.html": "/facial/"
};

function normalizeUrl(raw, base) {
  try {
    if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:") || raw.startsWith("javascript:") || raw.startsWith("data:")) return null;
    const u = new URL(raw, base);
    if (u.origin !== new URL(SOURCE).origin) return null;
    u.hash = "";
    if (u.search) {
      if (!assetLike.test(u.pathname)) return null;
      u.search = "";
    }
    return u;
  } catch {
    return null;
  }
}

function outputPath(u, contentType="") {
  let p = decodeURIComponent(u.pathname);
  if (p.endsWith("/")) p += "index.html";
  else if (!path.posix.extname(p) && contentType.includes("text/html")) p += "/index.html";
  return path.join(OUT, p.replace(/^\/+/, ""));
}

function extractRefs(text, baseUrl, contentType) {
  const refs = new Set();
  if (contentType.includes("text/html")) {
    for (const m of text.matchAll(/\b(?:href|src|poster)=["']([^"'<>]+)["']/gi)) refs.add(m[1]);
    for (const m of text.matchAll(/\bsrcset=["']([^"']+)["']/gi)) {
      for (const part of m[1].split(",")) refs.add(part.trim().split(/\s+/)[0]);
    }
  }
  if (contentType.includes("text/css")) {
    for (const m of text.matchAll(/url\((?:["']?)([^)"']+)(?:["']?)\)/gi)) refs.add(m[1]);
    for (const m of text.matchAll(/@import\s+(?:url\()?["']?([^"'\)\s;]+)["']?/gi)) refs.add(m[1]);
  }
  for (const ref of refs) {
    const u = normalizeUrl(ref, baseUrl);
    if (u) queue.push(u);
  }
}

async function fetchOne(u) {
  const key = u.toString();
  if (seen.has(key)) return;
  seen.add(key);

  const res = await fetch(key, { redirect: "follow", headers: { "user-agent": "TheFaceHospital-V144-Sync/1.0" } });
  if (!res.ok) {
    console.warn("Skip", res.status, key);
    return;
  }

  const finalUrl = new URL(res.url);
  const sourceOrigin = new URL(SOURCE).origin;
  if (finalUrl.origin !== sourceOrigin) return;

  const type = (res.headers.get("content-type") || "").toLowerCase();
  const buf = Buffer.from(await res.arrayBuffer());
  const dest = outputPath(finalUrl, type);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, buf);

  if (type.includes("text/html") || type.includes("text/css")) {
    extractRefs(buf.toString("utf8"), finalUrl, type);
  }
}

async function copyTree(src, dst) {
  let entries;
  try { entries = await readdir(src); } catch { return; }
  for (const name of entries) {
    const s = path.join(src, name);
    const d = path.join(dst, name);
    const info = await stat(s);
    if (info.isDirectory()) {
      await mkdir(d, { recursive: true });
      await copyTree(s, d);
    } else {
      await mkdir(path.dirname(d), { recursive: true });
      await copyFile(s, d);
    }
  }
}

async function walk(dir) {
  const out = [];
  for (const name of await readdir(dir)) {
    const p = path.join(dir, name);
    const info = await stat(p);
    if (info.isDirectory()) out.push(...await walk(p));
    else out.push(p);
  }
  return out;
}

function routeForFile(file) {
  const rel = path.relative(OUT, file).split(path.sep).join("/");
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return "/" + rel.slice(0, -"index.html".length);
  return "/" + rel;
}

function escapeHtml(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function readMeta(html, name) {
  const re = new RegExp('<meta\\s+[^>]*name=["\\\']' + name + '["\\\'][^>]*content=["\\\']([^"\\\']*)["\\\'][^>]*>', "i");
  const alt = new RegExp('<meta\\s+[^>]*content=["\\\']([^"\\\']*)["\\\'][^>]*name=["\\\']' + name + '["\\\'][^>]*>', "i");
  return (html.match(re) || html.match(alt) || [])[1] || "";
}

function readTitle(html) {
  return (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]?.replace(/<[^>]+>/g, "").trim() || "";
}

function stripSeo(html) {
  return html
    .replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi, "")
    .replace(/<meta\s+[^>]*(?:name|property)=["'](?:robots|og:[^"']+|twitter:[^"']+)["'][^>]*>/gi, "")
    .replace(/<meta\s+[^>]*content=["'][^"']*["'][^>]*(?:name|property)=["'](?:robots|og:[^"']+|twitter:[^"']+)["'][^>]*>/gi, "")
    .replace(/<script[^>]*id=["']tfh-seo-schema["'][^>]*>[\s\S]*?<\/script>/gi, "");
}

function schemaFor(route, title, description, canonical) {
  const graph = [
    {
      "@type": "MedicalClinic",
      "@id": SITE + "/#clinic",
      "name": "The Face Hospital",
      "url": SITE + "/",
      "telephone": "+91-74475-94447",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "1st Floor, Tejul Tower, Opp. P. N. Gadgil & Kalyan Jewellers, Rajapeth–Rajkamal Road",
        "addressLocality": "Amravati",
        "postalCode": "444601",
        "addressRegion": "Maharashtra",
        "addressCountry": "IN"
      },
      "openingHoursSpecification": [{
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
        "opens": "11:00",
        "closes": "15:00"
      },{
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
        "opens": "18:00",
        "closes": "21:00"
      }]
    },
    {
      "@type": "Physician",
      "@id": SITE + "/#dr-ranjit-mandwe",
      "name": "Dr. Ranjit Mandwe",
      "jobTitle": "Head & Neck Oncosurgeon and Maxillofacial Surgeon",
      "worksFor": { "@id": SITE + "/#clinic" }
    },
    {
      "@type": route === "/" ? "WebSite" : "WebPage",
      "@id": canonical + "#webpage",
      "url": canonical,
      "name": title,
      "description": description,
      "isPartOf": route === "/" ? undefined : { "@id": SITE + "/#website" }
    }
  ];

  if (route !== "/") {
    graph.push({
      "@type": "WebSite",
      "@id": SITE + "/#website",
      "url": SITE + "/",
      "name": "The Face Hospital"
    });
  }

  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, (k, v) => v === undefined ? undefined : v);
}

async function applySeo() {
  const htmlFiles = (await walk(OUT)).filter(f => f.toLowerCase().endsWith(".html"));
  const sitemap = [];

  for (const file of htmlFiles) {
    let html = await readFile(file, "utf8");
    const route = routeForFile(file);
    const aliasTarget = ALIASES[route];
    const canonicalRoute = aliasTarget || route;
    const canonical = SITE + canonicalRoute;
    const configured = SEO[canonicalRoute] || {};
    const title = configured.title || readTitle(html) || "The Face Hospital";
    const description = configured.description || readMeta(html, "description") || "Specialist face, head and neck care at The Face Hospital, Amravati.";
    const image = SITE + (configured.image || "/assets/v137/home-hero-core.jpg");
    const robots = aliasTarget ? "noindex,follow" : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";

    html = stripSeo(html);

    if (configured.title) {
      if (/<title[^>]*>[\s\S]*?<\/title>/i.test(html)) html = html.replace(/<title[^>]*>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
      else html = html.replace(/<head([^>]*)>/i, `<head$1><title>${escapeHtml(title)}</title>`);
    }

    if (configured.description) {
      if (/<meta\s+[^>]*name=["']description["'][^>]*>/i.test(html)) {
        html = html.replace(/<meta\s+[^>]*name=["']description["'][^>]*>/i, `<meta name="description" content="${escapeHtml(description)}">`);
      } else {
        html = html.replace(/<head([^>]*)>/i, `<head$1><meta name="description" content="${escapeHtml(description)}">`);
      }
    }

    html = html.replace(/<html(?![^>]*\blang=)([^>]*)>/i, '<html lang="en"$1>');

    const seoBlock = [
      `<link rel="canonical" href="${canonical}">`,
      `<meta name="robots" content="${robots}">`,
      `<meta property="og:type" content="website">`,
      `<meta property="og:site_name" content="The Face Hospital">`,
      `<meta property="og:title" content="${escapeHtml(title)}">`,
      `<meta property="og:description" content="${escapeHtml(description)}">`,
      `<meta property="og:url" content="${canonical}">`,
      `<meta property="og:image" content="${image}">`,
      `<meta name="twitter:card" content="summary_large_image">`,
      `<meta name="twitter:title" content="${escapeHtml(title)}">`,
      `<meta name="twitter:description" content="${escapeHtml(description)}">`,
      `<meta name="twitter:image" content="${image}">`,
      `<script id="tfh-seo-schema" type="application/ld+json">${schemaFor(canonicalRoute, title, description, canonical)}</script>`
    ].join("\n");

    html = html.replace(/<\/head>/i, seoBlock + "\n</head>");
    await writeFile(file, html);

    if (!aliasTarget) sitemap.push(canonical);
  }

  sitemap.sort();
  const unique = [...new Set(sitemap)];
  const sitemapXml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    unique.map(url => `  <url><loc>${url.replace(/&/g, "&amp;")}</loc></url>`).join("\n") +
    '\n</urlset>\n';

  await writeFile(path.join(OUT, "sitemap.xml"), sitemapXml);
  await writeFile(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
  console.log(`SEO: optimized ${htmlFiles.length} HTML files; sitemap contains ${unique.length} canonical URLs.`);
}

await mkdir(OUT, { recursive: true });
while (queue.length) {
  const u = queue.shift();
  await fetchOne(u);
}

await copyTree(OVERRIDES, OUT);
await applySeo();

const count = seen.size;
console.log(`Mirrored ${count} URLs from ${SOURCE} into dist/`);
