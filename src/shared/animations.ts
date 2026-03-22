/**
 * src/shared/animations.ts
 *
 * Variantes Framer Motion reutilizáveis em toda a aplicação.
 */

import { Variants } from "framer-motion";

// ─── Tabelas ──────────────────────────────────────────────────────────────────

/**
 * Aplicar no <motion.tbody> para orquestrar o stagger dos filhos.
 */
export const tableContainerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

export const tableRowVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  show: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: "easeIn",
    },
  },
};
