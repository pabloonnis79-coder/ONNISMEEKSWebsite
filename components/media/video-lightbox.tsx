"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { XIcon } from "@phosphor-icons/react";

export function VideoLightbox({
  youtubeId,
  open,
  onClose,
  title,
}: {
  youtubeId: string;
  open: boolean;
  onClose: () => void;
  title: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[var(--z-overlay)] flex items-center justify-center bg-ink/96 p-4 backdrop-blur-sm md:p-10"
          onClick={onClose}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar video"
            className="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-paper transition-colors hover:border-flame-warm hover:text-flame-warm md:right-10 md:top-10"
          >
            <XIcon size={18} weight="bold" />
          </button>

          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="aspect-video w-full max-w-[1400px]"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              title={title}
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              className="h-full w-full border-0 bg-ink-800"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
