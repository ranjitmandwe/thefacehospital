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
  "/doctor/dr-ranjit-mandwe/": {
    title: "Dr Ranjit Mandwe | Head & Neck Oncosurgeon in Amravati",
    description: "Dr Ranjit Mandwe is a Head & Neck Oncosurgeon and Maxillofacial Surgeon at The Face Hospital, Amravati, with advanced training exposure at MSKCC New York and Tata Memorial Mumbai.",
    image: "/assets/v137/card-cancer.jpg"
  },
  "/contact/": {
    title: "Contact The Face Hospital Amravati | Appointments & Directions",
    description: "Contact The Face Hospital, Rajapeth, Amravati for cancer, facial surgery, dental implant and orthodontic appointments. View timings, phone numbers, WhatsApp and directions.",
    image: "/assets/v137/home-hero-core.jpg"
  },
  "/resources/": {
    title: "Head & Neck Cancer Patient Resources | The Face Hospital",
    description: "Patient education from The Face Hospital, Amravati: warning signs, second-opinion preparation, treatment planning, reconstruction and recovery guidance for head and neck cancer.",
    image: "/assets/v137/card-cancer.jpg"
  },
  "/resources/mouth-ulcer-oral-cancer-warning-signs/": {
    title: "Persistent Mouth Ulcer: When to Check for Oral Cancer | The Face Hospital",
    description: "A practical patient guide to persistent mouth ulcers, oral cancer warning signs, when to seek specialist assessment and what evaluation may involve.",
    image: "/assets/v137/card-cancer.jpg"
  },
  "/resources/head-neck-cancer-second-opinion-checklist/": {
    title: "Head & Neck Cancer Second Opinion Checklist | The Face Hospital",
    description: "What to bring for a head and neck cancer second opinion: biopsy, scans, treatment records, medicines and key questions to ask before major treatment.",
    image: "/assets/v137/card-cancer.jpg"
  },
  "/resources/jaw-reconstruction-after-cancer-surgery/": {
    title: "Jaw Reconstruction After Cancer Surgery | Patient Guide",
    description: "Understand why jaw reconstruction may be needed after cancer surgery, common reconstructive options and the goals for speech, swallowing, facial form and rehabilitation.",
    image: "/assets/v137/card-cancer.jpg"
  },
  "/patient-stories/": {
    title: "Patient Stories & Experiences | The Face Hospital Amravati",
    description: "Real, consented patient and family experiences from The Face Cancer Centre, Amravati, with treatment-journey videos and verified Google review highlights.",
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

  const lower = html.toLowerCase();
  const mainClose = lower.lastIndexOf("</main>");
  if (mainClose !== -1) return html.slice(0, mainClose) + section + "\n" + html.slice(mainClose);
  const bodyClose = lower.lastIndexOf("</body>");
  if (bodyClose !== -1) return html.slice(0, bodyClose) + section + "\n" + html.slice(bodyClose);
  return html + section;
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
      "url": SITE + "/doctor/dr-ranjit-mandwe/",
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


const DISEASE_PAGES = {
  "/cancer/types/oral-tongue-cancer.html": {
    eyebrow: "ORAL & TONGUE CANCER",
    h1: "Oral & Tongue Cancer Care in Amravati",
    intro: "Oral and tongue cancers are best managed after careful examination, biopsy confirmation and imaging-based staging. Treatment is individualised to the exact subsite, stage, neck-node status and the patient's general health.",
    sections: [
      ["When should you seek evaluation?", "A persistent mouth ulcer, unexplained growth, bleeding, pain, difficulty chewing or swallowing, reduced tongue movement, a neck lump, or a lesion that does not heal should be assessed promptly."],
      ["How is diagnosis confirmed?", "Clinical examination is followed by biopsy or histopathology. CT, MRI or PET-CT may be advised depending on the tumour site and stage. Neck assessment is an important part of planning."],
      ["What may treatment involve?", "Depending on stage and location, treatment may include surgery, neck dissection, reconstruction, radiotherapy, systemic therapy or a combination. The sequence is decided individually."],
      ["What about speech and swallowing?", "Where oncologically safe, treatment planning aims to preserve tongue mobility, swallowing, speech and appearance. Reconstruction and rehabilitation are considered when required."]
    ],
    faqs: [
      ["Does every oral cancer need major surgery?", "No. The extent of surgery depends on the size, depth, location and spread of the tumour. Some early cancers need limited surgery, while larger tumours may need neck surgery and reconstruction."],
      ["When is neck dissection considered?", "Neck treatment depends on the primary tumour, depth of invasion, imaging and whether lymph nodes are clinically or radiologically involved."],
      ["Can reconstruction be done at the same operation?", "In many appropriate cases, reconstruction can be planned at the time of tumour removal to restore form and function."],
      ["Is a second opinion useful?", "A second opinion can be useful before major surgery, when reconstruction is expected, or when more than one treatment pathway is possible."]
    ]
  },
  "/cancer/types/throat-cancer.html": {
    eyebrow: "THROAT & LARYNGEAL CANCER",
    h1: "Throat & Laryngeal Cancer Care in Amravati",
    intro: "Throat and laryngeal cancers can affect voice, swallowing and breathing. Accurate endoscopic assessment, imaging and pathology are used to determine the safest and most effective treatment pathway.",
    sections: [
      ["Symptoms that need assessment", "Persistent hoarseness, painful or difficult swallowing, a neck lump, unexplained throat pain, coughing blood or persistent ear pain can require specialist evaluation."],
      ["How is the disease assessed?", "Examination may include endoscopy, biopsy and CT or MRI. Treatment planning depends on the exact site, stage, airway status and expected impact on voice and swallowing."],
      ["Treatment planning", "Depending on the site and stage, care may include surgery, radiotherapy, systemic therapy or combined treatment. Multidisciplinary planning is important."],
      ["Function matters", "When clinically appropriate, treatment aims to preserve voice, swallowing and airway function while maintaining cancer control."]
    ],
    faqs: [
      ["Does throat cancer always require surgery?", "No. Some cancers are treated primarily with radiotherapy or combined treatment, while others benefit from surgery. The choice depends on the site, stage and patient factors."],
      ["Why is endoscopy important?", "Endoscopy helps define the exact site and extent of disease and allows biopsy when required."],
      ["Can voice be preserved?", "Voice-preserving treatment is considered whenever it is oncologically appropriate, but the safest option depends on tumour extent and location."],
      ["What should I bring for a second opinion?", "Bring pathology reports, scans and imaging files, previous treatment records and a current medication list."]
    ]
  },
  "/cancer/types/thyroid-cancer.html": {
    eyebrow: "THYROID CANCER",
    h1: "Thyroid Cancer Evaluation & Surgery in Amravati",
    intro: "Thyroid cancer treatment depends on tumour type, size, lymph-node involvement, imaging and pathology. Many patients have excellent outcomes when evaluation and treatment are appropriately planned.",
    sections: [
      ["How is thyroid cancer evaluated?", "Ultrasound, thyroid-function testing and needle sampling may be used where appropriate. CT or other imaging may be required for selected or advanced cases."],
      ["When is surgery considered?", "Surgery may involve removal of part or all of the thyroid, with lymph-node surgery when indicated. The operation is tailored to tumour type and stage."],
      ["What happens after surgery?", "Pathology determines the final stage and whether additional treatment or endocrine follow-up is required."],
      ["Voice and nerve preservation", "Careful surgical planning pays particular attention to the recurrent laryngeal nerves, parathyroid glands and surrounding structures."]
    ],
    faqs: [
      ["Does every thyroid nodule mean cancer?", "No. Most thyroid nodules are not cancer. Ultrasound features, clinical assessment and cytology help determine risk."],
      ["Is total thyroidectomy always required?", "No. The extent of surgery depends on the tumour type, size, location, risk profile and lymph-node findings."],
      ["Will I need radioactive iodine?", "Not every patient needs radioactive iodine. The decision depends on final pathology and risk assessment."],
      ["When is neck dissection needed?", "Lymph-node surgery is considered when nodes are involved or when the tumour pattern and stage indicate it."]
    ]
  },
  "/cancer/types/salivary-cancer.html": {
    eyebrow: "SALIVARY GLAND TUMOURS",
    h1: "Parotid & Salivary Gland Tumour Care in Amravati",
    intro: "Salivary gland tumours may be benign or malignant. Assessment focuses on defining the tumour, its relationship to the facial nerve and nearby structures, and whether lymph nodes are involved.",
    sections: [
      ["What symptoms need evaluation?", "A persistent parotid or salivary-gland lump, rapid growth, facial weakness, pain, numbness or enlarged neck nodes should be assessed."],
      ["How is diagnosis planned?", "Clinical examination, ultrasound, CT or MRI and needle sampling may be used depending on the case."],
      ["Surgical planning", "Surgery is tailored to the gland, tumour extent and pathology. In parotid surgery, preservation of the facial nerve is a major consideration whenever oncologically safe."],
      ["When is additional treatment needed?", "Final pathology and stage determine whether radiotherapy or other treatment should be considered."]
    ],
    faqs: [
      ["Are all parotid tumours cancer?", "No. Many parotid tumours are benign, but persistent or enlarging lumps should still be assessed."],
      ["Can the facial nerve be preserved?", "Preservation is prioritised when the nerve is not directly involved by tumour and it is oncologically safe to do so."],
      ["Is biopsy always done before surgery?", "Needle sampling is often useful, but the exact diagnostic pathway depends on the clinical and imaging findings."],
      ["Can salivary tumours recur?", "Some tumour types can recur, which is why pathology-directed follow-up is important."]
    ]
  },
  "/cancer/types/jaw-cancer.html": {
    eyebrow: "JAW & MANDIBULAR CANCER",
    h1: "Jaw Cancer Surgery & Reconstruction in Amravati",
    intro: "Tumours involving the mandible or maxilla require careful planning because cancer removal may affect chewing, speech, facial contour and dental rehabilitation. Resection and reconstruction are planned together whenever possible.",
    sections: [
      ["How is jaw involvement assessed?", "Clinical examination and CT or MRI help define bone involvement, tumour extent and relationship to teeth, soft tissue and neck nodes."],
      ["What may surgery involve?", "Depending on the tumour, surgery may range from limited bone removal to segmental jaw resection with neck treatment when indicated."],
      ["How is the jaw reconstructed?", "Reconstruction may use local tissue, regional flaps, free tissue transfer, plates, bone grafts or vascularised bone depending on the defect and patient factors."],
      ["What is the long-term goal?", "Cancer control comes first, while reconstruction aims to restore facial form, oral competence, swallowing, speech and the possibility of later dental rehabilitation where feasible."]
    ],
    faqs: [
      ["Does jaw cancer always require removal of part of the jaw?", "No. The extent of bone removal depends on whether and how deeply the tumour involves the jaw."],
      ["Can reconstruction be performed immediately?", "In many suitable patients, reconstruction is performed during the same operation so that form and function can be restored as early as possible."],
      ["When is a free flap used?", "Free-tissue reconstruction is considered for larger or complex defects when vascularised tissue or bone offers the best reconstructive option."],
      ["Can dental rehabilitation be planned later?", "In selected patients, dental rehabilitation can be considered after healing and completion of cancer treatment."]
    ]
  },
  "/cancer/types/facial-skin-cancer.html": {
    eyebrow: "FACIAL & SCALP SKIN CANCER",
    h1: "Facial & Scalp Skin Cancer Surgery in Amravati",
    intro: "Skin cancers of the face and scalp require removal with adequate oncologic margins while preserving important structures and planning reconstruction for function and appearance.",
    sections: [
      ["Which lesions need assessment?", "A non-healing ulcer, recurrent bleeding spot, changing lesion, persistent crusted area or rapidly growing skin mass should be evaluated."],
      ["How is diagnosis confirmed?", "Clinical examination and biopsy establish the diagnosis. Imaging may be required for larger, recurrent or deeply invasive lesions."],
      ["Surgery and reconstruction", "The operation is planned around tumour clearance and the best reconstructive option for the eyelids, nose, lips, cheek, ear or scalp when involved."],
      ["Follow-up matters", "Skin-cancer follow-up includes surveillance of the treated site, regional lymph nodes where relevant and assessment for additional skin lesions."]
    ],
    faqs: [
      ["Can facial skin cancer be removed without major deformity?", "Many defects can be reconstructed effectively, but the method depends on tumour size, location and the amount of tissue that must be removed safely."],
      ["Is biopsy needed first?", "Biopsy is commonly used to confirm the diagnosis before definitive treatment."],
      ["Will I need a skin graft or flap?", "Small defects may close directly, while larger or strategically located defects may need a local flap, skin graft or more complex reconstruction."],
      ["Can skin cancer spread to lymph nodes?", "Some skin cancers have a higher risk of nodal spread, so node assessment is considered when clinically indicated."]
    ]
  },
  "/cancer/types/orbital-tumours.html": {
    eyebrow: "ORBITAL & PERIORBITAL TUMOURS",
    h1: "Orbital & Periorbital Tumour Evaluation in Amravati",
    intro: "Tumours around the eye and orbit require detailed imaging and multidisciplinary planning because treatment must balance disease control with vision, eye movement, facial form and adjacent structures.",
    sections: [
      ["What symptoms need evaluation?", "New eye protrusion, double vision, persistent swelling, pain, reduced vision, restricted eye movement or a mass around the orbit should be assessed."],
      ["How are orbital tumours investigated?", "CT and MRI are commonly used to define the lesion and its relation to the eye, muscles, bone, sinuses and skull base. Biopsy may be required."],
      ["How is treatment planned?", "Management depends on pathology, tumour location and extent and may involve surgery, observation, radiotherapy, systemic therapy or combined care."],
      ["Preserving function", "Where clinically possible, planning aims to protect vision, eye movement and facial form while achieving appropriate tumour control."]
    ],
    faqs: [
      ["Does every orbital tumour require surgery?", "No. Treatment depends on the tumour type, symptoms, growth pattern and imaging findings."],
      ["Why are CT and MRI both sometimes needed?", "The two scans provide complementary information about bone, soft tissue, nerves and adjacent structures."],
      ["Can double vision improve after treatment?", "It may improve depending on the cause and the structures affected, but the likely outcome is individual and should be discussed after examination and imaging review."],
      ["Is multidisciplinary care important?", "Yes. Depending on the tumour, collaboration with ophthalmology, radiology, pathology, radiation oncology or neurosurgery may be required."]
    ]
  }
};

const RELATED_DISEASE_LINKS = {
  "/cancer/types/oral-tongue-cancer.html": [
    "/cancer/types/jaw-cancer.html",
    "/cancer/types/throat-cancer.html",
    "/cancer/types/salivary-cancer.html"
  ],
  "/cancer/types/throat-cancer.html": [
    "/cancer/types/oral-tongue-cancer.html",
    "/cancer/types/thyroid-cancer.html",
    "/cancer/types/salivary-cancer.html"
  ],
  "/cancer/types/thyroid-cancer.html": [
    "/cancer/types/throat-cancer.html",
    "/cancer/types/salivary-cancer.html",
    "/cancer/types/oral-tongue-cancer.html"
  ],
  "/cancer/types/salivary-cancer.html": [
    "/cancer/types/oral-tongue-cancer.html",
    "/cancer/types/thyroid-cancer.html",
    "/cancer/types/facial-skin-cancer.html"
  ],
  "/cancer/types/jaw-cancer.html": [
    "/cancer/types/oral-tongue-cancer.html",
    "/cancer/types/salivary-cancer.html",
    "/cancer/types/facial-skin-cancer.html"
  ],
  "/cancer/types/facial-skin-cancer.html": [
    "/cancer/types/orbital-tumours.html",
    "/cancer/types/salivary-cancer.html",
    "/cancer/types/jaw-cancer.html"
  ],
  "/cancer/types/orbital-tumours.html": [
    "/cancer/types/facial-skin-cancer.html",
    "/cancer/types/salivary-cancer.html",
    "/cancer/types/jaw-cancer.html"
  ]
};

function diseasePageHtml(route, data) {
  const faq = data.faqs.map(([q,a]) => `
    <details class="faq"><summary>${escapeHtml(q)}</summary><p>${escapeHtml(a)}</p></details>`).join("");
  const sections = data.sections.map(([h,p]) => `
    <article class="info-card"><h2>${escapeHtml(h)}</h2><p>${escapeHtml(p)}</p></article>`).join("");
  const relatedRoutes = RELATED_DISEASE_LINKS[route] || [];
  const related = relatedRoutes.map(link => {
    const item = DISEASE_PAGES[link];
    if (!item) return "";
    return `<a class="related-card" href="${link}"><span>${escapeHtml(item.eyebrow)}</span><strong>${escapeHtml(item.h1.replace(" in Amravati", ""))}</strong><em>Read patient guide →</em></a>`;
  }).join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(data.h1)} | The Face Cancer Centre</title>
<meta name="description" content="${escapeHtml(data.intro)}">
<style>
:root{--ink:#162033;--muted:#596579;--wine:#8f1d2c;--navy:#0d3158;--line:#e4e8ee;--soft:#f7f9fc}
*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:var(--ink);background:#fff;line-height:1.65}
.top{background:#fff;border-bottom:1px solid var(--line);position:sticky;top:0;z-index:5}.nav{max-width:1160px;margin:auto;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;gap:20px}.brand{font-weight:800;color:var(--wine);text-decoration:none;letter-spacing:.02em}.nav a.link{color:var(--ink);text-decoration:none;font-size:14px}
.crumbs{max-width:1160px;margin:auto;padding:16px 20px 0;font-size:13px;color:var(--muted)}.crumbs a{color:var(--navy);text-decoration:none;font-weight:700}
.hero{background:linear-gradient(135deg,#f7f9fc,#eef3f8);border-bottom:1px solid var(--line)}.hero-in{max-width:1160px;margin:auto;padding:46px 20px 54px}.eyebrow{color:var(--wine);font-weight:800;font-size:12px;letter-spacing:.14em}.hero h1{font-size:44px;line-height:1.12;margin:10px 0 18px;max-width:900px}.hero p{font-size:18px;color:var(--muted);max-width:880px;margin:0}.actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}.cta{display:inline-block;background:var(--wine);color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:700}.cta.secondary{background:#fff;color:var(--navy);border:1px solid #cfd7e2}.cta.whatsapp{background:#245b47}
.wrap{max-width:1160px;margin:auto;padding:42px 20px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.info-card{border:1px solid var(--line);border-radius:18px;padding:24px;background:#fff}.info-card h2{font-size:21px;margin:0 0 8px}.info-card p{margin:0;color:var(--muted)}
.second-opinion{margin-top:30px;padding:26px;border-radius:18px;background:#fff8f9;border:1px solid #ecd7db}.second-opinion h2{margin:0 0 8px;font-size:23px}.second-opinion p{margin:0;color:var(--muted)}.second-opinion ul{margin:12px 0 0;padding-left:20px;color:var(--muted)}
.faqs{margin-top:34px;padding:32px;border-radius:20px;background:var(--soft);border:1px solid var(--line)}.faqs h2{margin-top:0}.faq{background:#fff;border:1px solid var(--line);border-radius:12px;margin:10px 0;padding:0 16px}.faq summary{cursor:pointer;font-weight:700;padding:16px 0}.faq p{color:var(--muted);margin:0 0 16px}
.related{margin-top:42px}.related h2{margin-bottom:6px}.related>p{margin-top:0;color:var(--muted)}.related-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.related-card{display:flex;min-height:170px;flex-direction:column;padding:20px;border:1px solid var(--line);border-radius:16px;text-decoration:none;background:#fff}.related-card span{font-size:11px;color:var(--wine);font-weight:800;letter-spacing:.08em}.related-card strong{margin-top:8px;color:var(--ink);font-size:17px;line-height:1.35}.related-card em{margin-top:auto;padding-top:16px;color:var(--navy);font-size:13px;font-style:normal;font-weight:700}
.review{margin-top:28px;padding-top:18px;border-top:1px solid var(--line);font-size:13px;color:var(--muted)}.back{margin-top:30px}.back a{color:var(--navy);font-weight:700;text-decoration:none}
.conversion{margin-top:44px;background:var(--navy);border-radius:22px;color:#fff;padding:30px}.conversion h2{margin:0 0 8px}.conversion p{margin:0;max-width:800px;color:#e7edf5}.conversion .actions{margin-top:18px}.conversion .cta.secondary{border-color:#fff;color:#fff;background:transparent}
.footer{margin-top:50px;background:#081f39;color:#fff}.footer-in{max-width:1160px;margin:auto;padding:28px 20px;font-size:14px}.footer-in a{color:#fff}
@media(max-width:760px){.nav{align-items:flex-start}.hero h1{font-size:34px}.grid,.related-grid{grid-template-columns:1fr}.hero-in{padding-top:34px}.faqs{padding:22px}.actions .cta{width:100%;text-align:center}}
</style>
</head>
<body>
<header class="top"><nav class="nav"><a class="brand" href="/cancer/">THE FACE CANCER CENTRE</a><a class="link" href="/">The Face Hospital</a></nav></header>
<main>
<section class="hero">
  <div class="crumbs"><a href="/">Home</a> › <a href="/cancer/">Cancer Centre</a> › ${escapeHtml(data.eyebrow)}</div>
  <div class="hero-in">
    <div class="eyebrow">${escapeHtml(data.eyebrow)}</div>
    <h1>${escapeHtml(data.h1)}</h1>
    <p>${escapeHtml(data.intro)}</p>
    <div class="actions">
      <a class="cta" href="/cancer/#consultation">Book Cancer Consultation / Second Opinion</a>
      <a class="cta secondary" href="tel:+919673311234">Call Cancer Desk</a>
      <a class="cta whatsapp" href="https://wa.me/919673311234">WhatsApp</a>
    </div>
  </div>
</section>
<section class="wrap">
  <div class="grid">${sections}</div>

  <section class="second-opinion" aria-labelledby="second-opinion-title">
    <h2 id="second-opinion-title">Preparing for a second opinion</h2>
    <p>For a more useful review, keep your diagnostic material together. The exact tests needed vary by diagnosis and stage.</p>
    <ul>
      <li>Biopsy / histopathology report and slides or blocks when available</li>
      <li>CT, MRI or PET-CT reports and the actual scan images</li>
      <li>Previous surgery, radiotherapy or systemic-treatment records</li>
      <li>Current medicines and important medical conditions</li>
    </ul>
  </section>

  <section class="faqs"><h2>Common questions patients ask</h2>${faq}<p class="review">General patient information. Individual treatment decisions require examination, pathology and imaging review. Medical content reviewed by Dr. Ranjit Mandwe, Head & Neck Oncosurgeon.</p></section>

  <section class="related" aria-labelledby="related-title">
    <h2 id="related-title">Related head & neck cancer information</h2>
    <p>Explore closely related tumour sites and treatment considerations.</p>
    <div class="related-grid">${related}</div>
  </section>

  <section class="conversion" aria-labelledby="consult-title">
    <h2 id="consult-title">Need a treatment-plan review?</h2>
    <p>If you already have a biopsy or scan, a specialist consultation can help clarify staging, treatment alternatives, surgical extent, reconstruction needs and rehabilitation planning.</p>
    <div class="actions">
      <a class="cta" href="/cancer/#consultation">Request Consultation</a>
      <a class="cta secondary" href="tel:+919673311234">Call +91 96733 11234</a>
    </div>
  </section>

  <p class="back"><a href="/cancer/">← Back to The Face Cancer Centre</a></p>
</section>
</main>
<footer class="footer"><div class="footer-in">The Face Cancer Centre • The Face Hospital • Amravati • Cancer desk: <a href="tel:+919673311234">+91 96733 11234</a></div></footer>
</body></html>`;
}


function doctorProfileHtml() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Dr Ranjit Mandwe | Head & Neck Oncosurgeon in Amravati</title>
<meta name="description" content="Dr Ranjit Mandwe is a Head & Neck Oncosurgeon and Maxillofacial Surgeon at The Face Hospital, Amravati.">
<style>
:root{--ink:#172033;--muted:#5c6676;--wine:#8f1d2c;--navy:#0d3158;--line:#e4e8ee;--soft:#f7f9fc}
*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:var(--ink);line-height:1.65;background:#fff}
header{border-bottom:1px solid var(--line);background:#fff}.nav{max-width:1160px;margin:auto;padding:15px 20px;display:flex;justify-content:space-between;gap:18px}.nav a{text-decoration:none;color:var(--ink);font-weight:700}.brand{color:var(--wine)!important}
.hero{background:linear-gradient(135deg,#f7f9fc,#eef3f8)}.hero-in,.wrap{max-width:1160px;margin:auto;padding:54px 20px}.eyebrow{font-size:12px;letter-spacing:.14em;font-weight:800;color:var(--wine)}h1{font-size:44px;line-height:1.12;margin:9px 0 13px}.lead{font-size:19px;color:var(--muted);max-width:900px}
.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}.btn{display:inline-block;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:700;background:var(--wine);color:#fff}.btn.alt{background:var(--navy)}.btn.light{background:#fff;color:var(--navy);border:1px solid #cad2dd}
.grid{display:grid;grid-template-columns:1.15fr .85fr;gap:24px}.card{border:1px solid var(--line);border-radius:18px;padding:26px;background:#fff}.card h2{margin-top:0}.list{padding-left:20px}.list li{margin:8px 0}.specialties{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.pill{border:1px solid var(--line);border-radius:14px;padding:15px;background:var(--soft);font-weight:700}
.note{margin-top:26px;background:#fff8f9;border:1px solid #ecd7db;border-radius:18px;padding:24px}.note h2{margin-top:0}.footer{margin-top:48px;background:#081f39;color:#fff}.footer-in{max-width:1160px;margin:auto;padding:28px 20px}.footer a{color:#fff}
@media(max-width:760px){h1{font-size:34px}.grid,.specialties{grid-template-columns:1fr}.hero-in{padding-top:40px}.actions .btn{width:100%;text-align:center}}
</style>
</head>
<body>
<header><nav class="nav"><a class="brand" href="/">THE FACE HOSPITAL</a><a href="/cancer/">Cancer Centre</a><a href="/contact/">Contact</a></nav></header>
<main>
<section class="hero"><div class="hero-in">
<div class="eyebrow">HEAD & NECK ONCOLOGY • MAXILLOFACIAL SURGERY</div>
<h1>Dr Ranjit Mandwe</h1>
<p class="lead">Head & Neck Oncosurgeon and Maxillofacial Surgeon, focused on oral and head & neck cancer surgery, reconstruction, function preservation and rehabilitation.</p>
<div class="actions"><a class="btn" href="/cancer/#consultation">Book Cancer Consultation</a><a class="btn alt" href="tel:+919673311234">Call Cancer Desk</a><a class="btn light" href="https://wa.me/919673311234">WhatsApp</a></div>
</div></section>
<section class="wrap">
<div class="grid">
<article class="card">
<h2>Training & professional profile</h2>
<ul class="list">
<li>Fellow, Head & Neck Surgery & Oncology, USA</li>
<li>Advanced training exposure at Memorial Sloan Kettering Cancer Center, New York</li>
<li>Observership / clinical exposure at Tata Memorial Cancer Hospital, Mumbai</li>
<li>MDS, Maxillofacial Surgery, Nagpur</li>
<li>Consultant experience across oncology and superspeciality hospital settings</li>
<li>Director, The Face Hospital, Amravati</li>
</ul>
</article>
<article class="card">
<h2>Clinical focus</h2>
<div class="specialties">
<div class="pill">Oral & tongue cancer</div><div class="pill">Thyroid cancer</div><div class="pill">Salivary gland tumours</div><div class="pill">Jaw cancer surgery</div><div class="pill">Neck dissection</div><div class="pill">Head & neck reconstruction</div><div class="pill">Speech & swallowing preservation</div><div class="pill">Cancer rehabilitation</div>
</div>
</article>
</div>
<section class="note">
<h2>Approach to treatment</h2>
<p>The treatment priority is cancer control. Where clinically and oncologically appropriate, planning also aims to preserve speech, swallowing, appearance, oral function and quality of life. Major treatment decisions are individualised after examination, pathology and imaging review.</p>
</section>
<section class="note">
<h2>For patients seeking a second opinion</h2>
<p>Bring your biopsy or histopathology report, scan reports and actual CT/MRI/PET-CT images, previous treatment records and a current medication list. These help make the consultation more useful and reduce avoidable repetition of investigations.</p>
</section>
</section>
</main>
<footer class="footer"><div class="footer-in">The Face Hospital • Rajapeth, Amravati • <a href="/contact/">Appointments & directions</a></div></footer>
</body></html>`;
}

function contactPageHtml() {
  const address = "The Face Hospital, 1st Floor, Tejul Tower, Opp. P. N. Gadgil & Kalyan Jewellers, Rajapeth–Rajkamal Road, Amravati 444601";
  const mapQ = encodeURIComponent(address);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Contact The Face Hospital Amravati | Appointments & Directions</title>
<meta name="description" content="Contact The Face Hospital, Rajapeth, Amravati. Appointment timings, cancer desk, dental desk, WhatsApp and directions.">
<style>
:root{--ink:#172033;--muted:#5c6676;--wine:#8f1d2c;--navy:#0d3158;--line:#e4e8ee;--soft:#f7f9fc}
*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:var(--ink);line-height:1.65}header{border-bottom:1px solid var(--line)}.nav{max-width:1160px;margin:auto;padding:15px 20px;display:flex;justify-content:space-between}.nav a{text-decoration:none;color:var(--ink);font-weight:700}.brand{color:var(--wine)!important}
.hero{background:linear-gradient(135deg,#f7f9fc,#eef3f8)}.hero-in,.wrap{max-width:1160px;margin:auto;padding:48px 20px}.hero h1{font-size:42px;margin:0 0 12px}.hero p{font-size:18px;color:var(--muted);max-width:850px}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.card{border:1px solid var(--line);border-radius:18px;padding:24px}.card h2{margin-top:0}.phone{font-size:22px;font-weight:800;color:var(--navy);text-decoration:none}.muted{color:var(--muted)}.btn{display:inline-block;margin-top:12px;padding:11px 17px;border-radius:999px;text-decoration:none;background:var(--wine);color:#fff;font-weight:700}.btn.alt{background:var(--navy)}.hours{margin:0;padding-left:20px}.map{margin-top:28px;border:0;width:100%;min-height:390px;border-radius:18px}.footer{margin-top:46px;background:#081f39;color:#fff}.footer-in{max-width:1160px;margin:auto;padding:26px 20px}
@media(max-width:760px){.grid{grid-template-columns:1fr}.hero h1{font-size:34px}}
</style>
</head>
<body>
<header><nav class="nav"><a class="brand" href="/">THE FACE HOSPITAL</a><a href="/doctor/dr-ranjit-mandwe/">Dr Ranjit Mandwe</a></nav></header>
<main>
<section class="hero"><div class="hero-in"><h1>Contact & Appointments</h1><p>For appointments, second opinions and directions to The Face Hospital in Rajapeth, Amravati.</p></div></section>
<section class="wrap">
<div class="grid">
<article class="card"><h2>Central appointment desk</h2><a class="phone" href="tel:+917447594447">+91 74475 94447</a><p class="muted">For general appointment coordination across The Face Hospital.</p><a class="btn" href="https://wa.me/917447594447">WhatsApp Central Desk</a></article>
<article class="card"><h2>Cancer Centre</h2><a class="phone" href="tel:+919673311234">+91 96733 11234</a><p class="muted">For head & neck cancer consultations and second opinions.</p><a class="btn" href="https://wa.me/919673311234">WhatsApp Cancer Desk</a></article>
<article class="card"><h2>Dental department</h2><a class="phone" href="tel:+917378966884">+91 73789 66884</a><p class="muted">Dental implants, braces, aligners and related dental care.</p><a class="btn alt" href="tel:+917378966884">Call Dental Desk</a></article>
<article class="card"><h2>Consultation hours</h2><ul class="hours"><li>Monday–Saturday: 11:00 AM–3:00 PM</li><li>Monday–Saturday: 6:00 PM–9:00 PM</li><li>Sunday: Closed</li></ul></article>
</div>
<article class="card" style="margin-top:18px"><h2>Address</h2><p><strong>${address}</strong></p><a class="btn alt" href="https://www.google.com/maps/search/?api=1&query=${mapQ}">Open directions in Google Maps</a></article>
<iframe class="map" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${mapQ}&output=embed" title="Map to The Face Hospital, Amravati"></iframe>
</section>
</main>
<footer class="footer"><div class="footer-in">The Face Hospital • Amravati</div></footer>
</body></html>`;
}

async function createTrustPages() {
  const doctorFile = path.join(OUT, "doctor/dr-ranjit-mandwe/index.html");
  const contactFile = path.join(OUT, "contact/index.html");
  await mkdir(path.dirname(doctorFile), { recursive: true });
  await mkdir(path.dirname(contactFile), { recursive: true });
  await writeFile(doctorFile, doctorProfileHtml());
  await writeFile(contactFile, contactPageHtml());
  console.log("Trust pages: generated doctor profile and contact page.");
}


const RESOURCE_ARTICLES = {
  "/resources/mouth-ulcer-oral-cancer-warning-signs/": {
    eyebrow: "PATIENT GUIDE",
    h1: "Persistent Mouth Ulcer: When Should You Get It Checked?",
    intro: "Most mouth ulcers are not cancer, but an ulcer or growth that does not heal deserves proper examination. Early assessment is especially important when symptoms persist or are associated with bleeding, pain, reduced tongue movement or a neck lump.",
    sections: [
      ["Warning signs that need assessment", "Seek evaluation for a mouth ulcer or patch that persists, an unexplained growth, repeated bleeding, progressive pain, difficulty chewing or swallowing, reduced tongue movement, unexplained numbness, or a persistent neck lump."],
      ["What may happen at the first consultation?", "The mouth, tongue, jaw and neck are examined carefully. If a suspicious lesion is present, biopsy may be advised. Imaging such as CT or MRI is selected when needed to define the extent of disease."],
      ["Why early diagnosis matters", "Earlier-stage disease may allow less extensive treatment and can make preservation of speech, swallowing and appearance more achievable. The exact benefit depends on tumour site, biology and stage."],
      ["What should you avoid doing?", "Do not repeatedly self-treat a persistent lesion with topical medicines while delaying examination. A non-healing lesion needs diagnosis rather than prolonged symptomatic treatment."]
    ]
  },
  "/resources/head-neck-cancer-second-opinion-checklist/": {
    eyebrow: "SECOND OPINION",
    h1: "Head & Neck Cancer Second Opinion: What to Bring",
    intro: "A second opinion is most useful when the reviewing surgeon can see the original pathology, imaging and treatment history. Keeping these records together can reduce duplication and help clarify treatment alternatives.",
    sections: [
      ["Pathology", "Bring the biopsy or histopathology report. If available and requested, carry pathology slides or blocks for review."],
      ["Imaging", "Bring both the written reports and the actual CT, MRI or PET-CT images, preferably in digital form. The images themselves may change surgical or reconstructive planning."],
      ["Previous treatment records", "Carry operation notes, discharge summaries, radiotherapy records, chemotherapy or immunotherapy details, and any previous cancer-related procedures."],
      ["Questions worth asking", "Ask about stage, treatment alternatives, expected surgical extent, need for neck treatment, reconstruction, speech and swallowing impact, recovery, rehabilitation and whether additional treatment may be required."]
    ]
  },
  "/resources/jaw-reconstruction-after-cancer-surgery/": {
    eyebrow: "RECONSTRUCTION & REHABILITATION",
    h1: "Jaw Reconstruction After Cancer Surgery: What Patients Should Know",
    intro: "When cancer surgery removes part of the mandible or maxilla, reconstruction may be needed to restore facial form, oral competence, speech, swallowing and the possibility of later dental rehabilitation.",
    sections: [
      ["Why reconstruction may be required", "The need for reconstruction depends on the size and location of the defect, soft-tissue loss, remaining bone, previous treatment and the patient's overall condition."],
      ["What reconstructive options exist?", "Options can include local or regional tissue, reconstruction plates, bone grafts, free-tissue transfer or vascularised bone. The choice is individual and depends on the defect and treatment plan."],
      ["Can reconstruction be performed at the same operation?", "In many suitable patients, tumour removal and reconstruction can be planned together so that form and function are restored as early as safely possible."],
      ["What happens after reconstruction?", "Recovery may include wound care, nutrition support, speech and swallowing therapy, physiotherapy, surveillance and later dental rehabilitation where appropriate."]
    ]
  }
};

function resourceArticleHtml(route, data) {
  const cards = data.sections.map(([h,p]) => `<article class="card"><h2>${escapeHtml(h)}</h2><p>${escapeHtml(p)}</p></article>`).join("");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(data.h1)} | The Face Hospital</title>
<meta name="description" content="${escapeHtml(data.intro)}">
<style>
:root{--ink:#172033;--muted:#5c6676;--wine:#8f1d2c;--navy:#0d3158;--line:#e4e8ee;--soft:#f7f9fc}
*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:var(--ink);line-height:1.65}
header{border-bottom:1px solid var(--line)}.nav{max-width:1160px;margin:auto;padding:15px 20px;display:flex;justify-content:space-between;gap:18px}.nav a{text-decoration:none;color:var(--ink);font-weight:700}.brand{color:var(--wine)!important}
.hero{background:linear-gradient(135deg,#f8fafc,#eef3f8)}.hero-in,.wrap{max-width:1050px;margin:auto;padding:50px 20px}.eyebrow{font-size:12px;font-weight:800;letter-spacing:.14em;color:var(--wine)}h1{font-size:42px;line-height:1.15;margin:10px 0 14px}.lead{font-size:18px;color:var(--muted)}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.card{border:1px solid var(--line);border-radius:18px;padding:24px}.card h2{font-size:21px;margin-top:0}.card p{color:var(--muted)}
.note{margin-top:30px;padding:24px;border-radius:18px;background:#fff8f9;border:1px solid #ecd7db}.note p{margin:0;color:var(--muted)}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}.btn{display:inline-block;padding:11px 17px;border-radius:999px;background:var(--wine);color:#fff;text-decoration:none;font-weight:700}.btn.alt{background:var(--navy)}
.footer{margin-top:45px;background:#081f39;color:#fff}.footer-in{max-width:1050px;margin:auto;padding:26px 20px}.footer a{color:#fff}
@media(max-width:760px){h1{font-size:34px}.grid{grid-template-columns:1fr}.actions .btn{width:100%;text-align:center}}
</style></head><body>
<header><nav class="nav"><a class="brand" href="/">THE FACE HOSPITAL</a><a href="/resources/">Patient Resources</a><a href="/cancer/">Cancer Centre</a></nav></header>
<main>
<section class="hero"><div class="hero-in"><div class="eyebrow">${escapeHtml(data.eyebrow)}</div><h1>${escapeHtml(data.h1)}</h1><p class="lead">${escapeHtml(data.intro)}</p></div></section>
<section class="wrap"><div class="grid">${cards}</div>
<section class="note"><p><strong>Medical review:</strong> Dr Ranjit Mandwe, Head & Neck Oncosurgeon. This page provides general patient education and does not replace individual examination, pathology review or imaging-based treatment planning.</p></section>
<div class="actions"><a class="btn" href="/cancer/#consultation">Book Cancer Consultation / Second Opinion</a><a class="btn alt" href="/resources/">More Patient Resources</a></div>
</section></main>
<footer class="footer"><div class="footer-in">The Face Hospital • Amravati • <a href="/contact/">Appointments & directions</a></div></footer>
</body></html>`;
}

function resourcesHubHtml() {
  const cards = Object.entries(RESOURCE_ARTICLES).map(([route,data]) => `
    <a class="resource-card" href="${route}">
      <span>${escapeHtml(data.eyebrow)}</span>
      <strong>${escapeHtml(data.h1)}</strong>
      <p>${escapeHtml(data.intro)}</p>
      <em>Read guide →</em>
    </a>`).join("");

  const diseaseCards = Object.entries(DISEASE_PAGES).map(([route,data]) => `
    <a class="disease" href="${route}">${escapeHtml(data.eyebrow)} →</a>`).join("");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Head & Neck Cancer Patient Resources | The Face Hospital</title>
<meta name="description" content="Patient education from The Face Hospital, Amravati: warning signs, second-opinion preparation, cancer treatment planning, reconstruction and recovery guidance.">
<style>
:root{--ink:#172033;--muted:#5c6676;--wine:#8f1d2c;--navy:#0d3158;--line:#e4e8ee;--soft:#f7f9fc}
*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:var(--ink);line-height:1.65}
header{border-bottom:1px solid var(--line)}.nav{max-width:1160px;margin:auto;padding:15px 20px;display:flex;justify-content:space-between}.nav a{text-decoration:none;color:var(--ink);font-weight:700}.brand{color:var(--wine)!important}
.hero{background:linear-gradient(135deg,#f8fafc,#eef3f8)}.hero-in,.wrap{max-width:1160px;margin:auto;padding:52px 20px}.hero h1{font-size:44px;line-height:1.12;margin:0 0 14px}.hero p{font-size:18px;color:var(--muted);max-width:900px}
.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.resource-card{display:flex;flex-direction:column;min-height:330px;border:1px solid var(--line);border-radius:18px;padding:24px;text-decoration:none;color:var(--ink)}.resource-card span{font-size:11px;letter-spacing:.1em;color:var(--wine);font-weight:800}.resource-card strong{font-size:21px;line-height:1.3;margin-top:10px}.resource-card p{color:var(--muted)}.resource-card em{margin-top:auto;color:var(--navy);font-style:normal;font-weight:700}
.disease-wrap{margin-top:42px;padding:28px;border-radius:20px;background:var(--soft);border:1px solid var(--line)}.disease-wrap h2{margin-top:0}.disease-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.disease{background:#fff;border:1px solid var(--line);border-radius:12px;padding:13px 15px;text-decoration:none;color:var(--navy);font-weight:700}
.review{margin-top:30px;padding-top:18px;border-top:1px solid var(--line);color:var(--muted);font-size:14px}.footer{margin-top:45px;background:#081f39;color:#fff}.footer-in{max-width:1160px;margin:auto;padding:26px 20px}.footer a{color:#fff}
@media(max-width:850px){.grid{grid-template-columns:1fr}.disease-grid{grid-template-columns:1fr}.hero h1{font-size:34px}}
</style></head><body>
<header><nav class="nav"><a class="brand" href="/">THE FACE HOSPITAL</a><a href="/doctor/dr-ranjit-mandwe/">Dr Ranjit Mandwe</a><a href="/contact/">Contact</a></nav></header>
<main>
<section class="hero"><div class="hero-in"><h1>Patient Resources: Head & Neck Cancer</h1><p>Clear, practical information for patients and families preparing for evaluation, treatment, second opinion, reconstruction and recovery.</p></div></section>
<section class="wrap">
<div class="grid">${cards}</div>
<section class="disease-wrap"><h2>Explore cancer-specific guides</h2><div class="disease-grid">${diseaseCards}</div></section>
<p class="review">All medical content is reviewed by Dr Ranjit Mandwe, Head & Neck Oncosurgeon. Information is educational and does not replace individual clinical assessment.</p>
</section></main>
<footer class="footer"><div class="footer-in">The Face Hospital • Amravati • <a href="/cancer/">Cancer Centre</a> • <a href="/contact/">Appointments</a></div></footer>
</body></html>`;
}

async function createResourcePages() {
  const hub = path.join(OUT, "resources/index.html");
  await mkdir(path.dirname(hub), { recursive: true });
  await writeFile(hub, resourcesHubHtml());
  for (const [route,data] of Object.entries(RESOURCE_ARTICLES)) {
    const file = path.join(OUT, route.replace(/^\//,""), "index.html");
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, resourceArticleHtml(route,data));
  }
  console.log(`Resources: generated 1 hub and ${Object.keys(RESOURCE_ARTICLES).length} patient guides.`);
}


function patientStoriesHtml() {
  const googleReviews = [
    "Best Doctor, best treatment, best facilities.",
    "Excellent service very easy transition",
    "Very friendly co operative staff management ."
  ];

  const storyCards = [
    ["Patient Story 1", "Primary testimonial", "A direct patient experience shared with consent. This is one of the strongest short-form stories selected for the website."],
    ["Patient Story 2", "Primary testimonial", "A longer patient experience selected for the main Patient Stories collection."],
    ["Patient Story 5", "Patient & family experience", "A wider patient/family story preserved in its natural framing to keep the interaction authentic."],
    ["Patient Story 3", "Additional patient experience", "A consented patient story retained as part of the extended story library."],
    ["Patient Story 4", "Additional patient/family experience", "A consented patient/family account presented without aggressive cropping or promotional effects."]
  ];

  const cards = storyCards.map(([title,label,body],i) => `
    <article class="story-card">
      <div class="media">
        <div class="media-badge">REAL PATIENT STORY</div>
        <div class="play" aria-hidden="true">▶</div>
        <div class="media-note">Video ${i+1} • final branded edit ready</div>
      </div>
      <div class="story-body">
        <span class="kicker">${escapeHtml(label)}</span>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(body)}</p>
        <p class="consent">Shared with patient consent.</p>
      </div>
    </article>`).join("");

  const reviewCards = googleReviews.map(text => `
    <blockquote class="review-card"><p>“${escapeHtml(text)}”</p><cite>Public Google review highlight</cite></blockquote>
  `).join("");

  const mapsReviewUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("The Face Superspeciality Cancer Hospital & Research Centre, Amravati");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Patient Stories & Experiences | The Face Hospital Amravati</title>
<meta name="description" content="Real, consented patient and family experiences from The Face Cancer Centre, Amravati, with treatment-journey videos and verified Google review highlights.">
<style>
:root{--ink:#172033;--muted:#5c6676;--wine:#8f1d2c;--navy:#0d3158;--line:#e4e8ee;--soft:#f7f9fc}
*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:var(--ink);line-height:1.65;background:#fff}
header{border-bottom:1px solid var(--line);background:#fff}.nav{max-width:1160px;margin:auto;padding:15px 20px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}.nav a{text-decoration:none;color:var(--ink);font-weight:700}.brand{color:var(--wine)!important}
.hero{background:linear-gradient(135deg,#f8fafc,#edf3f8)}.hero-in,.wrap{max-width:1160px;margin:auto;padding:52px 20px}.eyebrow{font-size:12px;letter-spacing:.14em;font-weight:800;color:var(--wine)}.hero h1{font-size:45px;line-height:1.1;margin:8px 0 14px}.hero p{font-size:18px;color:var(--muted);max-width:900px}.trust-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}.trust-pill{background:#fff;border:1px solid var(--line);border-radius:999px;padding:8px 12px;font-size:13px;font-weight:700}
.section-head{max-width:800px;margin-bottom:22px}.section-head h2{font-size:30px;margin:0 0 8px}.section-head p{margin:0;color:var(--muted)}
.story-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}.story-card{border:1px solid var(--line);border-radius:20px;overflow:hidden;background:#fff}.media{min-height:310px;background:linear-gradient(135deg,#0b2542,#173e69);position:relative;display:flex;align-items:center;justify-content:center;color:#fff}.play{width:72px;height:72px;border-radius:50%;background:#fff;color:var(--wine);display:flex;align-items:center;justify-content:center;font-size:30px;padding-left:5px}.media-badge{position:absolute;left:18px;top:18px;font-size:11px;font-weight:800;letter-spacing:.1em}.media-note{position:absolute;left:18px;bottom:16px;font-size:13px;color:#e7edf5}.story-body{padding:22px}.kicker{font-size:11px;color:var(--wine);font-weight:800;letter-spacing:.09em;text-transform:uppercase}.story-body h2{margin:5px 0 8px;font-size:22px}.story-body p{margin:0;color:var(--muted)}.story-body .consent{margin-top:12px;font-size:12px;font-weight:700;color:#687283}
.production-note{margin-top:24px;padding:20px 22px;background:#fff8f9;border:1px solid #ecd7db;border-radius:16px}.production-note p{margin:0;color:var(--muted)}
.reviews{margin-top:48px;padding:30px;background:var(--soft);border:1px solid var(--line);border-radius:22px}.review-top{display:flex;justify-content:space-between;gap:20px;align-items:flex-end}.review-top h2{margin:0}.rating{font-size:34px;font-weight:800;color:var(--navy)}.rating small{font-size:13px;color:var(--muted);font-weight:600}.review-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:20px}.review-card{margin:0;padding:20px;background:#fff;border:1px solid var(--line);border-radius:14px}.review-card p{margin:0 0 12px}.review-card cite{font-style:normal;color:var(--muted);font-size:12px}.review-link{display:inline-block;margin-top:18px;color:var(--navy);font-weight:700;text-decoration:none}
.cta{margin-top:42px;padding:30px;border-radius:22px;background:var(--navy);color:#fff}.cta h2{margin:0 0 8px}.cta p{margin:0;color:#e7edf5;max-width:850px}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.btn{display:inline-block;padding:11px 17px;border-radius:999px;background:var(--wine);color:#fff;text-decoration:none;font-weight:700}.btn.alt{background:transparent;border:1px solid #fff}
.footer{margin-top:48px;background:#081f39;color:#fff}.footer-in{max-width:1160px;margin:auto;padding:26px 20px}.footer a{color:#fff}
@media(max-width:820px){.story-grid,.review-grid{grid-template-columns:1fr}.hero h1{font-size:35px}.review-top{display:block}.media{min-height:250px}.actions .btn{width:100%;text-align:center}}
</style></head><body>
<header><nav class="nav"><a class="brand" href="/">THE FACE HOSPITAL</a><a href="/cancer/">Cancer Centre</a><a href="/resources/">Patient Resources</a><a href="/doctor/dr-ranjit-mandwe/">Dr Ranjit Mandwe</a><a href="/contact/">Contact</a></nav></header>
<main>
<section class="hero"><div class="hero-in">
<div class="eyebrow">THE FACE CANCER CENTRE • AMRAVATI</div>
<h1>Real Patient Stories. Real Treatment Journeys.</h1>
<p>For many families, hearing directly from someone who has already gone through treatment is more meaningful than promotional claims. This section is built around real, consented patient and family experiences.</p>
<div class="trust-row"><span class="trust-pill">✓ Real patients</span><span class="trust-pill">✓ Consent confirmed</span><span class="trust-pill">✓ Original voices preserved</span><span class="trust-pill">✓ No fabricated testimonials</span></div>
</div></section>
<section class="wrap">
<div class="section-head"><h2>Patient video experiences</h2><p>The strongest stories are placed first. The final edits use restrained hospital branding so the patient’s face and voice remain the focus.</p></div>
<div class="story-grid">${cards}</div>
<div class="production-note"><p><strong>Video integration:</strong> the five final branded edits are complete. The website page is being prepared with the player layout now; actual playback will be connected through a stable public video host rather than loading large raw files directly into the page.</p></div>

<section class="reviews">
<div class="review-top"><div><h2>What patients say on Google</h2><p>Current public feedback for The Face Superspeciality Cancer Hospital & Research Centre.</p></div><div class="rating">4.8 / 5<br><small>57 public reviews • checked Oct 2026</small></div></div>
<div class="review-grid">${reviewCards}</div>
<a class="review-link" href="${mapsReviewUrl}">Read more public reviews on Google →</a>
</section>

<section class="cta"><h2>Need a cancer consultation or second opinion?</h2><p>Bring your biopsy or histopathology report, scan reports and actual CT/MRI/PET-CT images, previous treatment records and current medicines when available.</p><div class="actions"><a class="btn" href="/cancer/#consultation">Book Cancer Consultation</a><a class="btn alt" href="tel:+919673311234">Call / WhatsApp +91 96733 11234</a></div></section>
</section>
</main>
<footer class="footer"><div class="footer-in">The Face Hospital • Amravati • <a href="/resources/">Patient Resources</a> • <a href="/contact/">Appointments & directions</a></div></footer>
</body></html>`;
}

async function createPatientStoriesPage() {
  const file = path.join(OUT, "patient-stories/index.html");
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, patientStoriesHtml());
  console.log("Patient stories: generated consented trust-evidence page.");
}

async function createDiseasePages() {
  for (const [route, data] of Object.entries(DISEASE_PAGES)) {
    const file = path.join(OUT, route.replace(/^\//, ""));
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, diseasePageHtml(route, data));
  }
  console.log(`Cancer disease pages: generated ${Object.keys(DISEASE_PAGES).length} answer-first pages.`);
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
    if (canonicalRoute === "/" || canonicalRoute === "/cancer/") {
      html = html
        .replace(/href=["']\/cancer\/#surgeon["']/gi, 'href="/doctor/dr-ranjit-mandwe/"')
        .replace(/href=["']#surgeon["']/gi, 'href="/doctor/dr-ranjit-mandwe/"')
        .replace(/href=["']\/contact\.html["']/gi, 'href="/contact/"')
        .replace(/href=["']#resources["']/gi, 'href="/resources/"')
        .replace(/href=["']\/resources\.html["']/gi, 'href="/resources/"')
        .replace(/href=["']#patient-stories["']/gi, 'href="/patient-stories/"')
        .replace(/href=["']\/patient-stories\.html["']/gi, 'href="/patient-stories/"');
    }

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
await createDiseasePages();
await createTrustPages();
await createResourcePages();
await createPatientStoriesPage();
await applySeo();

const count = seen.size;
console.log(`Mirrored ${count} URLs from ${SOURCE} into dist/`);
