import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartContext";
import { ToastProvider } from "@/components/ui/Toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DemoBanner from "@/components/layout/DemoBanner";
import { IS_DEMO } from "@/lib/demo";
import CartDrawer from "@/components/cart/CartDrawer";
import PageTransition from "@/components/layout/PageTransition";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Ethereal Artisan — Organic Bath & Body",
    template: "%s · Ethereal Artisan",
  },
  description:
    "Small-batch organic bath & body care — hand-poured artisan soaps, amino-acid face washes, bath salts, face packs and travel kits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          <CartProvider>
            {IS_DEMO && <DemoBanner />}
            <Navbar />
            <CartDrawer />
            <PageTransition>
              <main className="flex-1">{children}</main>
              <Footer />
            </PageTransition>
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
