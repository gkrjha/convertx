"use client";
import { ArrowRight, Shield, Zap, Globe, Star } from "lucide-react";
import Image from "next/image";

const stats = [
  { value: "70+", label: "Converters", icon: "🔄" },
  { value: "10M+", label: "Files Done", icon: "📁" },
  { value: "100%", label: "Free", icon: "🎁" },
  { value: "0s", label: "Signup Time", icon: "⚡" },
];

const badges = [
  { icon: <Zap size={12} />, text: "Lightning Fast" },
  { icon: <Shield size={12} />, text: "100% Secure" },
  { icon: <Globe size={12} />, text: "No Install" },
  { icon: <Star size={12} />, text: "Always Free" },
];

export default function Hero() {
  return (
    <section className="hero-bg min-h-screen flex items-center px-4 pt-20 pb-16 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 -left-32 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-600/6 rounded-full blur-3xl pointer-events-none" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* ── Left ── */}
        <div className="flex flex-col items-start fade-up">
          {/* Top badge */}
          <div className="flex items-center gap-2.5 mb-7 px-4 py-2 rounded-full border border-indigo-500/25 bg-indigo-500/8 text-xs text-indigo-300">
            <Image src="/scanner.svg" alt="" width={16} height={16} className="rounded-md opacity-90" />
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span>#1 Free File Converter — No Signup Required</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-[64px] font-black text-white leading-[1.08] tracking-tight mb-5">
            Convert Any File
            <br />
            <span className="gradient-text">Instantly</span>
            <span className="text-white"> & Free</span>
          </h1>

          <p className="text-white/45 text-base md:text-lg max-w-md mb-8 leading-relaxed">
            70+ conversion tools for documents, images, videos, audio and data.
            Runs entirely in your browser — your files never leave your device.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mb-9">
            {badges.map((b) => (
              <span key={b.text} className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full px-3 py-1.5 text-xs text-white/55 hover:text-white/80 hover:border-white/15 transition-colors">
                <span className="text-indigo-400">{b.icon}</span>
                {b.text}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <a href="#converters"
              className="group flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-7 py-3.5 rounded-2xl font-bold text-sm hover:opacity-95 transition-all hover:scale-[1.03] shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50">
              Start Converting
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a href="#features"
              className="flex items-center justify-center gap-2 bg-white/[0.04] border border-white/[0.08] text-white/65 hover:text-white hover:bg-white/[0.07] hover:border-white/15 px-7 py-3.5 rounded-2xl font-medium text-sm transition-all">
              See Features
            </a>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3 w-full max-w-md">
            {stats.map((s) => (
              <div key={s.label} className="gradient-border p-3 text-center rounded-2xl hover:scale-105 transition-transform cursor-default">
                <div className="text-base mb-0.5">{s.icon}</div>
                <div className="text-lg font-black gradient-text leading-none">{s.value}</div>
                <div className="text-[9px] text-white/30 mt-1 uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Donate QR ── */}
        <div className="hidden lg:flex items-center justify-center relative">
          <div className="absolute w-72 h-72 bg-pink-500/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative float">
            {/* Outer glow ring */}
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/20 blur-xl" />

            <div className="relative glass-strong rounded-[1.75rem] p-7 border border-white/10 shadow-2xl text-center">
              {/* QR */}
              <div className="w-52 h-52 rounded-2xl overflow-hidden border border-white/10 mx-auto shadow-inner">
                <Image src="/donate-qr.jpg" alt="Donate QR Code" width={208} height={208} priority className="w-full h-full object-cover" />
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mt-5 mb-3">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10" />
                <span className="text-white/30 text-[10px] tracking-[0.2em] uppercase">Scan to Pay</span>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10" />
              </div>

              <p className="text-xl font-black gradient-text">Donate Here</p>
              <p className="text-white/30 text-xs mt-1">for help &amp; support ❤️</p>

              {/* Floating heart */}
              <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/40 text-base pulse-glow">
                ❤️
              </div>

              {/* Bottom tag */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                100% Free Tool
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
