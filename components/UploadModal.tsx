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
    setProgress(0);

    const timer = setInterval(() => {
      setProgress((p) => (p < 85 ? p + Math.random() * 15 : p));
    }, 150);

    try {
      await convertFile(file, converter.from, converter.to);
      clearInterval(timer);
      setProgress(100);
      setStep("done");
    } catch (err) {
      clearInterval(timer);
      setErrorMsg(err instanceof Error ? err.message : "Conversion failed");
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
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass rounded-3xl w-full max-w-md p-6 relative border border-white/10 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg">
            {converter.icon}
          </div>
          <div>
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              {converter.from}
              <ArrowRight size={14} className="text-white/40" />
              {converter.to}
            </h2>
            <p className="text-white/40 text-xs">Runs entirely in your browser</p>
          </div>
        </div>

        {step === "upload" && (
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragging ? "border-indigo-400 bg-indigo-500/10"
                : file ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-white/10 hover:border-indigo-500/50 hover:bg-white/5"
              }`}
            >
              <input ref={inputRef} type="file" className="hidden"
                onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
              {file ? (
                <>
                  <CheckCircle size={36} className="text-emerald-400 mx-auto mb-3" />
                  <p className="text-white font-medium text-sm truncate max-w-xs mx-auto">{file.name}</p>
                  <p className="text-white/30 text-xs mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                  <button onClick={(e) => { e.stopPropagation(); reset(); }}
                    className="mt-3 text-xs text-white/30 hover:text-white underline">Remove</button>
                </>
              ) : (
                <>
                  <Upload size={36} className="text-white/20 mx-auto mb-3" />
                  <p className="text-white/60 text-sm font-medium">Drop your {converter.from} file here</p>
                  <p className="text-white/30 text-xs mt-1">or click to browse</p>
                  <p className="text-white/20 text-xs mt-3">Files never leave your device</p>
                </>
              )}
            </div>
            <button disabled={!file} onClick={handleConvert}
              className={`w-full mt-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                file ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 hover:scale-[1.02]"
                : "bg-white/5 text-white/20 cursor-not-allowed"
              }`}>
              Convert to {converter.to}
            </button>
          </>
        )}

        {step === "converting" && (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <ArrowRight size={24} className="text-white" />
            </div>
            <p className="text-white font-semibold mb-1">Converting...</p>
            <p className="text-white/40 text-sm mb-6 truncate max-w-xs mx-auto">{file?.name}</p>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-200"
                style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
            <p className="text-white/30 text-xs mt-2">{Math.min(Math.round(progress), 100)}%</p>
          </div>
        )}

        {step === "done" && (
          <div className="text-center py-6">
            <CheckCircle size={52} className="text-emerald-400 mx-auto mb-4" />
            <p className="text-white font-bold text-lg mb-1">Done!</p>
            <p className="text-white/40 text-sm mb-6">Your {converter.to} file was downloaded automatically.</p>
            <button onClick={reset}
              className="w-full glass text-white/50 hover:text-white py-3 rounded-xl text-sm transition-colors">
              Convert Another File
            </button>
          </div>
        )}

        {step === "error" && (
          <div className="text-center py-6">
            <AlertCircle size={52} className="text-red-400 mx-auto mb-4" />
            <p className="text-white font-bold text-lg mb-1">Conversion Failed</p>
            <p className="text-white/40 text-sm mb-6">{errorMsg || "Something went wrong."}</p>
            <button onClick={reset}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-semibold text-sm">
              Try Again
            </button>
          </div>
        )}

        <p className="text-center text-white/20 text-xs mt-4">
          ?? Your files never leave your device
        </p>
      </div>
    </div>
  );
}
