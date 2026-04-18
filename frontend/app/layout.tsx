import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";
import { AuthProvider } from "@/contexts/AuthContext";
import LocaleProviderWrapper from "@/components/LocaleProviderWrapper";
import StarryBackground from "@/components/ui/StarryBackground";
import BugReportButton from "@/components/BugReportButton";
import { Toaster } from "sonner";
import { SITE_URL, SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, FOUNDER, CONTACT_EMAIL } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "600", "800"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: FOUNDER.name }],
  creator: FOUNDER.name,
  publisher: SITE_NAME,
  keywords: [
    "salsa on2",
    "mambo",
    "new york style salsa",
    "salsa classes online",
    "learn salsa",
    "salsa skill tree",
    "salsa lessons",
    "salsa curriculum",
    "online dance school",
    "Pavle Popovic",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/assets/Logo.png",
    apple: "/assets/Logo.png",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "@id": `${SITE_URL}#organization`,
  name: SITE_NAME,
  alternateName: "Mambo Guild",
  url: SITE_URL,
  logo: `${SITE_URL}/assets/Logo.png`,
  description: SITE_DESCRIPTION,
  foundingDate: "2025",
  founder: {
    "@type": "Person",
    "@id": `${SITE_URL}#founder`,
    name: FOUNDER.name,
    jobTitle: FOUNDER.role,
    description: FOUNDER.description,
    image: FOUNDER.image,
    knowsAbout: [
      "Salsa On2",
      "New York Style Mambo",
      "Learning Experience Design",
      "Gamified Learning",
      "Motor Learning",
      "Dance Pedagogy",
    ],
    award: [
      "2x European Salsa Champion",
      "Certified in Learning Experience Design",
      "Certified in Gamification",
    ],
  },
  sameAs: [] as string[],
  contactPoint: {
    "@type": "ContactPoint",
    email: CONTACT_EMAIL,
    contactType: "customer support",
    availableLanguage: ["English", "French", "Italian", "Spanish"],
  },
};

const schemaJson = JSON.stringify(organizationSchema).replace(/</g, "\\u003c");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schemaJson }}
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-black overflow-x-hidden`}>
        {/* Starry Jazz Theme Background */}
        <StarryBackground />
        <LocaleProviderWrapper>
          <AuthProvider>
            {children}
            <GlobalAudioPlayer />
            <BugReportButton />
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </LocaleProviderWrapper>
      </body>
    </html>
  );
}
