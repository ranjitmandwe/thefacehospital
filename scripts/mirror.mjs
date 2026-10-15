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
    description: "Specialist head and neck oncology care in Amravati and Vidarbha for oral, tongue, throat, thyroid, salivary, jaw, facial skin and orbital cancers, with reconstruction and rehabilitation.",
    image: "/assets/v137/card-cancer.jpg"
  },
  "/cancer/types/oral-tongue-cancer.html": {
    title: "Oral & Tongue Cancer Treatment in Amravati | The Face Hospital",
    description: "Evaluation and surgical treatment planning for oral cavity and tongue cancer in Amravati, including neck management, reconstruction, swallowing and speech-focused rehabilitation.",
    image: "/assets/v137/card-cancer.jpg"
  },
  "/cancer/types/throat-cancer.html": {
    title: "Throat Cancer Care in Amravati | The Face Hospital",
    description: "Specialist assessment and treatment planning for throat and upper aerodigestive tract cancers in Amravati, with emphasis on disease control and preservation of function.",
    image: "/assets/v137/card-cancer.jpg"
  },
  "/cancer/types/thyroid-cancer.html": {
    title: "Thyroid Cancer Surgery in Amravati | The Face Hospital",
    description: "Thyroid cancer evaluation and surgical care in Amravati, including neck assessment, treatment planning and coordinated follow-up for appropriate thyroid malignancies.",
    image: "/assets/v137/card-cancer.jpg"
  },
  "/cancer/types/salivary-cancer.html": {
    title: "Salivary Gland Cancer Care in Amravati | The Face Hospital",
    description: "Specialist evaluation and surgical planning for parotid and other salivary gland cancers in Amravati, with attention to facial nerve and functional outcomes where feasible.",
    image: "/assets/v137/card-cancer.jpg"
  },
  "/cancer/types/jaw-cancer.html": {
    title: "Jaw Cancer Surgery & Reconstruction in Amravati | The Face Hospital",
    description: "Surgical care for jaw and mandibular cancers in Amravati, including ablative surgery, neck treatment, reconstruction and rehabilitation planning when indicated.",
    image: "/assets/v137/card-cancer.jpg"
  },
  "/cancer/types/orbital-tumours.html": {
    title: "Orbital Tumour Evaluation in Amravati | The Face Hospital",
    description: "Specialist evaluation and multidisciplinary treatment planning for orbital and peri-orbital tumours in Amravati, with function-preserving approaches where clinically appropriate.",
    image: "/assets/v137/card-cancer.jpg"
  },
  "/cancer/types/facial-skin-cancer.html": {
    title: "Facial Skin Cancer Surgery in Amravati | The Face Hospital",
    description: "Evaluation and surgical management of facial skin cancers in Amravati, with oncologic clearance, reconstruction and attention to facial form and function.",
    image: "/assets/v137/card-cancer.jpg"
  },
  "/facial/": {
    title: "Facial Surgery, Jaw Correction & Rhinoplasty in Amravati | The Face Hospital",
    description: "Surgeon-led facial surgery and aesthetics in Amravati for jaw correction, rhinoplasty, facial contouring, facial rejuvenation, corrective facial surgery and hair restoration.",
    image: "/assets/v137/card-facial.jpg"
  },
  "/dental/": {
    title: "Dental Implants, Braces & Aligners in Amravati | The Face Hospital",
    description: "Dental implants, braces, clear aligners, TMJ and facial pain care, sleep-airway evaluation and general dental care at The Face Hospital, Amravati.",
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
  },
  "/dental/tmj/": {
    title: "TMJ, Cervical & Facial Pain Care in Amravati | The Face Hospital",
    description: "Evaluation and management of TMJ disorders, cervical pain, facial pain and neuralgia in Amravati with diagnosis-led treatment planning.",
    image: "/assets/v137/card-dental.jpg"
  },
  "/dental/sleep-apnea/": {
    title: "Sleep Apnea & Snoring Evaluation in Amravati | The Face Hospital",
    description: "Assessment and treatment planning for snoring, sleep-disordered breathing and selected sleep apnea cases in Amravati, with dental and airway-focused options where appropriate.",
    image: "/assets/v137/card-dental.jpg"
  },
  "/dental/dental-care/": {
    title: "General Dental Care in Amravati | The Face Hospital",
    description: "General and restorative dental care in Amravati with treatment planning focused on oral health, function and long-term maintenance.",
    image: "/assets/v137/card-dental.jpg"
  }
};
const ALIASES = {
  "/head-neck-cancer.html": "/cancer/",
  "/facial-surgery-aesthetics.html": "/facial/",
  "/implants-orthodontics.html": "/dental/",
  "/dental-implants.html": "/dental/implants/",
  "/jaw-craniofacial.html": "/facial/"
};

