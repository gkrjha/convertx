export type Category = "document" | "data" | "image" | "ocr" | "video" | "audio" | "web" | "file";

export interface Converter {
  id: number;
  from: string;
  to: string;
  category: Category;
  icon: string;
  popular?: boolean;
}

export const categories: { key: Category; label: string; emoji: string; color: string }[] = [
  { key: "document", label: "Document", emoji: "🧾", color: "from-blue-500 to-indigo-600" },
  { key: "data", label: "Data / Sheet", emoji: "📊", color: "from-emerald-500 to-teal-600" },
  { key: "image", label: "Image", emoji: "🖼️", color: "from-pink-500 to-rose-600" },
  { key: "ocr", label: "OCR / Text", emoji: "🧠", color: "from-violet-500 to-purple-600" },
  { key: "video", label: "Video", emoji: "🎥", color: "from-orange-500 to-red-600" },
  { key: "audio", label: "Audio", emoji: "🎧", color: "from-cyan-500 to-sky-600" },
  { key: "web", label: "Web / Dev", emoji: "🌐", color: "from-lime-500 to-green-600" },
  { key: "file", label: "File / Extra", emoji: "🧱", color: "from-amber-500 to-yellow-600" },
];

export const converters: Converter[] = [
  // Document (1-15)
  { id: 1, from: "PDF", to: "Word", category: "document", icon: "📄" },
  { id: 2, from: "Word", to: "PDF", category: "document", icon: "📝" },
  { id: 3, from: "PDF", to: "Excel", category: "document", icon: "📊" },
  { id: 4, from: "Excel", to: "PDF", category: "document", icon: "📋" },
  { id: 5, from: "PDF", to: "PPT", category: "document", icon: "📑" },
  { id: 6, from: "PPT", to: "PDF", category: "document", icon: "🗂️" },
  { id: 7, from: "PDF", to: "Text", category: "document", icon: "📃" },
  { id: 8, from: "Text", to: "PDF", category: "document", icon: "🖊️" },
  { id: 9, from: "Word", to: "Text", category: "document", icon: "📝", popular: true },
  { id: 10, from: "Text", to: "Word", category: "document", icon: "✍️" },
  { id: 11, from: "PDF", to: "HTML", category: "document", icon: "🌐" },
  { id: 12, from: "HTML", to: "PDF", category: "document", icon: "📄", popular: true },
  { id: 13, from: "Word", to: "HTML", category: "document", icon: "🔤", popular: true },
  { id: 14, from: "HTML", to: "Word", category: "document", icon: "📝" },
  { id: 15, from: "PDF", to: "EPUB", category: "document", icon: "📚" },
  // Data (16-25)
  { id: 16, from: "Excel", to: "CSV", category: "data", icon: "📊", popular: true },
  { id: 17, from: "CSV", to: "Excel", category: "data", icon: "📈", popular: true },
  { id: 18, from: "Excel", to: "JSON", category: "data", icon: "🗃️", popular: true },
  { id: 19, from: "JSON", to: "Excel", category: "data", icon: "📋" },
  { id: 20, from: "CSV", to: "JSON", category: "data", icon: "🔄", popular: true },
  { id: 21, from: "JSON", to: "CSV", category: "data", icon: "📤", popular: true },
  { id: 22, from: "XML", to: "JSON", category: "data", icon: "🔀", popular: true },
  { id: 23, from: "JSON", to: "XML", category: "data", icon: "📦" },
  { id: 24, from: "Excel", to: "XML", category: "data", icon: "🗂️" },
  { id: 25, from: "XML", to: "Excel", category: "data", icon: "📊" },
  // Image (26-40)
  { id: 26, from: "JPG", to: "PNG", category: "image", icon: "🖼️", popular: true },
  { id: 27, from: "PNG", to: "JPG", category: "image", icon: "🖼️", popular: true },
  { id: 28, from: "JPG", to: "WebP", category: "image", icon: "🌄" },
  { id: 29, from: "WebP", to: "JPG", category: "image", icon: "🌅" },
  { id: 30, from: "PNG", to: "WebP", category: "image", icon: "🏞️" },
  { id: 31, from: "WebP", to: "PNG", category: "image", icon: "🖼️" },
  { id: 32, from: "Image", to: "PDF", category: "image", icon: "📄", popular: true },
  { id: 33, from: "PDF", to: "Image", category: "image", icon: "🖼️" },  { id: 34, from: "SVG", to: "PNG", category: "image", icon: "✏️" },
  { id: 35, from: "SVG", to: "JPG", category: "image", icon: "🎨" },
  { id: 36, from: "PNG", to: "SVG", category: "image", icon: "🔷" },
  { id: 37, from: "JPG", to: "SVG", category: "image", icon: "🔶" },
  { id: 38, from: "BMP", to: "JPG", category: "image", icon: "🖼️" },
  { id: 39, from: "TIFF", to: "JPG", category: "image", icon: "📷" },
  { id: 40, from: "GIF", to: "JPG", category: "image", icon: "🎞️" },
  // OCR (41-45)
  { id: 41, from: "Image", to: "Text", category: "ocr", icon: "🔍" },
  { id: 42, from: "PDF (scanned)", to: "Text", category: "ocr", icon: "📄" },
  { id: 43, from: "Handwriting", to: "Text", category: "ocr", icon: "✍️" },
  { id: 44, from: "Image", to: "Excel", category: "ocr", icon: "📊" },
  { id: 45, from: "Screenshot", to: "Text", category: "ocr", icon: "📸" },
  // Video (46-55)
  { id: 46, from: "MP4", to: "AVI", category: "video", icon: "🎬" },
  { id: 47, from: "AVI", to: "MP4", category: "video", icon: "🎥" },
  { id: 48, from: "MKV", to: "MP4", category: "video", icon: "📹" },
  { id: 49, from: "MP4", to: "MOV", category: "video", icon: "🎞️" },
  { id: 50, from: "MOV", to: "MP4", category: "video", icon: "🎬" },
  { id: 51, from: "Video", to: "GIF", category: "video", icon: "🎭" },
  { id: 52, from: "Video", to: "Audio (MP3)", category: "video", icon: "🎵" },
  { id: 53, from: "Video", to: "Subtitles", category: "video", icon: "💬" },
  { id: 54, from: "Video", to: "Compressed", category: "video", icon: "🗜️" },
  { id: 55, from: "Video", to: "Thumbnail", category: "video", icon: "🖼️" },
  // Audio (56-60)
  { id: 56, from: "MP3", to: "WAV", category: "audio", icon: "🎵", popular: true },
  { id: 57, from: "WAV", to: "MP3", category: "audio", icon: "🎶", popular: true },
  { id: 58, from: "AAC", to: "MP3", category: "audio", icon: "🎧", popular: true },
  { id: 59, from: "FLAC", to: "MP3", category: "audio", icon: "🎼" },
  { id: 60, from: "Audio", to: "Text", category: "audio", icon: "📝" },
  // Web (61-65)
  { id: 61, from: "HTML", to: "Image", category: "web", icon: "🌐" },
  { id: 62, from: "Website", to: "PDF", category: "web", icon: "📄" },
  { id: 63, from: "Markdown", to: "HTML", category: "web", icon: "📝", popular: true },
  { id: 64, from: "HTML", to: "Markdown", category: "web", icon: "🔤", popular: true },
  { id: 65, from: "JSON", to: "CSV", category: "web", icon: "📊", popular: true },
  // File (66-70)
  { id: 66, from: "ZIP", to: "RAR", category: "file", icon: "🗜️" },
  { id: 67, from: "RAR", to: "ZIP", category: "file", icon: "📦" },
  { id: 68, from: "PDF", to: "Compressed PDF", category: "file", icon: "📄" },
  { id: 69, from: "Image", to: "Compressed", category: "file", icon: "🖼️" },
  { id: 70, from: "Video", to: "Compressed", category: "file", icon: "🎥" },
];
