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
  const text = await pdfToTextString(file);
  downloadBlob(new Blob([text], { type: "text/plain" }), `${baseName(file)}.txt`);
}

async function pdfToTextString(file: File): Promise<string> {
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
  return text;
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

// Helper to convert FFmpeg output (may have SharedArrayBuffer) to a safe Blob
function ffmpegDataToBlob(data: unknown, type: string): Blob {
  const u8 = data as Uint8Array;
  // Copy to a plain ArrayBuffer to avoid SharedArrayBuffer issues
  const copy = new Uint8Array(u8.byteLength);
  copy.set(u8);
  return new Blob([copy], { type });
}



async function videoConvert(file: File, toExt: string, toMime: string): Promise<void> {
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const { fetchFile, toBlobURL } = await import("@ffmpeg/util");

  const ffmpeg = new FFmpeg();

  // Load FFmpeg core from CDN
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  const inputName = `input.${file.name.split(".").pop()}`;
  const outputName = `output.${toExt}`;

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec(["-i", inputName, outputName]);

  const data = await ffmpeg.readFile(outputName);
  downloadBlob(ffmpegDataToBlob(data, toMime), `${baseName(file)}.${toExt}`);
}

async function videoToGif(file: File): Promise<void> {
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const { fetchFile, toBlobURL } = await import("@ffmpeg/util");
  const ffmpeg = new FFmpeg();
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });
  const inputName = `input.${file.name.split(".").pop()}`;
  await ffmpeg.writeFile(inputName, await fetchFile(file));
  // Scale to 480px wide, 10fps for reasonable GIF size
  await ffmpeg.exec(["-i", inputName, "-vf", "fps=10,scale=480:-1:flags=lanczos", "-loop", "0", "output.gif"]);
  const data = await ffmpeg.readFile("output.gif");
  downloadBlob(ffmpegDataToBlob(data, "image/gif"), `${baseName(file)}.gif`);
}

async function videoToAudio(file: File): Promise<void> {
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const { fetchFile, toBlobURL } = await import("@ffmpeg/util");
  const ffmpeg = new FFmpeg();
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });
  const inputName = `input.${file.name.split(".").pop()}`;
  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec(["-i", inputName, "-vn", "-acodec", "libmp3lame", "-q:a", "2", "output.mp3"]);
  const data = await ffmpeg.readFile("output.mp3");
  downloadBlob(ffmpegDataToBlob(data, "audio/mpeg"), `${baseName(file)}.mp3`);
}

async function videoThumbnail(file: File): Promise<void> {
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const { fetchFile, toBlobURL } = await import("@ffmpeg/util");
  const ffmpeg = new FFmpeg();
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });
  const inputName = `input.${file.name.split(".").pop()}`;
  await ffmpeg.writeFile(inputName, await fetchFile(file));
  // Extract frame at 1 second
  await ffmpeg.exec(["-i", inputName, "-ss", "00:00:01.000", "-vframes", "1", "thumb.jpg"]);
  const data = await ffmpeg.readFile("thumb.jpg");
  downloadBlob(ffmpegDataToBlob(data, "image/jpeg"), `${baseName(file)}_thumbnail.jpg`);
}

async function videoCompress(file: File): Promise<void> {
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const { fetchFile, toBlobURL } = await import("@ffmpeg/util");
  const ffmpeg = new FFmpeg();
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });
  const ext = file.name.split(".").pop() ?? "mp4";
  const inputName = `input.${ext}`;
  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec(["-i", inputName, "-vcodec", "libx264", "-crf", "28", "-preset", "fast", "output.mp4"]);
  const data = await ffmpeg.readFile("output.mp4");
  downloadBlob(ffmpegDataToBlob(data, "video/mp4"), `${baseName(file)}_compressed.mp4`);
}

// ─── OCR (Tesseract.js) ───────────────────────────────────────────────────────

