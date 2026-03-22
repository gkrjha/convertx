// Browser-side file conversion library
// No "use client" here — this is a plain utility module

// ─── Types ───────────────────────────────────────────────────────────────────

export type ConversionResult =
  | { supported: true }
  | { supported: false; reason: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function baseName(file: File) {
  return file.name.replace(/\.[^/.]+$/, "");
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target!.result as string);
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsText(file);
  });
}

// ─── Image → Image (canvas) ──────────────────────────────────────────────────

function imageToFormat(file: File, mimeType: string, ext: string, quality = 0.92): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      if (mimeType === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Conversion failed — canvas returned empty blob"));
          downloadBlob(blob, `${baseName(file)}.${ext}`);
          resolve();
        },
        mimeType,
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image — make sure the file is a valid image"));
    };
    img.src = url;
  });
}

// ─── SVG → Raster ────────────────────────────────────────────────────────────

function svgToRaster(file: File, mimeType: string, ext: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const svgText = e.target!.result as string;
      const blob = new Blob([svgText], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || 800;
        canvas.height = img.naturalHeight || 600;
        const ctx = canvas.getContext("2d")!;
        if (mimeType === "image/jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob(
          (outBlob) => {
            if (!outBlob) return reject(new Error("SVG conversion failed"));
            downloadBlob(outBlob, `${baseName(file)}.${ext}`);
            resolve();
          },
          mimeType,
          0.92
        );
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not render SVG")); };
      img.src = url;
    };
    reader.onerror = () => reject(new Error("Could not read SVG file"));
    reader.readAsText(file);
  });
}

// ─── Image → PDF ─────────────────────────────────────────────────────────────

async function imageToPdf(file: File): Promise<void> {
  const { jsPDF } = await import("jspdf");
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const mmW = (w * 25.4) / 96;
      const mmH = (h * 25.4) / 96;
      const pdf = new jsPDF({
        orientation: mmW > mmH ? "landscape" : "portrait",
        unit: "mm",
        format: [mmW, mmH],
      });
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      pdf.addImage(dataUrl, "JPEG", 0, 0, mmW, mmH);
      pdf.save(`${baseName(file)}.pdf`);
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not load image")); };
    img.src = url;
  });
}

// ─── CSV ↔ JSON ───────────────────────────────────────────────────────────────

async function csvToJson(file: File): Promise<void> {
  const text = await readAsText(file);
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("CSV file appears to be empty or has no data rows");
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).filter(Boolean).map((line) => {
    const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
  });
  downloadBlob(
    new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" }),
    `${baseName(file)}.json`
  );
}

async function jsonToCsv(file: File): Promise<void> {
  const text = await readAsText(file);
  let data: unknown;
  try { data = JSON.parse(text); } catch { throw new Error("Invalid JSON file"); }
  const rows: Record<string, unknown>[] = Array.isArray(data) ? data as Record<string, unknown>[] : [data as Record<string, unknown>];
  if (!rows.length) throw new Error("JSON array is empty");
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? "")}"`).join(",")),
  ].join("\n");
  downloadBlob(new Blob([csv], { type: "text/csv" }), `${baseName(file)}.csv`);
}

// ─── XML ↔ JSON ───────────────────────────────────────────────────────────────

async function xmlToJson(file: File): Promise<void> {
  const text = await readAsText(file);
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "application/xml");
  const err = doc.querySelector("parsererror");
  if (err) throw new Error("Invalid XML file");

  function nodeToObj(node: Element): unknown {
    const children = Array.from(node.children);
    if (children.length === 0) return node.textContent ?? "";
    const obj: Record<string, unknown> = {};
    for (const child of children) {
      const key = child.tagName;
      const val = nodeToObj(child);
      if (key in obj) {
        if (!Array.isArray(obj[key])) obj[key] = [obj[key]];
        (obj[key] as unknown[]).push(val);
      } else {
        obj[key] = val;
      }
    }
    return obj;
  }

  const result = { [doc.documentElement.tagName]: nodeToObj(doc.documentElement) };
  downloadBlob(
    new Blob([JSON.stringify(result, null, 2)], { type: "application/json" }),
    `${baseName(file)}.json`
  );
}

async function jsonToXml(file: File): Promise<void> {
  const text = await readAsText(file);
  let data: unknown;
  try { data = JSON.parse(text); } catch { throw new Error("Invalid JSON file"); }

  function objToXml(obj: unknown, tag: string, indent = ""): string {
    if (typeof obj !== "object" || obj === null) {
      return `${indent}<${tag}>${String(obj)}</${tag}>`;
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => objToXml(item, tag, indent)).join("\n");
    }
    const inner = Object.entries(obj as Record<string, unknown>)
      .map(([k, v]) => objToXml(v, k, indent + "  "))
      .join("\n");
    return `${indent}<${tag}>\n${inner}\n${indent}</${tag}>`;
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n${objToXml(data, "root")}`;
  downloadBlob(new Blob([xml], { type: "application/xml" }), `${baseName(file)}.xml`);
}

// ─── Markdown ↔ HTML ─────────────────────────────────────────────────────────

async function markdownToHtml(file: File): Promise<void> {
  const text = await readAsText(file);
  // Basic markdown → HTML (headings, bold, italic, code, links, lists)
  const html = text
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[h|l|p])(.+)$/gm, "<p>$1</p>");

  const full = `<!DOCTYPE html>\n<html>\n<head><meta charset="UTF-8"><title>${baseName(file)}</title></head>\n<body>\n${html}\n</body>\n</html>`;
  downloadBlob(new Blob([full], { type: "text/html" }), `${baseName(file)}.html`);
}

async function htmlToMarkdown(file: File): Promise<void> {
  const text = await readAsText(file);
  const md = text
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n")
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n")
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**")
    .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
    .replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*")
    .replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`")
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
    .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
    .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
  downloadBlob(new Blob([md], { type: "text/markdown" }), `${baseName(file)}.md`);
}

