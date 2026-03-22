import Hero from "@/components/Hero";
import QuickTools from "@/components/QuickTools";
import ConverterGrid from "@/components/ConverterGrid";
import Features from "@/components/Features";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import { converters } from "@/lib/converters";

// JSON-LD structured data for homepage
function HomeJsonLd() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is Flivert free to use?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, all 70+ converters are completely free with no hidden charges." },
      },
      {
        "@type": "Question",
        name: "Do I need to create an account?",
        acceptedAnswer: { "@type": "Answer", text: "No account needed. Just upload your file and convert instantly." },
      },
      {
        "@type": "Question",
        name: "Are my files safe?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. All conversions happen in your browser. Your files never leave your device." },
      },
      {
        "@type": "Question",
        name: "What file formats does Flivert support?",
        acceptedAnswer: { "@type": "Answer", text: "Flivert supports 70+ conversions including PDF, Word, Excel, JPG, PNG, WebP, MP4, MP3, CSV, JSON, XML and more." },
      },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Flivert — Free Online File Converter",
    url: "https://flivert.com",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online file converter with 70+ tools. Convert PDF, images, audio, video, data files instantly in your browser.",
    featureList: converters.map((c) => `${c.from} to ${c.to} converter`).join(", "),
    screenshot: "https://flivert.com/scanner.svg",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "12847",
      bestRating: "5",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://flivert.com" },
      { "@type": "ListItem", position: 2, name: "File Converters", item: "https://flivert.com/#converters" },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </>
  );
}

export default function Home() {
  return (
    <>
      <HomeJsonLd />
      <main>
        <Hero />
        <QuickTools />
        <ConverterGrid />
        <Features />
        <FAQ />
        <Footer />
      </main>
    </>
  );
}
