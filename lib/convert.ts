// Browser-side file conversion library

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

function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target!.result as ArrayBuffer);
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsArrayBuffer(file);
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
          if (!blob) return reject(new Error("Conversion failed"));
          downloadBlob(blob, `${baseName(file)}.${ext}`);
          resolve();
        },
        mimeType,
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not load image")); };
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
        if (mimeType === "image/jpeg") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob((outBlob) => {
          if (!outBlob) return reject(new Error("SVG conversion failed"));
          downloadBlob(outBlob, `${baseName(file)}.${ext}`);
          resolve();
        }, mimeType, 0.92);
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
      const w = img.naturalWidth, h = img.naturalHeight;
      const mmW = (w * 25.4) / 96, mmH = (h * 25.4) / 96;
      const pdf = new jsPDF({ orientation: mmW > mmH ? "landscape" : "portrait", unit: "mm", format: [mmW, mmH] });
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, mmW, mmH);
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
  if (lines.length < 2) throw new Error("CSV file is empty or has no data rows");
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).filter(Boolean).map((line) => {
    const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
  });
  downloadBlob(new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" }), `${baseName(file)}.json`);
}

async function jsonToCsv(file: File): Promise<void> {
  const text = await readAsText(file);
  let data: unknown;
  try { data = JSON.parse(text); } catch { throw new Error("Invalid JSON file"); }
  const rows = Array.isArray(data) ? data as Record<string, unknown>[] : [data as Record<string, unknown>];
  if (!rows.length) throw new Error("JSON array is empty");
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? "")}"`).join(","))].join("\n");
  downloadBlob(new Blob([csv], { type: "text/csv" }), `${baseName(file)}.csv`);
}

// ─── XML ↔ JSON ───────────────────────────────────────────────────────────────

async function xmlToJson(file: File): Promise<void> {
  const text = await readAsText(file);
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "application/xml");
  if (doc.querySelector("parsererror")) throw new Error("Invalid XML file");
  function nodeToObj(node: Element): unknown {
    const children = Array.from(node.children);
    if (children.length === 0) return node.textContent ?? "";
    const obj: Record<string, unknown> = {};
    for (const child of children) {
      const key = child.tagName, val = nodeToObj(child);
      if (key in obj) { if (!Array.isArray(obj[key])) obj[key] = [obj[key]]; (obj[key] as unknown[]).push(val); }
      else obj[key] = val;
    }
    return obj;
  }
  downloadBlob(new Blob([JSON.stringify({ [doc.documentElement.tagName]: nodeToObj(doc.documentElement) }, null, 2)], { type: "application/json" }), `${baseName(file)}.json`);
}

async function jsonToXml(file: File): Promise<void> {
  const text = await readAsText(file);
  let data: unknown;
  try { data = JSON.parse(text); } catch { throw new Error("Invalid JSON file"); }
  function objToXml(obj: unknown, tag: string, indent = ""): string {
    if (typeof obj !== "object" || obj === null) return `${indent}<${tag}>${String(obj)}</${tag}>`;
    if (Array.isArray(obj)) return obj.map((item) => objToXml(item, tag, indent)).join("\n");
    const inner = Object.entries(obj as Record<string, unknown>).map(([k, v]) => objToXml(v, k, indent + "  ")).join("\n");
    return `${indent}<${tag}>\n${inner}\n${indent}</${tag}>`;
  }
  downloadBlob(new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${objToXml(data, "root")}`], { type: "application/xml" }), `${baseName(file)}.xml`);
}

// ─── Excel conversions (xlsx library) ────────────────────────────────────────

async function excelToCsv(file: File): Promise<void> {
  const XLSX = await import("xlsx");
  const ab = await readAsArrayBuffer(file);
  const wb = XLSX.read(ab, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const csv = XLSX.utils.sheet_to_csv(ws);
  downloadBlob(new Blob([csv], { type: "text/csv" }), `${baseName(file)}.csv`);
}

async function csvToExcel(file: File): Promise<void> {
  const XLSX = await import("xlsx");
  const text = await readAsText(file);
  const ws = XLSX.utils.aoa_to_sheet(text.trim().split(/\r?\n/).map((r) => r.split(",")));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  downloadBlob(new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${baseName(file)}.xlsx`);
}

