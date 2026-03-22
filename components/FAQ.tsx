"use client";
import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";

const faqs = [
  {
    q: "Is ConvertX really free?",
    a: "Yes, all 70+ converters are completely free with no hidden charges, no subscriptions, and no limits.",
  },
  {
    q: "Are my files safe and private?",
    a: "Absolutely. All conversions happen locally in your browser using JavaScript. Your files never get uploaded to any server.",
  },
  {
    q: "Do I need to create an account?",
    a: "No account, no email, no signup. Just open the site, pick a converter, and go.",
  },
  {
    q: "What is the maximum file size?",
    a: "Since conversion runs in your browser, it depends on your device's memory. Most files up to 100MB work perfectly.",
  },
  {
    q: "How long does conversion take?",
    a: "Most conversions complete in under 5 seconds. Image and data conversions are nearly instant.",
  },
  {
    q: "Which formats are supported?",
    a: "PDF, Word, Excel, PPT, JPG, PNG, WebP, SVG, MP4, MP3, WAV, CSV, JSON, XML, HTML, Markdown and many more.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="max-w-2xl mx-auto px-4 py-24">
      <div className="section-divider mb-16" />

      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-xs text-emerald-300 mb-5">
          💬 FAQ
        </div>
        <h2 className="text-4xl font-black text-white mb-3 tracking-tight">
          Got <span className="gradient-text">Questions?</span>
        </h2>
        <p className="text-white/35 text-sm">Everything you need to know</p>
      </div>

      <div className="flex flex-col gap-2">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className={`rounded-2xl overflow-hidden transition-all duration-300 ${
              open === i
                ? "bg-white/[0.05] border border-indigo-500/25 shadow-lg shadow-indigo-500/5"
                : "bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1]"
            }`}
          >
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-left group"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className={`text-sm font-semibold transition-colors ${open === i ? "text-white" : "text-white/65 group-hover:text-white"}`}>
                {faq.q}
              </span>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ml-3 transition-all duration-300 ${
                open === i ? "bg-indigo-500/20 text-indigo-400 rotate-45" : "bg-white/5 text-white/30"
              }`}>
                <Plus size={14} />
              </div>
            </button>

            <div className={`overflow-hidden transition-all duration-300 ${open === i ? "max-h-40" : "max-h-0"}`}>
              <p className="px-5 pb-4 text-white/45 text-sm leading-relaxed">
                {faq.a}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
