import React from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import "./Gallery.css";
import ReliableImage from "./ReliableImage";
import { buildImageSources } from "../utils/imageFallbacks";

const GallerySection: React.FC = () => {
  const { ref, isVisible } = useScrollReveal(0.1);

  // Array supporting both Images and Videos
  const media = [
    {
      id: 1,
      type: "video",
      url: "https://assets.mixkit.co/videos/preview/mixkit-barber-cutting-hair-with-a-clippper-41551-large.mp4",
    },
    {
      id: 2,
      type: "image",
      url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800",
    },
    {
      id: 3,
      type: "video",
      url: "https://assets.mixkit.co/videos/preview/mixkit-man-getting-his-beard-trimmed-by-a-barber-41549-large.mp4",
    },
    {
      id: 4,
      type: "image",
      url: "https://images.unsplash.com/photo-1621605815841-aa33c54431BB?q=80&w=800",
    },
    {
      id: 5,
      type: "video",
      url: "https://assets.mixkit.co/videos/preview/mixkit-barber-applying-shaving-cream-to-a-client-41546-large.mp4",
    },
    {
      id: 6,
      type: "image",
      url: "https://images.unsplash.com/photo-1593702275677-f916c6c17d77?q=80&w=800",
    },
  ];

  const instagramURL =
    "https://www.instagram.com/chiburomanation?igsh=aWt0aGY5OWgxMHp3";

  return (
    <section className="magic-gallery" ref={ref}>
      <div className={`gallery-header ${isVisible ? "visible" : ""}`}>
        <h2 className="serif">
          Experience the <span className="gold-text italic">Magic</span>
        </h2>
        <p className="subtitle">
          Witness the craft in motion. Click to follow the journey.
        </p>
      </div>

      <div className="magic-grid">
        {media.map((item) => (
          <a
            key={item.id}
            href={instagramURL}
            target="_blank"
            rel="noopener noreferrer"
            className={`magic-item ${isVisible ? "visible" : ""}`}
          >
            <div className="media-wrapper">
              {item.type === "video" ? (
                <video
                  src={item.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="magic-media"
                />
              ) : (
                <ReliableImage
                  sources={buildImageSources(item.url, `Magic Moment ${item.id}`)}
                  alt="Magic Moment"
                  className="magic-media"
                />
              )}

              <div className="magic-overlay">
                <div className="overlay-content">
                  <span className="view-text">VIEW ON INSTAGRAM</span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default GallerySection;
