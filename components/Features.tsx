"use client";
import { Shield, Zap, Globe, Lock, RefreshCw, Star } from "lucide-react";

const features = [
  {
    icon: <Zap size={20} />,
    color: "from-indigo-500 to-blue-500",
    glow: "shadow-indigo-500/20",
    title: "Lightning Fast",
    desc: "Conversions complete in seconds. No waiting, no queues — instant results every time.",
  },
  {
    icon: <Shield size={20} />,
    color: "from-emerald-500 to-teal-500",
    glow: "shadow-emerald-500/20",
    title: "100% Private",
    desc: "Your files never leave your device. All conversion happens locally in your browser.",
  },
  {
    icon: <Globe size={20} />,
    color: "from-sky-500 to-cyan-500",
    glow: "shadow-sky-500/20",
    title: "Works Everywhere",
    desc: "Any device, any browser. No software to install, no plugins, no extensions.",
  },
  {
    icon: <Lock size={20} />,
    color: "from-pink-500 to-rose-500",
    glow: "shadow-pink-500/20",
    title: "No Account Needed",
    desc: "Start converting immediately — no signup, no email, no credit card. Ever.",
  },
  {
    icon: <RefreshCw size={20} />,
    color: "from-purple-500 to-violet-500",
    glow: "shadow-purple-500/20",
    title: "70+ Formats",
    desc: "Documents, images, audio, video, data files — we cover every major format.",
  },
  {
    icon: <Star size={20} />,
    color: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/20",
    title: "High Quality",
    desc: "We preserve formatting, resolution, and quality across all conversions.",
  },
];

export default function Features() {
  return (
    <section id="features" className="max-w-7xl mx-auto px-4 py-24">
      <div className="section-divider mb-16" />

      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 text-xs text-purple-300 mb-5">
          🛡️ Why ConvertX
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
          Built for <span className="gradient-text">Everyone</span>
        </h2>
        <p className="text-white/35 text-base max-w-md mx-auto">
          Fast, private, and completely free — no compromises
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="group gradient-border rounded-2xl p-6 hover:bg-white/[0.03] transition-all duration-300 hover:-translate-y-1"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Icon */}
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-5 shadow-lg ${f.glow} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
              {f.icon}
            </div>

            <h3 className="text-white font-bold text-base mb-2">{f.title}</h3>
            <p className="text-white/35 text-sm leading-relaxed">{f.desc}</p>

            {/* Bottom accent line */}
            <div className={`mt-5 h-px w-0 group-hover:w-full bg-gradient-to-r ${f.color} transition-all duration-500 opacity-40`} />
          </div>
        ))}
      </div>
    </section>
  );
}
