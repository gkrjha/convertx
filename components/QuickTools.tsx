"use client";
import { useState } from "react";
import { ArrowRight, Zap } from "lucide-react";
import { converters } from "@/lib/converters";
import UploadModal from "./UploadModal";
import type { Converter } from "@/lib/converters";

const QUICK_IDS = [1, 2, 16, 17, 26, 27, 32, 20, 41, 56, 12, 48];

const quickConverters = QUICK_IDS.map((id) => converters.find((c) => c.id === id)!).filter(Boolean);

const tagColors: Record<number, string> = {
  1: "from-blue-500/20 to-indigo-500/20 border-blue-500/20",
  2: "from-indigo-500/20 to-purple-500/20 border-indigo-500/20",
  16: "from-emerald-500/20 to-teal-500/20 border-emerald-500/20",
  17: "from-teal-500/20 to-cyan-500/20 border-teal-500/20",
  26: "from-pink-500/20 to-rose-500/20 border-pink-500/20",
  27: "from-rose-500/20 to-pink-500/20 border-rose-500/20",
  32: "from-violet-500/20 to-purple-500/20 border-violet-500/20",
  20: "from-emerald-500/20 to-green-500/20 border-emerald-500/20",
  41: "from-violet-500/20 to-indigo-500/20 border-violet-500/20",
  56: "from-cyan-500/20 to-sky-500/20 border-cyan-500/20",
  12: "from-orange-500/20 to-amber-500/20 border-orange-500/20",
  48: "from-red-500/20 to-orange-500/20 border-red-500/20",
};

export default function QuickTools() {
  const [active, setActive] = useState<Converter | null>(null);

  return (
    <section id="quick-tools" className="py-14 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Zap size={15} className="text-white" fill="white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-xl">Quick Tools</h2>
            <p className="text-white/35 text-xs mt-0.5">Most used conversions — one click away</p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {quickConverters.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c)}
              className={`group relative bg-gradient-to-br ${tagColors[c.id] ?? "from-white/5 to-white/5 border-white/10"} border rounded-2xl p-4 text-left hover:scale-[1.03] hover:border-white/20 transition-all duration-200 cursor-pointer`}
            >
              {/* Icon */}
              <div className="text-2xl mb-3">{c.icon}</div>

              {/* Labels */}
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-white/80 text-xs font-semibold">{c.from}</span>
                <ArrowRight size={10} className="text-white/30 flex-shrink-0" />
                <span className="text-white/80 text-xs font-semibold">{c.to}</span>
              </div>

              {/* Hover arrow */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                  <ArrowRight size={10} className="text-white/60" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {active && <UploadModal converter={active} onClose={() => setActive(null)} />}

      {/* Scroll to all converters */}
      <div className="flex justify-center mt-10">
        <a
          href="#converters"
          className="flex flex-col items-center gap-2 group cursor-pointer"
          aria-label="See all converters"
        >
          <span className="text-white/25 text-[10px] uppercase tracking-[0.2em] group-hover:text-white/50 transition-colors">All Converters</span>
          <div className="w-10 h-10 rounded-full border-2 border-white/15 group-hover:border-indigo-500/60 bg-white/[0.03] group-hover:bg-indigo-500/10 flex items-center justify-center transition-all duration-300 shadow-lg group-hover:shadow-indigo-500/20">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="animate-bounce text-white/40 group-hover:text-indigo-400 transition-colors">
              <path d="M2 4.5L7 9.5L12 4.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </a>
      </div>
    </section>
  );
}
