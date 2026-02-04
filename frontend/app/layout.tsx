import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";
import { AuthProvider } from "@/contexts/AuthContext";
import StarryBackground from "@/components/ui/StarryBackground";
import { Toaster } from "sonner";

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
  title: "The Mambo Guild | Gamify Your Dance",
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
        {/* Starry Jazz Theme Background */}
        <StarryBackground />
        <AuthProvider>
          {children}
          <GlobalAudioPlayer />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
