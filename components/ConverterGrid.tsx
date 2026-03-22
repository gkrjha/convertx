"use client";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { converters, categories } from "@/lib/converters";
import type { Category } from "@/lib/converters";
import ConverterCard from "./ConverterCard";

export default function ConverterGrid() {
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = converters.filter((c) => {
    const matchCat = activeCategory === "all" || c.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || c.from.toLowerCase().includes(q) || c.to.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const getCategoryGradient = (cat: Category) =>
    categories.find((c) => c.key === cat)?.color ?? "from-indigo-500 to-purple-600";

  return (
    <section id="converters" className="max-w-7xl mx-auto px-4 py-24">
      {/* Section divider */}
      <div className="section-divider mb-16" />

      {/* Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-xs text-indigo-300 mb-5">
          ✨ 70+ Conversion Tools
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
          All <span className="gradient-text">Converters</span>
        </h2>
        <p className="text-white/35 text-base max-w-md mx-auto">
          Search or filter by category to find your conversion
        </p>
      </div>

      {/* Search bar */}
      <div className="relative max-w-lg mx-auto mb-8 group">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-indigo-400 transition-colors" />
        <input
          type="text"
          placeholder="Search e.g. PDF to Word, JPG to PNG..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500/50 focus:bg-white/[0.06] rounded-2xl pl-10 pr-10 py-3.5 text-sm text-white placeholder-white/25 outline-none transition-all"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
            activeCategory === "all"
              ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 scale-105"
              : "bg-white/[0.04] border border-white/[0.07] text-white/45 hover:text-white hover:bg-white/[0.07]"
          }`}
        >
          ✨ All ({converters.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeCategory === cat.key
                ? `bg-gradient-to-r ${cat.color} text-white shadow-lg scale-105`
                : "bg-white/[0.04] border border-white/[0.07] text-white/45 hover:text-white hover:bg-white/[0.07]"
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      {search && (
        <p className="text-center text-white/30 text-xs mb-6">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &quot;{search}&quot;
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-white/30 text-base">No converters found for &quot;{search}&quot;</p>
          <button onClick={() => setSearch("")} className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm underline">
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((c) => (
            <ConverterCard key={c.id} converter={c} gradientClass={getCategoryGradient(c.category)} />
          ))}
        </div>
      )}
    </section>
  );
}
