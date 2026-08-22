import React from "react";

export type IconName =
  | "scissors"
  | "crown"
  | "star"
  | "clock"
  | "calendar"
  | "whatsapp"
  | "location"
  | "phone"
  | "email"
  | "check"
  | "alert"
  | "sparkle"
  | "chair"
  | "download"
  | "lightning"
  | "search"
  | "shield"
  | "diamond";

interface LuxuryIconProps {
  name: IconName;
  size?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const LuxuryIcon: React.FC<LuxuryIconProps> = ({
  name,
  size = 18,
  color = "currentColor",
  className = "",
  style = {},
}) => {
  const iconStyle: React.CSSProperties = {
    display: "inline-block",
    verticalAlign: "middle",
    width: size,
    height: size,
    fill: "none",
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...style,
  };

  switch (name) {
    case "scissors":
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <line x1="20" y1="4" x2="8.12" y2="15.88" />
          <line x1="14.47" y1="14.48" x2="20" y2="20" />
          <line x1="8.12" y1="8.12" x2="12" y2="12" />
        </svg>
      );

    case "crown":
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
          <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" fill="rgba(197, 160, 89, 0.2)" />
          <path d="M3 20h18v2H3z" />
        </svg>
      );

    case "star":
      return (
        <svg viewBox="0 0 24 24" style={{ ...iconStyle, fill: color }} className={className}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );

    case "clock":
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );

    case "calendar":
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );

    case "whatsapp":
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          <path d="M10 9a1.5 1.5 0 0 0-1.5 1.5c0 2.5 2 4.5 4.5 4.5a1.5 1.5 0 0 0 1.5-1.5" />
        </svg>
      );

    case "location":
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );

    case "phone":
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );

    case "email":
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );

    case "check":
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );

    case "alert":
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );

    case "sparkle":
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
          <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="rgba(197, 160, 89, 0.3)" />
        </svg>
      );

    case "chair":
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
          <path d="M6 19v3M18 19v3M6 4h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM4 15h16" />
        </svg>
      );

    case "download":
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      );

    case "lightning":
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="rgba(197, 160, 89, 0.3)" />
        </svg>
      );

    case "search":
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );

    case "shield":
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(197, 160, 89, 0.2)" />
        </svg>
      );

    case "diamond":
    default:
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
          <polygon points="6 3 18 3 22 9 12 22 2 9" fill="rgba(197, 160, 89, 0.2)" />
        </svg>
      );
  }
};
