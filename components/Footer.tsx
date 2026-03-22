import Image from "next/image";
import Link from "next/link";

const links = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Contact", href: "#" },
  { label: "Blog", href: "#" },
];

const converterLinks = [
  { label: "PDF to Word", from: "pdf", to: "word" },
  { label: "JPG to PNG", from: "jpg", to: "png" },
  { label: "MP4 to MP3", from: "mp4", to: "mp3" },
  { label: "CSV to JSON", from: "csv", to: "json" },
  { label: "Image to PDF", from: "image", to: "pdf" },
  { label: "PNG to WebP", from: "png", to: "webp" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] pt-14 pb-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20">
                <Image src="/scanner.svg" alt="Flivert" width={32} height={32} />
              </div>
              <span className="font-extrabold text-base gradient-text">Flivert</span>
            </div>
            <p className="text-white/30 text-xs leading-relaxed max-w-xs">
              Free online file converter. 70+ tools for documents, images, audio, video and data. No signup. No install. Runs in your browser.
            </p>
          </div>

          {/* Popular converters */}
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-4">Popular Converters</p>
            <div className="grid grid-cols-2 gap-1.5">
              {converterLinks.map((c) => (
                <Link
                  key={c.label}
                  href={`/convert/${c.from}/${c.to}`}
                  className="text-white/30 hover:text-white/70 text-xs transition-colors hover:underline"
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-4">Company</p>
            <div className="flex flex-col gap-2">
              {links.map((l) => (
                <a key={l.label} href={l.href} className="text-white/30 hover:text-white/70 text-xs transition-colors w-fit">
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="section-divider mb-6" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/20 text-xs">
            © {new Date().getFullYear()} Flivert. All rights reserved.
          </p>
          <p className="text-white/15 text-xs">
            Made with ❤️ — Free forever
          </p>
        </div>
      </div>
    </footer>
  );
}
