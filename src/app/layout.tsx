import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartContext";
import { ToastProvider } from "@/components/ui/Toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
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
    default: "Terra Botanica — Organic Bath & Body",
    template: "%s · Terra Botanica",
  },
  description:
    "Small-batch organic bath & body care — lotions, creams, bath salts, clays, scrubs and soaps crafted from botanicals.",
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
