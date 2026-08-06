"use client";

import Image from "next/image";
import { useState } from "react";
import { PlayIcon } from "@phosphor-icons/react";
import { VideoLightbox } from "@/components/media/video-lightbox";

export function PlayableCover({
  youtubeId,
  poster,
  title,
}: {
  youtubeId: string | null;
  poster: string | null;
  title: string;
}) {
  const [open, setOpen] = useState(false);

  const image = poster ? (
    <Image
      src={poster}
      alt={title}
      fill
      priority
      sizes="100vw"
      quality={90}
      className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.02]"
    />
  ) : (
    <div className="h-full w-full bg-ink-800" />
  );

  if (!youtubeId) {
    return (
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-ink-700">
        {image}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Reproducir ${title}`}
        className="group relative block aspect-[16/9] w-full overflow-hidden bg-ink-700"
      >
        {image}
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent"
        />
        <span className="absolute left-1/2 top-1/2 inline-flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-paper/30 bg-ink/40 text-paper backdrop-blur-md transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:scale-110 group-hover:border-flame group-hover:bg-flame group-hover:text-ink md:h-24 md:w-24">
          <PlayIcon size={22} weight="fill" />
        </span>
      </button>

      <VideoLightbox
        youtubeId={youtubeId}
        open={open}
        onClose={() => setOpen(false)}
        title={title}
      />
    </>
  );
}
