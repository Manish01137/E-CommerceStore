"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

/**
 * Soft fade + rise on route change.
 *
 * Deliberately no AnimatePresence: in the App Router its exiting child is
 * never unmounted, which left a stale absolutely-positioned copy of the
 * previous page in the DOM (duplicate <main>/<footer>, dead scroll space
 * below the footer). Keying on the pathname remounts and fades the new page
 * in, which gives the same feel with no ghost node.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-1 flex-col"
    >
      {children}
    </motion.div>
  );
}