const CANCER_FAQS = [
  {
    q: "What head and neck cancers are evaluated at The Face Cancer Centre?",
    a: "The centre evaluates oral and tongue cancers, throat and laryngeal cancers, thyroid cancer, salivary gland tumours, jaw tumours, facial skin cancers, orbital tumours and other head and neck lesions. The exact treatment plan depends on the diagnosis, stage and the patient's overall condition."
  },
  {
    q: "Does every head and neck cancer patient need surgery?",
    a: "No. Treatment may involve surgery, radiotherapy, systemic therapy or a combination. The best sequence depends on the tumour site, stage, pathology, imaging and the patient's fitness and priorities."
  },
  {
    q: "Can speech, swallowing and appearance be preserved?",
    a: "Preserving function and appearance is an important treatment goal whenever it is oncologically safe. Surgical planning, reconstruction and rehabilitation are tailored to the tumour and the structures involved."
  },
  {
    q: "What should I bring for a cancer consultation or second opinion?",
    a: "Bring the biopsy or histopathology report, available slides or blocks if advised, CT/MRI/PET-CT images and reports, blood tests, previous treatment records, medication list and details of any prior surgery, radiotherapy or chemotherapy."
  },
  {
    q: "When is a second opinion useful?",
    a: "A second opinion can be useful before major surgery, when more than one treatment option exists, when reconstruction may be required, or when cancer has recurred or the diagnosis or treatment sequence is unclear."
  },
  {
    q: "How quickly should treatment start after diagnosis?",
    a: "Treatment should proceed without avoidable delay, but accurate staging, pathology review, medical optimisation and treatment planning are important. The appropriate urgency differs by tumour type, stage and individual clinical circumstances."
  }
];

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

function injectCancerAnswerSection(html, route) {
  if (route !== "/cancer/" || html.includes('id="tfh-ai-answer-guide"')) return html;

  const cards = CANCER_FAQS.map(item => `
    <article class="tfh-answer-card">
      <h3>${escapeHtml(item.q)}</h3>
      <p>${escapeHtml(item.a)}</p>
    </article>`).join("");

  const section = `
  <style id="tfh-ai-answer-style">
    #tfh-ai-answer-guide{max-width:1180px;margin:46px auto;padding:38px 24px;border-radius:22px;background:#f8fafc;border:1px solid #e5e7eb;box-sizing:border-box}
    #tfh-ai-answer-guide .tfh-kicker{margin:0 0 8px;font:700 12px/1.4 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#9b1c31}
    #tfh-ai-answer-guide h2{margin:0 0 12px;font:700 30px/1.2 Arial,sans-serif;color:#172033}
    #tfh-ai-answer-guide .tfh-intro{max-width:860px;margin:0 0 26px;font:400 16px/1.65 Arial,sans-serif;color:#465064}
    #tfh-ai-answer-guide .tfh-answer-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
    #tfh-ai-answer-guide .tfh-answer-card{padding:20px;border-radius:16px;background:#fff;border:1px solid #e8ebf0}
    #tfh-ai-answer-guide .tfh-answer-card h3{margin:0 0 8px;font:700 17px/1.35 Arial,sans-serif;color:#172033}
    #tfh-ai-answer-guide .tfh-answer-card p{margin:0;font:400 15px/1.6 Arial,sans-serif;color:#4b5563}
    #tfh-ai-answer-guide .tfh-review{margin:24px 0 0;padding-top:18px;border-top:1px solid #dfe3e8;font:600 13px/1.5 Arial,sans-serif;color:#5d6674}
    #tfh-ai-answer-guide .tfh-second-opinion{display:inline-block;margin-top:16px;padding:11px 18px;border-radius:999px;background:#8f1d2c;color:#fff;text-decoration:none;font:700 14px/1 Arial,sans-serif}
    @media(max-width:760px){#tfh-ai-answer-guide{margin:30px 14px;padding:26px 18px}#tfh-ai-answer-guide .tfh-answer-grid{grid-template-columns:1fr}#tfh-ai-answer-guide h2{font-size:25px}}
  </style>
  <section id="tfh-ai-answer-guide" aria-labelledby="tfh-ai-answer-title">
    <p class="tfh-kicker">Quick answers for patients and families</p>
    <h2 id="tfh-ai-answer-title">Head & Neck Cancer: What to Know Before Your Consultation</h2>
    <p class="tfh-intro">Clear answers to common questions can make the first consultation easier. These points are general information; the final plan is individualised after examination, pathology and imaging review.</p>
    <div class="tfh-answer-grid">${cards}</div>
    <a class="tfh-second-opinion" href="#consultation">Book a cancer consultation / second opinion</a>
    <p class="tfh-review">Medical content reviewed by Dr. Ranjit Mandwe, Head & Neck Oncosurgeon.</p>
  </section>`;

  if (/<\\/main>/i.test(html)) return html.replace(/<\\/main>/i, section + "\n</main>");
  return html.replace(/<\\/body>/i, section + "\n</body>");
}

