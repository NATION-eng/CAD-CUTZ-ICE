const encodeSvg = (svg: string) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

export const createPlaceholderDataUrl = (title: string, subtitle = "CAD CUTZ & ICE") =>
  encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#050505" />
          <stop offset="55%" stop-color="#1a1a1a" />
          <stop offset="100%" stop-color="#0d0d0d" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#c5a059" />
          <stop offset="100%" stop-color="#f0d08a" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#bg)" />
      <circle cx="1040" cy="160" r="220" fill="#c5a059" fill-opacity="0.08" />
      <circle cx="160" cy="760" r="240" fill="#c5a059" fill-opacity="0.06" />
      <rect x="96" y="104" width="220" height="8" rx="4" fill="url(#accent)" />
      <text x="96" y="190" fill="#ffffff" font-family="Georgia, serif" font-size="72" font-weight="700">
        ${title}
      </text>
      <text x="96" y="250" fill="#c5a059" font-family="Arial, sans-serif" font-size="30" letter-spacing="8">
        ${subtitle}
      </text>
      <text x="96" y="760" fill="#8a8a8a" font-family="Arial, sans-serif" font-size="28">
        Premium grooming visuals loading fallback
      </text>
    </svg>
  `);

export const defaultImageFallbacks = [
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1599351431247-f5793384797d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80",
];

export const buildImageSources = (primary: string, title: string, extra: string[] = []) => [
  primary,
  ...extra,
  ...defaultImageFallbacks,
  createPlaceholderDataUrl(title),
];
