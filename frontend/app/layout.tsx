import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";
import { AuthProvider } from "@/contexts/AuthContext";
import PalladiumMesh from "@/components/PalladiumMesh";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "600", "800"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "The Mambo Inn | Gamify Your Dance",
  description: "Structured courses. Real feedback. Stop memorizing steps—start mastering the game.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-black`}>
        {/* PalladiumMesh background - subtle dark mesh gradient */}
        <PalladiumMesh />
        <AuthProvider>
          {children}
          <GlobalAudioPlayer />
        </AuthProvider>
      </body>
    </html>
  );
}