function schemaFor(route, title, description, canonical) {
  const graph = [
    {
      "@type": "MedicalClinic",
      "@id": SITE + "/#clinic",
      "name": "The Face Hospital",
      "url": SITE + "/",
      "telephone": "+91-74475-94447",
      "areaServed": ["Amravati", "Vidarbha", "Maharashtra"],
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
      "worksFor": { "@id": SITE + "/#clinic" },
      "knowsAbout": [
        "Head and neck cancer",
        "Oral cancer",
        "Tongue cancer",
        "Thyroid cancer",
        "Salivary gland tumours",
        "Jaw cancer surgery",
        "Neck dissection",
        "Head and neck reconstruction",
        "Speech and swallowing rehabilitation"
      ]
    },
    {
      "@type": route === "/" ? "WebSite" : (route.startsWith("/cancer/") ? "MedicalWebPage" : "WebPage"),
      "@id": canonical + "#webpage",
      "url": canonical,
      "name": title,
      "description": description,
      "author": route === "/" ? undefined : { "@id": SITE + "/#dr-ranjit-mandwe" },
      "reviewedBy": route.startsWith("/cancer/") ? { "@id": SITE + "/#dr-ranjit-mandwe" } : undefined,
      "about": route.startsWith("/cancer/") ? { "@id": SITE + "/cancer/#cancer-centre" } : undefined,
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

    if (route.startsWith("/cancer/")) {
      graph.push({
        "@type": "MedicalClinic",
        "@id": SITE + "/cancer/#cancer-centre",
        "name": "The Face Cancer Centre",
        "url": SITE + "/cancer/",
        "telephone": "+91-96733-11234",
        "parentOrganization": { "@id": SITE + "/#clinic" },
        "areaServed": ["Amravati", "Vidarbha", "Maharashtra", "India"],
        "medicalSpecialty": "Oncology"
      });
    }

    if (route === "/cancer/") {
      graph.push({
        "@type": "FAQPage",
        "@id": canonical + "#faq",
        "mainEntity": CANCER_FAQS.map(item => ({
          "@type": "Question",
          "name": item.q,
          "acceptedAnswer": { "@type": "Answer", "text": item.a }
        }))
      });
    }

    if (route === "/facial/") {
      graph.push({
        "@type": "Service",
        "@id": canonical + "#service",
        "name": "Facial Surgery & Aesthetics",
        "serviceType": "Facial surgery and facial aesthetics",
        "provider": { "@id": SITE + "/#clinic" },
        "areaServed": ["Amravati", "Vidarbha", "Maharashtra"],
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Facial Surgery & Aesthetics Services",
          "itemListElement": [
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Jaw Correction and Facial Balance" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Rhinoplasty" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Chin, Lip and Facial Contouring" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Facial Rejuvenation" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Corrective Facial Surgery" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Hair Restoration" } }
          ]
        }
      });
    }

    if (route === "/dental/") {
      graph.push({
        "@type": "Service",
        "@id": canonical + "#service",
        "name": "Implants & Orthodontics",
        "serviceType": "Dental implants, orthodontics and related dental care",
        "provider": { "@id": SITE + "/#clinic" },
        "areaServed": ["Amravati", "Vidarbha", "Maharashtra"],
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Implants & Orthodontics Services",
          "itemListElement": [
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Dental Implants" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Braces and Clear Aligners" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "TMJ, Cervical and Facial Pain Care" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Sleep Apnea and Snoring Evaluation" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "General Dental Care" } }
          ]
        }
      });
    }

    const parts = route.split("/").filter(Boolean);
    if (parts.length > 1) {
      const items = [{ "@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/" }];
      let built = "";
      parts.forEach((part, index) => {
        built += "/" + part;
        const isFile = /\.html?$/.test(part);
        const itemUrl = SITE + built + (isFile ? "" : "/");
        const configured = SEO[itemUrl.replace(SITE, "")];
        const fallback = part.replace(/[-_]/g, " ").replace(/\.html?$/, "").replace(/\b\w/g, ch => ch.toUpperCase());
        items.push({
          "@type": "ListItem",
          "position": index + 2,
          "name": configured?.title?.split("|")[0].trim() || fallback,
          "item": itemUrl
        });
      });
      graph.push({
        "@type": "BreadcrumbList",
        "@id": canonical + "#breadcrumb",
        "itemListElement": items
      });
    }
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
    html = injectCancerAnswerSection(html, canonicalRoute);

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
      `<meta name="author" content="Dr. Ranjit Mandwe">`,
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
  await writeFile(path.join(OUT, "robots.txt"), `User-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: ChatGPT-User\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: Googlebot\nAllow: /\n\nUser-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
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
