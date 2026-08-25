"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { GalleryMedia } from "@/lib/cms-types";

function mediaLabel(media: GalleryMedia, index: number) {
  return media.alt_text || media.title || `Média ${index + 1}`;
}

export function GalleryLightbox({ media }: { media: GalleryMedia[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : media[activeIndex];

  useEffect(() => {
    if (activeIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") setActiveIndex((index) => index === null ? null : (index - 1 + media.length) % media.length);
      if (event.key === "ArrowRight") setActiveIndex((index) => index === null ? null : (index + 1) % media.length);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, media.length]);

  if (!media.length) return null;

  return (
    <>
      <div className="gallery-media-grid">
        {media.map((item, index) => (
          <button type="button" onClick={() => setActiveIndex(index)} key={item.id} aria-label={`Ouvrir ${mediaLabel(item, index)}`}>
            <span className="gallery-media-frame">
              {item.media_type === "photo" ? (
                <Image src={item.file_url} alt={item.alt_text || item.title || "Photo de VIE AVENIR"} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" />
              ) : (
                <video src={item.file_url} muted playsInline preload="metadata" aria-label={mediaLabel(item, index)} />
              )}
              {item.media_type === "video" ? <b className="gallery-play" aria-hidden="true">▶</b> : null}
            </span>
            {item.title || item.caption ? <span className="gallery-media-copy">{item.title ? <strong>{item.title}</strong> : null}{item.caption ? <small>{item.caption}</small> : null}</span> : null}
          </button>
        ))}
      </div>

      {active ? (
        <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={mediaLabel(active, activeIndex ?? 0)} onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveIndex(null); }}>
          <button className="gallery-lightbox-close" type="button" onClick={() => setActiveIndex(null)} aria-label="Fermer" autoFocus>×</button>
          {media.length > 1 ? <button className="gallery-lightbox-previous" type="button" onClick={() => setActiveIndex((activeIndex! - 1 + media.length) % media.length)} aria-label="Média précédent">←</button> : null}
          <figure>
            <div>
              {active.media_type === "photo" ? (
                <Image src={active.file_url} alt={active.alt_text || active.title || "Photo de VIE AVENIR"} fill sizes="95vw" priority />
              ) : (
                <video src={active.file_url} controls autoPlay playsInline aria-label={mediaLabel(active, activeIndex ?? 0)} />
              )}
            </div>
            {active.title || active.caption ? <figcaption>{active.title ? <strong>{active.title}</strong> : null}{active.caption ? <span>{active.caption}</span> : null}</figcaption> : null}
          </figure>
          {media.length > 1 ? <button className="gallery-lightbox-next" type="button" onClick={() => setActiveIndex((activeIndex! + 1) % media.length)} aria-label="Média suivant">→</button> : null}
        </div>
      ) : null}
    </>
  );
}
