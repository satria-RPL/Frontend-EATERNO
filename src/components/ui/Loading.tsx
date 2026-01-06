"use client";

import { motion } from "framer-motion";

type LoadingVariant = "request-payment" | "print-receipt";

const loadingCopy: Record<LoadingVariant, { title: string; subtitle: string }> =
  {
    "request-payment": {
      title: "Request Payment",
      subtitle: "Processing Order",
    },
    "print-receipt": {
      title: "Proses Cetak Struk",
      subtitle: "Cetak Struk",
    },
  };

export default function Loading({
  variant = "request-payment",
}: {
  variant?: LoadingVariant;
}) {
  const { title, subtitle } = loadingCopy[variant];

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-3">
      {/* bouncing dots */}
      <div className="flex items-center gap-4">
        {/* yellow */}
        <motion.div
          className="w-6 h-6 rounded-full bg-amber-300"
          animate={{ y: [0, -14, 0, 0, 0] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0,
          }}
        />

        {/* green */}
        <motion.div
          className="w-8 h-8 rounded-full bg-green-800"
          animate={{ y: [0, 0, -14, 0, 0] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* red */}
        <motion.div
          className="w-6 h-6 rounded-full bg-red-600"
          animate={{ y: [0, 0, 0, -14, 0] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* title */}
      <p className="text-lg font-semibold flex items-center">
        {title}
        <span className="ml-1 typing-dots"></span>
      </p>

      {/* subtitle */}
      <p className="text-gray-400 text-sm">{subtitle}</p>

      <style jsx>{`
        .typing-dots {
          display: inline-block;
          width: 22px;
          text-align: left;
          overflow: hidden;
        }

        .typing-dots::after {
          content: "...";
          animation: typingDots 1.2s infinite;
        }

        @keyframes typingDots {
          0% {
            content: "";
          }
          33% {
            content: ".";
          }
          66% {
            content: "..";
          }
          100% {
            content: "...";
          }
        }
      `}</style>
    </div>
  );
}
