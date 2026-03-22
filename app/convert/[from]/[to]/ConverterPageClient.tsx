"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, CheckCircle, Shield, Zap, Globe } from "lucide-react";
import type { Converter } from "@/lib/converters";
import UploadModal from "@/components/UploadModal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Props {
  converter: Converter;
  category?: { key: string; label: string; emoji: string; color: string };
  related: Converter[];
}

const perks = [
  { icon: <Zap size={15} />, text: "Converts in seconds" },
  { icon: <Shield size={15} />, text: "Files never leave your device" },
  { icon: <Globe size={15} />, text: "No signup required" },
  { icon: <CheckCircle size={15} />, text: "100% free forever" },
];

// Only these conversions work natively in the browser
const BROWSER_SUPPORTED = new Set([
  "JPG→PNG","PNG→JPG","JPG→WEBP","WEBP→JPG","PNG→WEBP","WEBP→PNG",
  "BMP→JPG","TIFF→JPG","GIF→JPG",
  "SVG→PNG","SVG→JPG",
  "IMAGE→PDF","JPG→PDF","PNG→PDF","WEBP→PDF",
  "CSV→JSON","JSON→CSV",
  "XML→JSON","JSON→XML",
  "MARKDOWN→HTML","HTML→MARKDOWN",
  "MP3→WAV","WAV→MP3","AAC→MP3","FLAC→MP3",
]);

function isSupported(from: string, to: string) {
  return BROWSER_SUPPORTED.has(`${from.toUpperCase()}→${to.toUpperCase()}`);
}

function cloudConvertUrl(from: string, to: string) {
  return `https://cloudconvert.com/${from.toLowerCase().replace(/\s+/g, "-")}-to-${to.toLowerCase().replace(/\s+/g, "-")}`;
}

export default function ConverterPageClient({ converter, category, related }: Props) {
  const [open, setOpen] = useState(false);
  const supported = isSupported(converter.from, converter.to);

  const handleConvertClick = () => {
    if (supported) {
      setOpen(true);
    } else {
      window.open(cloudConvertUrl(converter.from, converter.to), "_blank", "noopener,noreferrer");
    }
  };

  const gradientClass = category?.color ?? "from-indigo-500 to-purple-600";
  const fromUp = converter.from.toUpperCase();
  const toUp = converter.to.toUpperCase();

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${fromUp} to ${toUp} Converter`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: `Free online ${fromUp} to ${toUp} converter. No signup needed. Convert files instantly in your browser.`,
    url: `https://convertx.app/convert/${converter.from.toLowerCase()}/${converter.to.toLowerCase()}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="hero-bg min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-white/30 mb-8">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white/50">{fromUp} to {toUp} Converter</span>
          </nav>

          {/* Hero card */}
          <div className="glass rounded-3xl p-8 border border-white/10 mb-8 text-center">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center text-3xl mx-auto mb-5 shadow-lg`}>
              {converter.icon}
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
              {fromUp} to {toUp} Converter
            </h1>
            <p className="text-white/50 text-base max-w-xl mx-auto mb-6 leading-relaxed">
              Convert your <strong className="text-white/70">{fromUp}</strong> files to{" "}
              <strong className="text-white/70">{toUp}</strong> format online for free.
              No software to install, no account needed — just upload and convert instantly.
            </p>

            {/* Perks */}
            <div className="flex flex-wrap justify-center gap-3 mb-7">
              {perks.map((p) => (
                <span key={p.text} className="flex items-center gap-1.5 glass rounded-full px-3 py-1.5 text-xs text-white/60">
                  <span className="text-indigo-400">{p.icon}</span>
                  {p.text}
                </span>
              ))}
            </div>

            <button
              onClick={handleConvertClick}
              className={`inline-flex items-center gap-2 bg-gradient-to-r ${gradientClass} text-white px-8 py-4 rounded-xl font-bold text-base hover:opacity-90 transition-all hover:scale-105 shadow-lg`}
            >
              {supported ? `Convert ${fromUp} to ${toUp}` : `Open CloudConvert ↗`}
              <ArrowRight size={18} />
            </button>
          </div>

          {/* How it works */}
          <div className="glass rounded-3xl p-6 border border-white/10 mb-8">
            <h2 className="text-white font-bold text-lg mb-5">
              How to Convert {fromUp} to {toUp}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { step: "1", title: "Upload File", desc: `Click the button and select your ${fromUp} file, or drag & drop it.` },
                { step: "2", title: "Convert", desc: `Click "Convert" and the conversion happens instantly in your browser.` },
                { step: "3", title: "Download", desc: `Your ${toUp} file downloads automatically. Done!` },
              ].map((s) => (
                <div key={s.step} className="flex gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                    {s.step}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{s.title}</p>
                    <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ for this converter */}
          <div className="glass rounded-3xl p-6 border border-white/10 mb-8">
            <h2 className="text-white font-bold text-lg mb-5">
              Frequently Asked Questions
            </h2>
            <div className="flex flex-col gap-4">
              {[
                {
                  q: `Is this ${fromUp} to ${toUp} converter free?`,
                  a: `Yes, completely free. No hidden fees, no subscription, no account required.`,
                },
                {
                  q: `Is my ${fromUp} file safe?`,
                  a: `Your file never leaves your device. All conversion happens locally in your browser using JavaScript.`,
                },
                {
                  q: `What is the maximum file size?`,
                  a: `Since conversion runs in your browser, it depends on your device memory. Most files up to 100MB work fine.`,
                },
                {
                  q: `How long does ${fromUp} to ${toUp} conversion take?`,
                  a: `Most conversions complete in under 5 seconds depending on file size.`,
                },
              ].map((faq) => (
                <div key={faq.q} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                  <p className="text-white font-medium text-sm mb-1">{faq.q}</p>
                  <p className="text-white/40 text-xs leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Related converters */}
          {related.length > 0 && (
            <div>
              <h2 className="text-white font-bold text-lg mb-4">Related Converters</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {related.map((c) => (
                  <Link
                    key={c.id}
                    href={`/convert/${c.from.toLowerCase().replace(/\s+/g, "-")}/${c.to.toLowerCase().replace(/\s+/g, "-")}`}
                    className="glass rounded-2xl p-3 border border-white/8 hover:border-indigo-500/40 transition-all hover:-translate-y-1 flex items-center gap-2"
                  >
                    <span className="text-lg">{c.icon}</span>
                    <span className="text-white/70 text-xs font-medium">
                      {c.from} <ArrowRight size={10} className="inline text-white/30" /> {c.to}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back link */}
          <div className="mt-10 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white text-sm transition-colors">
              <ArrowLeft size={14} /> Back to all converters
            </Link>
          </div>
        </div>
      </main>
      <Footer />

      {open && <UploadModal converter={converter} onClose={() => setOpen(false)} />}
    </>
  );
}