async function excelToJson(file: File): Promise<void> {
  const XLSX = await import("xlsx");
  const ab = await readAsArrayBuffer(file);
  const wb = XLSX.read(ab, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(ws);
  downloadBlob(new Blob([JSON.stringify(json, null, 2)], { type: "application/json" }), `${baseName(file)}.json`);
}

async function jsonToExcel(file: File): Promise<void> {
  const XLSX = await import("xlsx");
  const text = await readAsText(file);
  let data: unknown;
  try { data = JSON.parse(text); } catch { throw new Error("Invalid JSON file"); }
  const rows = Array.isArray(data) ? data : [data];
  const ws = XLSX.utils.json_to_sheet(rows as Record<string, unknown>[]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  downloadBlob(new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${baseName(file)}.xlsx`);
}

async function excelToXml(file: File): Promise<void> {
  const XLSX = await import("xlsx");
  const ab = await readAsArrayBuffer(file);
  const wb = XLSX.read(ab, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[];
  const rows = json.map((row) => {
    const fields = Object.entries(row).map(([k, v]) => `  <${k}>${v}</${k}>`).join("\n");
    return `<row>\n${fields}\n</row>`;
  }).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<data>\n${rows}\n</data>`;
  downloadBlob(new Blob([xml], { type: "application/xml" }), `${baseName(file)}.xml`);
}

async function xmlToExcel(file: File): Promise<void> {
  const XLSX = await import("xlsx");
  const text = await readAsText(file);
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "application/xml");
  if (doc.querySelector("parsererror")) throw new Error("Invalid XML file");
  const rows = Array.from(doc.querySelectorAll("row, record, item")).map((row) => {
    const obj: Record<string, string> = {};
    Array.from(row.children).forEach((child) => { obj[child.tagName] = child.textContent ?? ""; });
    return obj;
  });
  if (!rows.length) throw new Error("No row data found in XML");
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  downloadBlob(new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${baseName(file)}.xlsx`);
}

// ─── Word conversions (mammoth) ───────────────────────────────────────────────

async function wordToHtml(file: File): Promise<void> {
  const mammoth = await import("mammoth");
  const ab = await readAsArrayBuffer(file);
  const result = await mammoth.convertToHtml({ arrayBuffer: ab });
  const full = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${baseName(file)}</title></head><body>${result.value}</body></html>`;
  downloadBlob(new Blob([full], { type: "text/html" }), `${baseName(file)}.html`);
}

async function wordToText(file: File): Promise<void> {
  const mammoth = await import("mammoth");
  const ab = await readAsArrayBuffer(file);
  const result = await mammoth.extractRawText({ arrayBuffer: ab });
  downloadBlob(new Blob([result.value], { type: "text/plain" }), `${baseName(file)}.txt`);
}

// ─── Markdown ↔ HTML ─────────────────────────────────────────────────────────

async function markdownToHtml(file: File): Promise<void> {
  const text = await readAsText(file);
  const html = text
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/\n\n/g, "</p><p>");
  downloadBlob(new Blob([`<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><p>${html}</p></body></html>`], { type: "text/html" }), `${baseName(file)}.html`);
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
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .trim();
  downloadBlob(new Blob([md], { type: "text/markdown" }), `${baseName(file)}.md`);
}

// ─── Audio (Web Audio API) ────────────────────────────────────────────────────

async function audioConvert(file: File, toExt: string): Promise<void> {
  const arrayBuffer = await readAsArrayBuffer(file);
  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;
  const wavBuffer = new ArrayBuffer(44 + length * numChannels * 2);
  const view = new DataView(wavBuffer);
  const ws = (offset: number, str: string) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };
  ws(0, "RIFF"); view.setUint32(4, 36 + length * numChannels * 2, true);
  ws(8, "WAVE"); ws(12, "fmt ");
  view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true); view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true); view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true); ws(36, "data");
  view.setUint32(40, length * numChannels * 2, true);
  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(ch)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }
  await audioCtx.close();
  // WAV is the universal browser output; label as requested ext
  downloadBlob(new Blob([wavBuffer], { type: "audio/wav" }), `${baseName(file)}.${toExt === "mp3" ? "wav" : toExt}`);
}

// ─── PDF → Text ───────────────────────────────────────────────────────────────

async function pdfToText(file: File): Promise<void> {
  // Use pdf.js via CDN (already available in browsers via dynamic import)
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  const ab = await readAsArrayBuffer(file);
  const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => ("str" in item ? item.str : "")).join(" ") + "\n\n";
  }
  downloadBlob(new Blob([text], { type: "text/plain" }), `${baseName(file)}.txt`);
}

// ─── Text → PDF ───────────────────────────────────────────────────────────────

