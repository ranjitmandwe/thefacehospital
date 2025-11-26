
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Phone, Stethoscope, ShieldCheck, Clock, MapPin, Hospital, Users, Award, ChevronRight, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Page(){
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="w-full bg-black text-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between py-2 text-sm">
          <div className="flex items-center gap-4">
            <a href="tel:+919673311234" className="inline-flex items-center gap-1 hover:opacity-80"><Phone size={16}/> +91 96733 11234</a>
            <span className="hidden sm:inline">•</span>
            <a href="mailto:thefacehospitalamt@gmail.com" className="hover:opacity-80">thefacehospitalamt@gmail.com</a>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-[var(--gold)] text-black">NABH-ready</Badge>
            <Badge variant="secondary" className="bg-black text-white border border-[var(--gold)]">Head & Neck Super‑Specialty</Badge>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-black border border-[var(--gold)] flex items-center justify-center p-1">
              <img src="/images/the-face-logo.png" alt="The Face Hospital Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="font-semibold leading-tight">The Face Hospital</div>
              <div className="text-xs text-gray-500">Head & Neck • Craniofacial • Oncology</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#services" className="hover:text-gray-700">Specialties</a>
            <a href="#consult" className="hover:text-gray-700">Consult</a>
            <a href="#doctor" className="hover:text-gray-700">Our Surgeon</a>
            <a href="#journey" className="hover:text-gray-700">Patient Journey</a>
            <a href="#contact" className="hover:text-gray-700">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href="https://wa.me/919673311234" target="_blank" className="hidden sm:inline"><Button variant="secondary" className="gap-2"><MessageCircle size={16}/> WhatsApp</Button></a>
            <a href="#consult"><Button className="gap-2 bg-[var(--gold)] text-black hover:opacity-90">Book Appointment <ChevronRight size={16}/></Button></a>
          </div>
        </div>
      </header>

      <section className="relative bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.6}}>
            <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
              Life Meets Precision. <span className="text-[var(--gold)]">Life Wins.</span>
            </h1>
            <p className="mt-4 text-gray-600 text-lg">
              Advanced Head & Neck Oncosurgery, Orthognathic & Craniofacial Care in Amravati & Nagpur. Evidence‑led, patient‑centered, aesthetically mindful.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Badge className="bg-black text-white">Microsurgical Reconstruction</Badge>
              <Badge variant="secondary">Orthognathic & Jaw Surgery</Badge>
              <Badge variant="secondary">Thyroid • Oral Cancer • Salivary</Badge>
            </div>
            <div className="mt-8 flex gap-3">
              <a href="#consult"><Button size="lg" className="gap-2 bg-[var(--gold)] text-black hover:opacity-90"><Stethoscope size={18}/> Consult Now</Button></a>
              <a href="#services"><Button size="lg" variant="outline" className="gap-2 border-[var(--gold)] text-black">Explore Specialties</Button></a>
            </div>
            <div className="mt-6 flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2"><Clock size={16}/> Mon–Sat: 11:00–15:30 & 18:00–21:00</div>
              <div className="flex items-center gap-2"><MapPin size={16}/> Rajapeth Bridge, Amravati</div>
            </div>
          </motion.div>
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.6, delay:0.1}} className="lg:pl-8">
            <img src="/images/hero-surgical.jpg" alt="Cranio‑maxillofacial surgical illustration" className="hidden lg:block w-full rounded-2xl shadow mb-4 object-cover" />
            <Card className="rounded-2xl shadow-md">
              <CardHeader>
                <CardTitle>Quick Appointment</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-3" onSubmit={(e)=>e.preventDefault()}>
                  <Input placeholder="Full name" required />
                  <Input type="tel" placeholder="Phone number" required />
                  <Input type="email" placeholder="Email (optional)" />
                  <Input placeholder="Reason (e.g., Oral cancer consult)" />
                  <Textarea placeholder="Brief concern / preferred time" />
                  <div className="flex gap-2">
                    <Button type="submit" className="w-full bg-[var(--gold)] text-black hover:opacity-90">Request Call Back</Button>
                    <a href="https://wa.me/919673311234" target="_blank" className="w-full"><Button variant="secondary" className="w-full gap-2"><MessageCircle size={16}/> WhatsApp</Button></a>
                  </div>
                  <p className="text-xs text-gray-500">We respond within clinic hours. For emergencies, please call.</p>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="py-8 border-y bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4">
            <div className="text-3xl font-semibold">15+ yrs</div>
            <div className="text-sm text-gray-600">Head & Neck Oncosurgery</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-semibold">US Fellow</div>
            <div className="text-sm text-gray-600">Advanced Fellowships, New York</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-semibold">100‑bed</div>
            <div className="text-sm text-gray-600">Upcoming Super‑Specialty Centre</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-semibold">NABH</div>
            <div className="text-sm text-gray-600">Quality Protocols & Audits</div>
          </div>
        </div>
      </section>

      <section id="services" className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-semibold">Centers of Excellence</h2>
          <p className="mt-2 text-gray-600">Comprehensive diagnostics, surgical care, and rehabilitation.</p>
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {icon: <Hospital/>, title: "Head & Neck Oncology", points: ["Oral, Oropharyngeal, Laryngeal", "Parotid & Salivary Gland Tumors", "Thyroid & Neck Dissections"]},
              {icon: <Users/>, title: "Orthognathic & Jaw Surgery", points: ["Class II/III, Open bite, Asymmetry", "3D planning • Aesthetics • Function", "TMJ‑safe, airway‑aware protocols"]},
              {icon: <ShieldCheck/>, title: "Cranio‑Maxillofacial", points: ["Trauma • Reconstruction • Implants", "Microsurgery & Free Flaps", "Orbital • Zygomatic • Midface"]},
              {icon: <Stethoscope/>, title: "Skull Base & Advanced", points: ["Complex Head & Neck", "HPV, Rare Tumors", "Multi‑disciplinary boards"]},
              {icon: <Award/>, title: "Aesthetic & Functional", points: ["Jawline, Chin, Rhinoplasty (team)", "Scar revisions, Nerve repairs", "Speech & Swallow Rehab"]},
              {icon: <Clock/>, title: "Day‑care & OPD", points: ["Biopsies, Minor procedures", "Scope clinics", "Pain & Palliation"]},
            ].map((s, i)=> (
              <Card key={i} className="rounded-2xl">
                <CardHeader className="flex-row items-center gap-3">
                  <div className="p-2 rounded-xl bg-gray-100">{s.icon}</div>
                  <CardTitle className="text-lg">{s.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    {s.points.map((p, j)=> <li key={j}>{p}</li>)}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="doctor" className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2">
            <h2 className="text-2xl md:text-3xl font-semibold">Dr. Ranjit Mandwe</h2>
            <img src="/images/doctor-portrait.jpg" alt="Dr. Ranjit Mandwe" className="mt-4 w-full rounded-2xl shadow object-cover" />
            <p className="mt-2 text-gray-600">Consultant Head & Neck Oncosurgeon • Fellowships (Head & Neck Oncology, New York, USA) • MDS Maxillofacial Surgery</p>
            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <Card className="rounded-2xl"><CardContent className="p-4 text-sm text-gray-600">Special interest in organ preservation, nerve‑sparing surgery, and microsurgical reconstruction with outcomes tracking.</CardContent></Card>
              <Card className="rounded-2xl"><CardContent className="p-4 text-sm text-gray-600">Collaborates with multi‑specialty teams in Amravati & Nagpur; patient education and second‑opinion friendly.</CardContent></Card>
            </div>
          </div>
          <Card className="rounded-2xl">
            <CardHeader><CardTitle>Clinic Timings</CardTitle></CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-2">
              <div className="flex items-center gap-2"><Clock size={16}/> Mon–Sat: 11:00–15:30, 18:00–21:00</div>
              <div className="flex items-center gap-2"><MapPin size={16}/> Rajapeth Bridge, Amravati</div>
              <div className="flex items-center gap-2"><Phone size={16}/> +91 96733 11234</div>
              <a href="#consult"><Button className="w-full mt-2 bg-[var(--gold)] text-black hover:opacity-90">Book Now</Button></a>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="journey" className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-semibold">Your Care Journey</h2>
          <div className="mt-8 grid md:grid-cols-4 gap-4">
            {[
              {title:"1. Connect", text:"Call/WhatsApp. Share reports. Get a triage slot."},
              {title:"2. Evaluate", text:"Clinical exam, imaging, tumor board inputs."},
              {title:"3. Treat", text:"Surgery, reconstruction, adjuvant therapies."},
              {title:"4. Recover", text:"Rehab, speech & swallow, follow‑up, survivorship."},
            ].map((step,i)=> (
              <Card key={i} className="rounded-2xl h-full"><CardContent className="p-4"><div className="text-sm font-medium">{step.title}</div><p className="text-sm text-gray-600 mt-1">{step.text}</p></CardContent></Card>
            ))}
          </div>
        </div>
      </section>

      <section id="consult" className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold">Request a Consultation</h2>
            <p className="mt-2 text-gray-600">Fast triage for cancer cases. Upload reports via WhatsApp or bring printed copies.</p>
            <form className="mt-6 space-y-3" onSubmit={(e)=>e.preventDefault()}>
              <div className="grid md:grid-cols-2 gap-3">
                <Input placeholder="Full name" required />
                <Input type="tel" placeholder="Phone" required />
              </div>
              <Input type="email" placeholder="Email (optional)" />
              <Textarea placeholder="Brief history / reports / preferred slot" />
              <div className="flex gap-2">
                <Button type="submit" className="gap-2 bg-[var(--gold)] text-black hover:opacity-90"><Stethoscope size={16}/> Submit</Button>
                <a href="https://wa.me/919673311234" target="_blank"><Button variant="outline" className="gap-2"><MessageCircle size={16}/> WhatsApp</Button></a>
              </div>
              <p className="text-xs text-gray-500">Submitting this form sends a callback request—no medical advice is given online.</p>
            </form>
          </div>
          <Card className="rounded-2xl">
            <CardHeader><CardTitle>Why Patients Choose Us</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5" size={18}/> Strict oncology pathways, infection control, and outcomes tracking.</div>
              <div className="flex items-start gap-3"><Award className="mt-0.5" size={18}/> Fellowship‑trained surgeon with international exposure.</div>
              <div className="flex items-start gap-3"><Users className="mt-0.5" size={18}/> Multidisciplinary tumor boards and second‑opinion friendly care.</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="contact" className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold">Contact & Locations</h2>
            <div className="mt-6 space-y-3 text-sm text-gray-700">
              <div className="flex items-center gap-2"><MapPin size={16}/> Rajapeth Bridge, Amravati, Maharashtra</div>
              <div className="flex items-center gap-2"><Phone size={16}/> +91 96733 11234</div>
              <div className="flex items-center gap-2"><Clock size={16}/> Mon–Sat: 11:00–15:30 & 18:00–21:00</div>
            </div>
            <div className="mt-6 flex gap-3">
              <a href="tel:+919673311234"><Button className="gap-2 bg-[var(--gold)] text-black hover:opacity-90"><Phone size={16}/> Call</Button></a>
              <a href="https://wa.me/919673311234" target="_blank"><Button variant="secondary" className="gap-2"><MessageCircle size={16}/> WhatsApp</Button></a>
            </div>
          </div>
          <Card className="rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-[16/9] w-full bg-gray-200 grid place-items-center text-gray-500">Map Embed Placeholder</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="gallery" className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-semibold">Before & After Gallery</h2>
          <p className="mt-2 text-gray-600">Representative cases. Individual results vary. All images shown with consent.</p>
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            {[
              {before:"/images/case1-before.jpg", after:"/images/case1-after.jpg", label:"Orthognathic Class III"},
              {before:"/images/case2-before.jpg", after:"/images/case2-after.jpg", label:"Oral Cancer Resection + Free Flap"},
              {before:"/images/case3-before.jpg", after:"/images/case3-after.jpg", label:"Zygomatic-Orbital Reconstruction"},
            ].map((c,i)=> (
              <Card key={i} className="rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid grid-cols-2">
                    <img src={c.before} alt={`${c.label} — before`} className="w-full h-40 object-cover"/>
                    <img src={c.after} alt={`${c.label} — after`} className="w-full h-40 object-cover"/>
                  </div>
                  <div className="p-3 text-sm text-gray-700">{c.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MedicalOrganization",
          "name": "The Face Hospital",
          "url": "https://thefacehospital.in",
          "logo": "https://thefacehospital.in/images/the-face-logo.png",
          "telephone": "+91 9673311234",
          "address": {"@type":"PostalAddress","addressLocality":"Amravati","addressRegion":"Maharashtra","addressCountry":"IN"},
          "department": [
            {"@type":"MedicalSpecialty","name":"Head & Neck Oncology"},
            {"@type":"MedicalSpecialty","name":"Orthognathic Surgery"},
            {"@type":"MedicalSpecialty","name":"Cranio‑Maxillofacial"}
          ]
        })}}
      />
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-3 gap-8">
          <div>
            <div className="font-semibold">The Face Hospital</div>
            <p className="text-sm text-gray-600 mt-2">Head & Neck Super‑Specialty centre for oncology, orthognathic, and craniofacial surgery in Amravati & Nagpur.</p>
          </div>
          <div>
            <div className="font-semibold">Quick Links</div>
            <ul className="mt-2 text-sm text-gray-700 space-y-1">
              <li><a href="#services" className="hover:underline">Specialties</a></li>
              <li><a href="#doctor" className="hover:underline">Our Surgeon</a></li>
              <li><a href="#consult" className="hover:underline">Consultation</a></li>
              <li><a href="#contact" className="hover:underline">Contact</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">Legal</div>
            <p className="text-xs text-gray-500 mt-2">© {(new Date()).getFullYear()} The Face Hospital. All rights reserved. This website does not provide medical advice. In emergencies call your local emergency number.</p>
          </div>
        </div>
      </footer>

      <a
        href="https://wa.me/919673311234"
        target="_blank"
        className="fixed bottom-4 right-4 z-50 shadow-xl rounded-full p-4 bg-[#25D366] text-white hover:opacity-90"
      >
        <MessageCircle size={28} />
      </a>
    </div>
  );
}
