import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { converters, categories } from "@/lib/converters";
import ConverterPageClient from "./ConverterPageClient";

interface Props {
  params: Promise<{ from: string; to: string }>;
}

function findConverter(from: string, to: string) {
  return converters.find(
    (c) =>
      c.from.toLowerCase().replace(/\s+/g, "-") === from &&
      c.to.toLowerCase().replace(/\s+/g, "-") === to
  );
}

export async function generateStaticParams() {
  return converters.map((c) => ({
    from: c.from.toLowerCase().replace(/\s+/g, "-"),
    to: c.to.toLowerCase().replace(/\s+/g, "-"),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { from, to } = await params;
  const converter = findConverter(from, to);
  if (!converter) return {};

  const fromUp = converter.from.toUpperCase();
  const toUp = converter.to.toUpperCase();
  const title = `${fromUp} to ${toUp} Converter — Free Online | ConvertX`;
  const description = `Convert ${fromUp} to ${toUp} online for free. No signup, no install. Fast, secure ${fromUp} to ${toUp} conversion in your browser. 100% free.`;

  return {
    title,
    description,
    keywords: [
      `${fromUp} to ${toUp}`,
      `convert ${fromUp} to ${toUp}`,
      `${fromUp} to ${toUp} converter`,
      `free ${fromUp} to ${toUp}`,
      `online ${fromUp} to ${toUp}`,
      `${fromUp} converter`,
      `${toUp} converter`,
      "free file converter",
      "online converter",
    ],
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://convertx.app/convert/${from}/${to}`,
    },
    twitter: { card: "summary", title, description },
    alternates: { canonical: `https://convertx.app/convert/${from}/${to}` },
  };
}

export default async function ConverterPage({ params }: Props) {
  const { from, to } = await params;
  const converter = findConverter(from, to);
  if (!converter) notFound();

  const category = categories.find((c) => c.key === converter.category);
  const related = converters
    .filter((c) => c.category === converter.category && c.id !== converter.id)
    .slice(0, 6);

  return (
    <ConverterPageClient
      converter={converter}
      category={category}
      related={related}
    />
  );
}
