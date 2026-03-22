"use client";
import { useRef, useState, useCallback } from "react";
import { X, Upload, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import type { Converter } from "@/lib/converters";
import { convertFile } from "@/lib/convert";

interface Props {
  converter: Converter;
  onClose: () => void;
}

type Step = "upload" | "converting" | "done" | "error";

export default function UploadModal({ converter, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<Step>("upload");
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }, []);

  const handleConvert = async () => {
    if (!file) return;
    setStep("converting");
    setProgress(10);

    const timer = setInterval(() => {
      setProgress((p) => (p < 85 ? p + Math.random() * 12 : p));
    }, 120);

    try {
      await convertFile(file, converter.from, converter.to);
      clearInterval(timer);
      setProgress(100);
      setStep("done");
    } catch (err) {
      clearInterval(timer);
      setErrorMsg(err instanceof Error ? err.message : "Conversion failed. Please try again.");
      setStep("error");
    }
  };

  const reset = () => {
    setFile(null);
    setStep("upload");
    setProgress(0);
    setErrorMsg("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass rounded-3xl w-full max-w-md p-6 relative border border-white/10 shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/25">
            {converter.icon}
          </div>
          <div>
            <h2 className="text-white font-bold text-base flex items-center gap-2">
              {converter.from}
              <ArrowRight size={13} className="text-white/30" />
              {converter.to}
            </h2>
            <p className="text-white/35 text-xs mt-0.5">
              Runs entirely in your browser
            </p>
          </div>
        </div>

        {/* ── Upload step ── */}
        {step === "upload" && (
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                dragging
                  ? "border-indigo-400 bg-indigo-500/10"
                  : file
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : "border-white/10 hover:border-indigo-500/40 hover:bg-white/[0.02]"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
              />
              {file ? (
                <>
                  <CheckCircle size={34} className="text-emerald-400 mx-auto mb-3" />
                  <p className="text-white font-medium text-sm truncate max-w-[260px] mx-auto">{file.name}</p>
                  <p className="text-white/30 text-xs mt-1">
                    {file.size > 1024 * 1024
                      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                      : `${(file.size / 1024).toFixed(1)} KB`}
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); reset(); }}
                    className="mt-3 text-xs text-white/25 hover:text-white/60 underline transition-colors"
                  >
                    Remove file
                  </button>
                </>
              ) : (
                <>
                  <Upload size={34} className="text-white/15 mx-auto mb-3" />
                  <p className="text-white/50 text-sm font-medium">
                    Drop your {converter.from} file here
                  </p>
                  <p className="text-white/25 text-xs mt-1">or click to browse</p>
                  <p className="text-white/15 text-xs mt-4">
                    Max 100MB &nbsp;·&nbsp; Files never leave your device
                    {["Word", "WORD"].includes(converter.from) && (
                      <span className="block mt-1 text-amber-400/60">Note: .docx format only (not .doc)</span>
                    )}
                  </p>
                </>
              )}
            </div>

            <button
              disabled={!file}
              onClick={handleConvert}
              className={`w-full mt-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                file
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 active:scale-[0.98] shadow-lg shadow-indigo-500/20"
                  : "bg-white/5 text-white/20 cursor-not-allowed"
              }`}
            >
              Convert to {converter.to}
            </button>
          </>
        )}

        {/* ── Converting step ── */}
        {step === "converting" && (
          <div className="text-center py-8">
            <div className="relative w-16 h-16 mx-auto mb-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse">
                <ArrowRight size={22} className="text-white" />
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 opacity-30 animate-ping" />
            </div>
            <p className="text-white font-semibold mb-1">Converting...</p>
            <p className="text-white/35 text-xs mb-6 truncate max-w-[260px] mx-auto">{file?.name}</p>
            <div className="w-full bg-white/8 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="text-white/25 text-xs mt-2">{Math.min(Math.round(progress), 100)}%</p>
          </div>
        )}

        {/* ── Done step ── */}
        {step === "done" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-emerald-400" />
            </div>
            <p className="text-white font-bold text-lg mb-1">Done!</p>
            <p className="text-white/40 text-sm mb-6">
              Your <span className="text-white/60">{converter.to}</span> file was downloaded automatically.
            </p>
            <button
              onClick={reset}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity mb-3"
            >
              Convert Another File
            </button>
            <button
              onClick={onClose}
              className="w-full text-white/30 hover:text-white/60 py-2 text-sm transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {/* ── Error step ── */}
        {step === "error" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-red-400" />
            </div>
            <p className="text-white font-bold text-lg mb-2">Conversion Failed</p>
            <p className="text-white/40 text-sm mb-6 leading-relaxed max-w-xs mx-auto">
              {errorMsg || "Something went wrong. Please try again."}
            </p>
            <button
              onClick={reset}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-white/15 text-xs mt-5">
          &#128274; Your files never leave your device
        </p>
      </div>
    </div>
  );
}