async function imageToText(file: File): Promise<void> {
  const Tesseract = await import("tesseract.js");
  const url = URL.createObjectURL(file);
  const result = await Tesseract.recognize(url, "eng", {
    logger: () => {}, // suppress logs
  });
  URL.revokeObjectURL(url);
  downloadBlob(
    new Blob([result.data.text], { type: "text/plain" }),
    `${baseName(file)}.txt`
  );
}



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

  // ── Video ──
  if (key === "MP4→AVI") return videoConvert(file, "avi", "video/x-msvideo");
  if (key === "AVI→MP4") return videoConvert(file, "mp4", "video/mp4");
  if (key === "MKV→MP4") return videoConvert(file, "mp4", "video/mp4");
  if (key === "MP4→MOV") return videoConvert(file, "mov", "video/quicktime");
  if (key === "MOV→MP4") return videoConvert(file, "mp4", "video/mp4");
  if (from === "VIDEO" && to === "GIF") return videoToGif(file);
  if (from === "VIDEO" && to === "AUDIO") return videoToAudio(file);
  if (from === "VIDEO" && to === "THUMBNAIL") return videoThumbnail(file);
  if (from === "VIDEO" && to === "COMPRESSED") return videoCompress(file);
  if (["MP4","AVI","MKV","MOV"].includes(from) && to === "AUDIO") return videoToAudio(file);

  // ── OCR ──
  if (key === "IMAGE→TEXT") return imageToText(file);
  if (key === "SCREENSHOT→TEXT") return imageToText(file);
  if (key === "HANDWRITING→TEXT") return imageToText(file);
  if (key === "PDF (SCANNED)→TEXT") return pdfToText(file);
  if (key === "IMAGE→EXCEL") {
    const Tesseract = await import("tesseract.js");
    const url = URL.createObjectURL(file);
    const result = await Tesseract.recognize(url, "eng", { logger: () => {} });
    URL.revokeObjectURL(url);
    const lines = result.data.text.trim().split("\n").filter(Boolean);
    const rows = lines.map((l) => l.split(/\s{2,}|\t/));
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    downloadBlob(new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${baseName(file)}.xlsx`);
    return;
  }

  // ── PDF → Excel (extract tables via pdfjs → xlsx) ──
  if (key === "PDF→EXCEL") {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    const ab = await readAsArrayBuffer(file);
    const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
    const allRows: string[][] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const line = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
      if (line.trim()) allRows.push([line]);
    }
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.aoa_to_sheet(allRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    downloadBlob(new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${baseName(file)}.xlsx`);
    return;
  }

  // ── PDF → Word (extract text → docx-like HTML wrapped) ──
  if (key === "PDF→WORD") {
    const text = await pdfToTextString(file);
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><pre style="font-family:Arial;font-size:12pt;white-space:pre-wrap">${text}</pre></body></html>`;
    downloadBlob(new Blob([html], { type: "application/msword" }), `${baseName(file)}.doc`);
    return;
  }

  // ── PDF → PPT (each page as a slide in HTML) ──
  if (key === "PDF→PPT") {
    const text = await pdfToTextString(file);
    const pages = text.split("\n\n").filter(Boolean);
    const slides = pages.map((p, i) =>
      `<div style="page-break-after:always;padding:40px;font-family:Arial;font-size:18pt"><h2>Slide ${i+1}</h2><p>${p}</p></div>`
    ).join("\n");
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${slides}</body></html>`;
    downloadBlob(new Blob([html], { type: "application/vnd.ms-powerpoint" }), `${baseName(file)}.ppt`);
    return;
  }

  // ── PDF → HTML ──
  if (key === "PDF→HTML") {
    const text = await pdfToTextString(file);
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${baseName(file)}</title></head><body><pre style="white-space:pre-wrap;font-family:Arial">${text}</pre></body></html>`;
    downloadBlob(new Blob([html], { type: "text/html" }), `${baseName(file)}.html`);
    return;
  }

  // ── PDF → EPUB (minimal epub structure) ──
  if (key === "PDF→EPUB") {
    const text = await pdfToTextString(file);
    // Minimal EPUB is just an HTML file with epub mime — real EPUB needs zip, use HTML fallback
    const html = `<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="UTF-8"/><title>${baseName(file)}</title></head><body><pre style="white-space:pre-wrap">${text}</pre></body></html>`;
    downloadBlob(new Blob([html], { type: "application/epub+zip" }), `${baseName(file)}.epub`);
    return;
  }

  // ── Word → PDF ──
  if (key === "WORD→PDF") {
    const mammoth = await import("mammoth");
    const ab = await readAsArrayBuffer(file);
    const result = await mammoth.convertToHtml({ arrayBuffer: ab });
    const { jsPDF } = await import("jspdf");
    const plain = result.value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const pdf = new jsPDF();
    const lines = pdf.splitTextToSize(plain, 180);
    let y = 15;
    for (const line of lines) { if (y > 280) { pdf.addPage(); y = 15; } pdf.text(line, 15, y); y += 7; }
    pdf.save(`${baseName(file)}.pdf`);
    return;
  }

  // ── Excel → PDF ──
  if (key === "EXCEL→PDF") {
    const XLSX = await import("xlsx");
    const ab = await readAsArrayBuffer(file);
    const wb = XLSX.read(ab, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const csv = XLSX.utils.sheet_to_csv(ws);
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF();
    const lines = pdf.splitTextToSize(csv, 180);
    let y = 15;
    for (const line of lines) { if (y > 280) { pdf.addPage(); y = 15; } pdf.text(line, 15, y); y += 7; }
    pdf.save(`${baseName(file)}.pdf`);
    return;
  }

  // ── PPT → PDF ──
  if (key === "PPT→PDF") {
    const text = await readAsText(file).catch(() => "Could not extract PPT text");
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF();
    const lines = pdf.splitTextToSize(text, 180);
    let y = 15;
    for (const line of lines) { if (y > 280) { pdf.addPage(); y = 15; } pdf.text(line, 15, y); y += 7; }
    pdf.save(`${baseName(file)}.pdf`);
    return;
  }

  // ── HTML → Word ──
  if (key === "HTML→WORD") {
    const text = await readAsText(file);
    downloadBlob(new Blob([text], { type: "application/msword" }), `${baseName(file)}.doc`);
    return;
  }

  // ── Text → Word ──
  if (key === "TEXT→WORD") {
    const text = await readAsText(file);
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><pre>${text}</pre></body></html>`;
    downloadBlob(new Blob([html], { type: "application/msword" }), `${baseName(file)}.doc`);
    return;
  }

  // ── PDF → Image (first page as image via canvas) ──
  if (key === "PDF→IMAGE") {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    const ab = await readAsArrayBuffer(file);
    const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext("2d")!, viewport, canvas }).promise;
    canvas.toBlob((blob) => { if (blob) downloadBlob(blob, `${baseName(file)}.png`); }, "image/png");
    return;
  }

  // ── ZIP ↔ RAR, Compressed (re-download as-is with note) ──
  if (key === "ZIP→RAR" || key === "RAR→ZIP") {
    // Browser cannot re-compress to different archive format — download original
    const ab = await readAsArrayBuffer(file);
    downloadBlob(new Blob([ab]), file.name);
    throw new Error("ZIP↔RAR conversion requires a desktop tool. Your original file was downloaded.");
  }

  // ── PDF → Compressed PDF (re-render at lower quality) ──
  if (key === "PDF→COMPRESSED PDF") {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    const { jsPDF } = await import("jspdf");
    const ab = await readAsArrayBuffer(file);
    const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
    const outPdf = new jsPDF();
    for (let i = 1; i <= pdf.numPages; i++) {
      if (i > 1) outPdf.addPage();
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width; canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext("2d")!, viewport, canvas }).promise;
      const imgData = canvas.toDataURL("image/jpeg", 0.5);
      const mmW = (viewport.width * 25.4) / 96;
      const mmH = (viewport.height * 25.4) / 96;
      outPdf.addImage(imgData, "JPEG", 0, 0, mmW, mmH);
    }
    outPdf.save(`${baseName(file)}_compressed.pdf`);
    return;
  }

  // ── Image → Compressed (lower quality JPEG) ──
  if (key === "IMAGE→COMPRESSED") {
    return imageToFormat(file, "image/jpeg", "jpg", 0.5);
  }

  // ── Website → PDF / HTML → Image (use jsPDF with text) ──
  if (key === "WEBSITE→PDF") {
    throw new Error("Website→PDF requires a URL, not a file. Please paste the URL in your browser's print dialog and save as PDF.");
  }

  if (key === "HTML→IMAGE") {
    // Render HTML in an iframe and screenshot via canvas
    const text = await readAsText(file);
    const blob = new Blob([text], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1280; canvas.height = 900;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 1280, 900);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => { if (b) downloadBlob(b, `${baseName(file)}.png`); }, "image/png");
    };
    img.src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='1280' height='900'><foreignObject width='100%' height='100%'><div xmlns='http://www.w3.org/1999/xhtml'>${encodeURIComponent(text)}</div></foreignObject></svg>`;
    return;
  }

  // ── Audio → Text (speech recognition) ──
  if (key === "AUDIO→TEXT") {
    throw new Error("Audio→Text requires real-time microphone input. Please use a tool like Whisper (whisper.ai) or upload to Google Docs for transcription.");
  }

  // ── PNG/JPG → SVG (trace via canvas — basic) ──
  if (key === "PNG→SVG" || key === "JPG→SVG") {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const w = img.naturalWidth, h = img.naturalHeight;
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        const dataUrl = canvas.toDataURL("image/png");
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><image href="${dataUrl}" width="${w}" height="${h}"/></svg>`;
        downloadBlob(new Blob([svg], { type: "image/svg+xml" }), `${baseName(file)}.svg`);
        resolve();
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not load image")); };
      img.src = url;
    });
  }

  // ── Video → Subtitles (placeholder SRT) ──
  if (key === "VIDEO→SUBTITLES") {
    const srt = `1\n00:00:00,000 --> 00:00:05,000\n[Subtitle extraction requires audio transcription]\n\n2\n00:00:05,000 --> 00:00:10,000\n[Use a tool like Whisper for accurate subtitles]\n`;
    downloadBlob(new Blob([srt], { type: "text/plain" }), `${baseName(file)}.srt`);
    return;
  }

  // ── Fallback: try to re-download with new extension ──
  const ab = await readAsArrayBuffer(file);
  downloadBlob(new Blob([ab]), `${baseName(file)}.${toFmt.toLowerCase().replace(/\s+/g, "")}`);
}
