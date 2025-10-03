import { type Variants } from "framer-motion";

// Primary animation variants used throughout the app
export const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1,
      delayChildren: 0.2,
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2
    }
  }
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

export const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 24
};

// Slide variants for side entrances
export const slideInRight: Variants = {
  hidden: { x: 50, opacity: 0 },
  show: { 
    x: 0, 
    opacity: 1,
    transition: springTransition
  },
  exit: {
    x: 50,
    opacity: 0
  }
};

export const slideInLeft: Variants = {
  hidden: { x: -50, opacity: 0 },
  show: { 
    x: 0, 
    opacity: 1,
    transition: springTransition
  },
  exit: {
    x: -50,
    opacity: 0
  }
};

// Scale variants for cards
export const cardVariants: Variants = {
  hidden: { scale: 0.95, opacity: 0 },
  show: { 
    scale: 1, 
    opacity: 1,
    transition: springTransition
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2
    }
  },
  tap: {
    scale: 0.98
  }
};

// Stagger delay calculation helper
export const staggerChildrenDelays = (totalChildren: number, totalDuration: number = 0.5) => {
  return totalChildren > 1 ? totalDuration / (totalChildren - 1) : 0;
};