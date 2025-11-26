
import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "The Face Hospital — Head & Neck Super‑Specialty",
  description: "Advanced Head & Neck Oncosurgery, Orthognathic & Craniofacial Care in Amravati & Nagpur.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: ReactNode }){
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