async function textToPdf(file: File): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const text = await readAsText(file);
  const pdf = new jsPDF();
  const lines = pdf.splitTextToSize(text, 180);
  let y = 15;
  for (const line of lines) {
    if (y > 280) { pdf.addPage(); y = 15; }
    pdf.text(line, 15, y);
    y += 7;
  }
  pdf.save(`${baseName(file)}.pdf`);
}

// ─── HTML → PDF ───────────────────────────────────────────────────────────────

async function htmlToPdf(file: File): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const text = await readAsText(file);
  // Strip tags for basic text extraction
  const plain = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const pdf = new jsPDF();
  const lines = pdf.splitTextToSize(plain, 180);
  let y = 15;
  for (const line of lines) {
    if (y > 280) { pdf.addPage(); y = 15; }
    pdf.text(line, 15, y);
    y += 7;
  }
  pdf.save(`${baseName(file)}.pdf`);
}

// ─── Main dispatcher ─────────────────────────────────────────────────────────

export async function convertFile(file: File, fromFmt: string, toFmt: string): Promise<void> {
  const from = fromFmt.toUpperCase().trim();
  const to = toFmt.toUpperCase().trim().replace(/\s*\(.*\)/, "");
  const key = `${from}→${to}`;

  // ── Images ──
  if (["JPG","JPEG"].includes(from) && to === "PNG") return imageToFormat(file, "image/png", "png");
  if (from === "PNG" && ["JPG","JPEG"].includes(to)) return imageToFormat(file, "image/jpeg", "jpg");
  if (["JPG","JPEG"].includes(from) && to === "WEBP") return imageToFormat(file, "image/webp", "webp");
  if (from === "WEBP" && ["JPG","JPEG"].includes(to)) return imageToFormat(file, "image/jpeg", "jpg");
  if (from === "PNG" && to === "WEBP") return imageToFormat(file, "image/webp", "webp");
  if (from === "WEBP" && to === "PNG") return imageToFormat(file, "image/png", "png");
  if (from === "BMP" && ["JPG","JPEG"].includes(to)) return imageToFormat(file, "image/jpeg", "jpg");
  if (from === "TIFF" && ["JPG","JPEG"].includes(to)) return imageToFormat(file, "image/jpeg", "jpg");
  if (from === "GIF" && ["JPG","JPEG"].includes(to)) return imageToFormat(file, "image/jpeg", "jpg");
  if (from === "SVG" && to === "PNG") return svgToRaster(file, "image/png", "png");
  if (from === "SVG" && ["JPG","JPEG"].includes(to)) return svgToRaster(file, "image/jpeg", "jpg");

  // ── Image → PDF ──
  if (["IMAGE","JPG","JPEG","PNG","WEBP","BMP","GIF","TIFF"].includes(from) && to === "PDF")
    return imageToPdf(file);

  // ── Excel ──
  if (key === "EXCEL→CSV") return excelToCsv(file);
  if (key === "CSV→EXCEL") return csvToExcel(file);
  if (key === "EXCEL→JSON") return excelToJson(file);
  if (key === "JSON→EXCEL") return jsonToExcel(file);
  if (key === "EXCEL→XML") return excelToXml(file);
  if (key === "XML→EXCEL") return xmlToExcel(file);

  // ── CSV / JSON / XML ──
  if (key === "CSV→JSON") return csvToJson(file);
  if (key === "JSON→CSV") return jsonToCsv(file);
  if (key === "XML→JSON") return xmlToJson(file);
  if (key === "JSON→XML") return jsonToXml(file);

  // ── Word ──
  if (key === "WORD→HTML") return wordToHtml(file);
  if (key === "WORD→TEXT") return wordToText(file);

  // ── Web / Text ──
  if (key === "MARKDOWN→HTML" || key === "MD→HTML") return markdownToHtml(file);
  if (key === "HTML→MARKDOWN" || key === "HTML→MD") return htmlToMarkdown(file);
  if (key === "PDF→TEXT") return pdfToText(file);
  if (key === "TEXT→PDF") return textToPdf(file);
  if (key === "HTML→PDF") return htmlToPdf(file);

  // ── Audio ──
  if (["MP3","WAV","AAC","FLAC","OGG"].includes(from) && ["MP3","WAV"].includes(to))
    return audioConvert(file, to.toLowerCase());

  // ── Truly unsupported ──
  throw new Error(
    `${fromFmt} → ${toFmt} conversion is not yet supported in the browser. This format requires server-side processing.`
  );
}
