import { mkdir, writeFile, readFile, readdir, stat, copyFile } from "node:fs/promises";
import path from "node:path";

const SOURCE = process.env.MIRROR_SOURCE || "https://www.thefacehospital.in";
const OUT = path.resolve("dist");
const OVERRIDES = path.resolve("overrides");
const queue = [new URL("/", SOURCE)];
const seen = new Set();

const assetLike = /\.(?:html?|css|js|mjs|json|xml|txt|ico|png|jpe?g|webp|gif|svg|avif|woff2?|ttf|otf|pdf|mp4|webm)$/i;

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

await mkdir(OUT, { recursive: true });
while (queue.length) {
  const u = queue.shift();
  await fetchOne(u);
}

await copyTree(OVERRIDES, OUT);

const count = seen.size;
console.log(`Mirrored ${count} URLs from ${SOURCE} into dist/`);
