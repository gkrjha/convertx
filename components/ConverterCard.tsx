"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Star, Zap } from "lucide-react";
import type { Converter } from "@/lib/converters";
import UploadModal from "./UploadModal";

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
  return `https://cloudconvert.com/${from.toLowerCase().replace(/\s+/g,"-")}-to-${to.toLowerCase().replace(/\s+/g,"-")}`;
}

interface Props {
  converter: Converter;
  gradientClass: string;
}

export default function ConverterCard({ converter, gradientClass }: Props) {
  const [open, setOpen] = useState(false);
  const slug = (s: string) => s.toLowerCase().replace(/\s+/g, "-");
  const href = `/convert/${slug(converter.from)}/${slug(converter.to)}`;
  const supported = isSupported(converter.from, converter.to);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (supported) {
      setOpen(true);
    } else {
      window.open(cloudConvertUrl(converter.from, converter.to), "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      <Link
        href={href}
        onClick={handleClick}
        title={`Convert ${converter.from} to ${converter.to} online free`}
        className="group relative glass rounded-2xl p-4 block overflow-hidden transition-all duration-250 hover:-translate-y-1.5 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/15 hover:bg-white/[0.05]"
      >
        {/* Shimmer on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shimmer rounded-2xl pointer-events-none" />

        {/* Badge */}
        {!supported ? (
          <span className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[9px] bg-white/5 text-white/30 border border-white/10 rounded-full px-2 py-0.5 font-semibold">
            ↗ External
          </span>
        ) : converter.popular ? (
          <span className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[9px] bg-amber-500/15 text-amber-400 border border-amber-500/25 rounded-full px-2 py-0.5 font-semibold">
            <Star size={8} fill="currentColor" /> Hot
          </span>
        ) : null}
        {/* Icon */}
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center text-xl mb-3.5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
          {converter.icon}
        </div>

        {/* Label */}
        <div className="flex items-center gap-1 text-sm font-bold text-white mb-1 leading-tight">
          <span className="truncate">{converter.from}</span>
          <ArrowRight size={11} className="text-white/30 group-hover:text-indigo-400 shrink-0 transition-colors group-hover:translate-x-0.5 duration-200" />
          <span className="truncate">{converter.to}</span>
        </div>

        <p className="text-[11px] text-white/30 leading-snug">
          Free online converter
        </p>

        {/* Hover CTA */}
        <div className="mt-3 overflow-hidden max-h-0 group-hover:max-h-10 transition-all duration-300">
          <div className={`flex items-center justify-center gap-1 w-full text-[11px] bg-gradient-to-r ${supported ? gradientClass : "from-white/10 to-white/5"} text-white rounded-lg py-1.5 font-semibold`}>
            {supported ? <><Zap size={10} /> Convert Now</> : <>↗ Open CloudConvert</>}
          </div>
        </div>
      </Link>

      {open && <UploadModal converter={converter} onClose={() => setOpen(false)} />}
    </>
  );
}