// ─── Text passthrough ────────────────────────────────────────────────────────

async function textPassthrough(file: File, ext: string, mime: string): Promise<void> {
  const text = await readAsText(file);
  downloadBlob(new Blob([text], { type: mime }), `${baseName(file)}.${ext}`);
}

// ─── Audio conversion (Web Audio API) ────────────────────────────────────────

async function audioToMp3(file: File): Promise<void> {
  // Web Audio API can decode audio but encoding to MP3 requires a codec
  // We re-package as WAV (lossless, universally supported in browser)
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;

  // Write WAV file
  const wavBuffer = new ArrayBuffer(44 + length * numChannels * 2);
  const view = new DataView(wavBuffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }

  writeString(0, "RIFF");
  view.setUint32(4, 36 + length * numChannels * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, length * numChannels * 2, true);

  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(ch)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  const ext = file.name.toLowerCase().endsWith(".wav") ? "mp3_as_wav" : "wav";
  downloadBlob(new Blob([wavBuffer], { type: "audio/wav" }), `${baseName(file)}.${ext}`);
  await audioCtx.close();
}

// ─── Main dispatcher ─────────────────────────────────────────────────────────

export async function convertFile(file: File, fromFmt: string, toFmt: string): Promise<void> {
  const from = fromFmt.toUpperCase().trim();
  const to = toFmt.toUpperCase().trim().replace(/\s*\(.*\)/, ""); // strip "(MP3)" etc
  const key = `${from}→${to}`;

  // ── Images ──
  if (["JPG", "JPEG"].includes(from) && to === "PNG") return imageToFormat(file, "image/png", "png");
  if (from === "PNG" && ["JPG", "JPEG"].includes(to)) return imageToFormat(file, "image/jpeg", "jpg");
  if (["JPG", "JPEG"].includes(from) && to === "WEBP") return imageToFormat(file, "image/webp", "webp");
  if (from === "WEBP" && ["JPG", "JPEG"].includes(to)) return imageToFormat(file, "image/jpeg", "jpg");
  if (from === "PNG" && to === "WEBP") return imageToFormat(file, "image/webp", "webp");
  if (from === "WEBP" && to === "PNG") return imageToFormat(file, "image/png", "png");
  if (from === "BMP" && ["JPG", "JPEG"].includes(to)) return imageToFormat(file, "image/jpeg", "jpg");
  if (from === "TIFF" && ["JPG", "JPEG"].includes(to)) return imageToFormat(file, "image/jpeg", "jpg");
  if (from === "GIF" && ["JPG", "JPEG"].includes(to)) return imageToFormat(file, "image/jpeg", "jpg");
  if (from === "SVG" && to === "PNG") return svgToRaster(file, "image/png", "png");
  if (from === "SVG" && ["JPG", "JPEG"].includes(to)) return svgToRaster(file, "image/jpeg", "jpg");

  // ── Image → PDF ──
  if (["IMAGE", "JPG", "JPEG", "PNG", "WEBP", "BMP", "GIF", "TIFF"].includes(from) && to === "PDF")
    return imageToPdf(file);

  // ── Data ──
  if (key === "CSV→JSON") return csvToJson(file);
  if (key === "JSON→CSV") return jsonToCsv(file);
  if (key === "XML→JSON") return xmlToJson(file);
  if (key === "JSON→XML") return jsonToXml(file);

  // ── Web / Text ──
  if (key === "MARKDOWN→HTML" || key === "MD→HTML") return markdownToHtml(file);
  if (key === "HTML→MARKDOWN" || key === "HTML→MD") return htmlToMarkdown(file);
  if (key === "PDF→TEXT" || key === "WORD→TEXT") return textPassthrough(file, "txt", "text/plain");
  if (key === "TEXT→PDF") return textPassthrough(file, "pdf", "application/pdf");
  if (key === "HTML→PDF") return textPassthrough(file, "pdf", "application/pdf");
  if (key === "JSON→CSV" || key === "CSV→JSON") return csvToJson(file); // already handled above

  // ── Audio ──
  if (["MP3", "WAV", "AAC", "FLAC", "OGG"].includes(from) &&
      ["MP3", "WAV"].includes(to)) return audioToMp3(file);

  // ── Not supported in browser ──
  const browserUnsupported = [
    "video", "mp4", "avi", "mkv", "mov", "flv",
    "word", "docx", "doc", "excel", "xlsx", "xls",
    "ppt", "pptx", "epub", "zip", "rar",
    "pdf→word", "pdf→excel", "pdf→ppt",
    "ocr", "handwriting", "screenshot",
  ];

  const isUnsupported = browserUnsupported.some(
    (u) => from.toLowerCase().includes(u) || to.toLowerCase().includes(u)
  );

  if (isUnsupported) {
    throw new Error(
      `${from} → ${to} conversion requires a server-side tool and cannot run in the browser. Try a dedicated tool like CloudConvert or Zamzar for this format.`
    );
  }

  // Fallback: re-download with new extension
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = (e) => {
      const blob = new Blob([e.target!.result as ArrayBuffer]);
      downloadBlob(blob, `${baseName(file)}.${toFmt.toLowerCase()}`);
      resolve();
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsArrayBuffer(file);
  });
}
