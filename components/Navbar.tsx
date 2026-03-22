"use client";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "#converters", label: "Converters" },
  { href: "#features", label: "Features" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? "glass-strong border-b border-white/8 py-3 shadow-lg shadow-black/20"
        : "py-5"
    }`}>
      <div className="max-w-7xl mx-auto px-5 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 group-hover:scale-110 transition-all duration-300">
            <Image src="/scanner.svg" alt="ConvertX" width={36} height={36} />
          </div>
          <span className="font-extrabold text-lg gradient-text tracking-tight">ConvertX</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative px-4 py-2 text-sm text-white/50 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5 group"
            >
              {l.label}
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-px bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-4 transition-all duration-300" />
            </a>
          ))}
        </div>

        {/* Right: CTA + mobile toggle */}
Name="text-white/60 hover:text-white hover:bg-white/5 px-3 py-2.5 rounded-xl text-sm transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#converters"
            onClick={() => setOpen(false)}
            className="mt-2 text-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl"
          >
            Start Converting
          </a>
        </div>
      )}
    </nav>
  );
}

            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden glass-strong border-t border-white/8 px-5 py-4 flex flex-col gap-1 mt-0">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              classgap-3">
          <a
            href="#converters"
            className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-md shadow-indigo-500/20"
          >
            Start Converting
          </a>
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center glass rounded-xl text-white/60 hover:text-white transition-colors"        <div className="flex items-center 