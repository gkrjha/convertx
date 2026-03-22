import Image from "next/image";
import { Heart } from "lucide-react";

export default function Donate() {
  return (
    <section className="max-w-sm mx-auto px-4 py-16 text-center">
      {/* Heading */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <Heart size={18} className="text-pink-400" fill="currentColor" />
        <h2 className="text-white font-bold text-xl">Support ConvertX</h2>
        <Heart size={18} className="text-pink-400" fill="currentColor" />
      </div>
      <p className="text-white/40 text-sm mb-8 leading-relaxed">
        ConvertX is free for everyone. If it saved your time, consider buying us a coffee ☕
      </p>

      {/* QR Card */}
      <div className="glass rounded-3xl p-6 border border-white/10 inline-block shadow-xl shadow-pink-500/5 hover:shadow-pink-500/10 transition-shadow duration-500">
        <div className="relative w-48 h-48 mx-auto rounded-2xl overflow-hidden border border-white/10">
          <Image
            src="/donate-qr.jpg"
            alt="Donate QR Code"
            fill
            className="object-cover"
          />
        </div>

        {/* Scan label */}
        <div className="mt-5 flex items-center justify-center gap-2">
          <span className="w-6 h-px bg-white/20" />
          <p className="text-white/50 text-xs tracking-widest uppercase">Scan to Pay</p>
          <span className="w-6 h-px bg-white/20" />
        </div>

        {/* Donate Here text */}
        <div className="mt-3">
          <p className="text-lg font-bold gradient-text">Donate Here</p>
          <p className="text-white/30 text-xs mt-1">for help &amp; support ❤️</p>
        </div>
      </div>

      {/* Thank you note */}
      <p className="text-white/20 text-xs mt-6">
        Every contribution keeps this tool free &amp; running 🙏
      </p>
    </section>
  );
}
