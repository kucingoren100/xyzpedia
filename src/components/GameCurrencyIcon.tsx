import React from "react";

export type GameCurrencyType =
  | "diamond"
  | "cash"
  | "uc"
  | "cp"
  | "token"
  | "voucher"
  | "bond"
  | "gold"
  | "delta"
  | "steam"
  | "google-play"
  | "vidio"
  | "pulsa"
  | "ewallet"
  | "general";

export interface GameCurrencyMeta {
  type: GameCurrencyType;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
}

export function getGameCurrencyMeta(productSlugOrName: string = ""): GameCurrencyMeta {
  const s = productSlugOrName.toLowerCase();

  if (s.includes("mobile-legends") || s.includes("mobile legends") || s.includes("free-fire") || s.includes("free fire") || s.includes("magic-chess") || s.includes("magic chess")) {
    return {
      type: "diamond",
      label: "Diamond",
      emoji: "💎",
      color: "#00b4d8",
      bgColor: "#e0f2fe",
    };
  }

  if (s.includes("point-blank") || s.includes("point blank")) {
    return {
      type: "cash",
      label: "PB Cash",
      emoji: "💵",
      color: "#16a34a",
      bgColor: "#dcfce7",
    };
  }

  if (s.includes("pubg")) {
    return {
      type: "uc",
      label: "UC",
      emoji: "🪙",
      color: "#d97706",
      bgColor: "#fef3c7",
    };
  }

  if (s.includes("call-of-duty") || s.includes("codm")) {
    return {
      type: "cp",
      label: "CP",
      emoji: "🎖️",
      color: "#ea580c",
      bgColor: "#ffedd5",
    };
  }

  if (s.includes("honor-of-kings")) {
    return {
      type: "token",
      label: "Tokens",
      emoji: "🪙",
      color: "#eab308",
      bgColor: "#fef9c3",
    };
  }

  if (s.includes("arena-of-valor") || s.includes("aov")) {
    return {
      type: "voucher",
      label: "Vouchers",
      emoji: "🎟️",
      color: "#e11d48",
      bgColor: "#ffe4e6",
    };
  }

  if (s.includes("arena-breakout")) {
    return {
      type: "bond",
      label: "Bonds",
      emoji: "💳",
      color: "#ca8a04",
      bgColor: "#fef08a",
    };
  }

  if (s.includes("blood-strike")) {
    return {
      type: "gold",
      label: "Gold",
      emoji: "🥇",
      color: "#f59e0b",
      bgColor: "#fef3c7",
    };
  }

  if (s.includes("delta-force")) {
    return {
      type: "delta",
      label: "Delta Points",
      emoji: "🔷",
      color: "#0284c7",
      bgColor: "#e0f2fe",
    };
  }

  if (s.includes("steam")) {
    return {
      type: "steam",
      label: "Steam Wallet",
      emoji: "🎮",
      color: "#1e293b",
      bgColor: "#f1f5f9",
    };
  }

  if (s.includes("google-play")) {
    return {
      type: "google-play",
      label: "Play Voucher",
      emoji: "🎫",
      color: "#059669",
      bgColor: "#ecfdf5",
    };
  }

  if (s.includes("vidio")) {
    return {
      type: "vidio",
      label: "Vidio Pass",
      emoji: "🎬",
      color: "#dc2626",
      bgColor: "#fee2e2",
    };
  }

  if (s.includes("pulsa") || s.includes("telkomsel") || s.includes("indosat") || s.includes("smartfren") || s.includes("byu") || s.includes("by.u")) {
    return {
      type: "pulsa",
      label: "Pulsa",
      emoji: "📱",
      color: "#fb4903",
      bgColor: "#ffdad6",
    };
  }

  if (s.includes("saldo") || s.includes("dana") || s.includes("gopay") || s.includes("ovo") || s.includes("shopee") || s.includes("linkaja") || s.includes("astrapay") || s.includes("isaku") || s.includes("grab")) {
    return {
      type: "ewallet",
      label: "Saldo",
      emoji: "💳",
      color: "#00b4d8",
      bgColor: "#dceeff",
    };
  }

  return {
    type: "general",
    label: "Item",
    emoji: "⚡",
    color: "#5c4ade",
    bgColor: "#f3e8ff",
  };
}

export function GameCurrencyIcon({
  slugOrName,
  className = "w-6 h-6",
}: {
  slugOrName: string;
  className?: string;
}) {
  const meta = getGameCurrencyMeta(slugOrName);

  switch (meta.type) {
    case "diamond":
      return (
        <svg
          viewBox="0 0 32 32"
          className={`${className} shrink-0 drop-shadow-[1px_1px_0px_#000000]`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Faceted Diamond */}
          <polygon
            points="16,3 27,11 16,29 5,11"
            fill="#38bdf8"
            stroke="#000000"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Top table facet */}
          <polygon
            points="10,11 16,5 22,11 16,15"
            fill="#e0f2fe"
            stroke="#000000"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Side facets */}
          <polygon
            points="5,11 10,11 16,15 16,29"
            fill="#0284c7"
            stroke="#000000"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <polygon
            points="27,11 22,11 16,15 16,29"
            fill="#0369a1"
            stroke="#000000"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <polygon
            points="10,11 5,11 16,3"
            fill="#bae6fd"
            stroke="#000000"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <polygon
            points="22,11 27,11 16,3"
            fill="#7dd3fc"
            stroke="#000000"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Specular sparkle */}
          <circle cx="14" cy="9" r="1.5" fill="#ffffff" />
        </svg>
      );

    case "cash":
      return (
        <svg
          viewBox="0 0 32 32"
          className={`${className} shrink-0 drop-shadow-[1px_1px_0px_#000000]`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cash Banknote PB */}
          <rect
            x="3"
            y="7"
            width="26"
            height="18"
            rx="3"
            fill="#22c55e"
            stroke="#000000"
            strokeWidth="2"
          />
          {/* Inner frame */}
          <rect
            x="6"
            y="9.5"
            width="20"
            height="13"
            rx="2"
            fill="#86efac"
            stroke="#000000"
            strokeWidth="1.5"
            strokeDasharray="2 1"
          />
          {/* Center medallion */}
          <circle
            cx="16"
            cy="16"
            r="4.5"
            fill="#15803d"
            stroke="#000000"
            strokeWidth="1.5"
          />
          <text
            x="16"
            y="19"
            textAnchor="middle"
            fontSize="7"
            fontWeight="900"
            fill="#ffffff"
            fontFamily="sans-serif"
          >
            PB
          </text>
          {/* Corner marks */}
          <circle cx="8" cy="12" r="1" fill="#15803d" />
          <circle cx="24" cy="12" r="1" fill="#15803d" />
          <circle cx="8" cy="20" r="1" fill="#15803d" />
          <circle cx="24" cy="20" r="1" fill="#15803d" />
        </svg>
      );

    case "uc":
      return (
        <svg
          viewBox="0 0 32 32"
          className={`${className} shrink-0 drop-shadow-[1px_1px_0px_#000000]`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Golden UC Coin */}
          <circle
            cx="16"
            cy="16"
            r="13"
            fill="#f59e0b"
            stroke="#000000"
            strokeWidth="2"
          />
          <circle
            cx="16"
            cy="16"
            r="10"
            fill="#fbbf24"
            stroke="#000000"
            strokeWidth="1.5"
          />
          <text
            x="16"
            y="20.5"
            textAnchor="middle"
            fontSize="10"
            fontWeight="900"
            fill="#78350f"
            fontFamily="sans-serif"
          >
            UC
          </text>
        </svg>
      );

    case "cp":
      return (
        <svg
          viewBox="0 0 32 32"
          className={`${className} shrink-0 drop-shadow-[1px_1px_0px_#000000]`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* CODM CP Badge */}
          <polygon
            points="16,3 27,9 27,23 16,29 5,23 5,9"
            fill="#ea580c"
            stroke="#000000"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <polygon
            points="16,6 24,11 24,21 16,26 8,21 8,11"
            fill="#fed7aa"
            stroke="#000000"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <text
            x="16"
            y="20"
            textAnchor="middle"
            fontSize="9"
            fontWeight="900"
            fill="#9a3412"
            fontFamily="sans-serif"
          >
            CP
          </text>
        </svg>
      );

    case "token":
      return (
        <svg
          viewBox="0 0 32 32"
          className={`${className} shrink-0 drop-shadow-[1px_1px_0px_#000000]`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Honor of Kings Token */}
          <circle
            cx="16"
            cy="16"
            r="13"
            fill="#eab308"
            stroke="#000000"
            strokeWidth="2"
          />
          <circle
            cx="16"
            cy="16"
            r="9.5"
            fill="#fef08a"
            stroke="#000000"
            strokeWidth="1.5"
          />
          {/* Star symbol */}
          <polygon
            points="16,9 18,13.5 23,14 19.5,17.5 20.5,22.5 16,20 11.5,22.5 12.5,17.5 9,14 14,13.5"
            fill="#ca8a04"
            stroke="#000000"
            strokeWidth="1"
          />
        </svg>
      );

    case "voucher":
      return (
        <svg
          viewBox="0 0 32 32"
          className={`${className} shrink-0 drop-shadow-[1px_1px_0px_#000000]`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* AOV Voucher Ticket */}
          <rect
            x="4"
            y="8"
            width="24"
            height="16"
            rx="3"
            fill="#f43f5e"
            stroke="#000000"
            strokeWidth="2"
          />
          <circle cx="4" cy="16" r="2.5" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
          <circle cx="28" cy="16" r="2.5" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
          <line
            x1="12"
            y1="9"
            x2="12"
            y2="23"
            stroke="#000000"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
          <circle cx="20" cy="16" r="3" fill="#ffe4e6" stroke="#000000" strokeWidth="1" />
        </svg>
      );

    case "bond":
      return (
        <svg
          viewBox="0 0 32 32"
          className={`${className} shrink-0 drop-shadow-[1px_1px_0px_#000000]`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Arena Breakout Bonds Card */}
          <rect
            x="4"
            y="7"
            width="24"
            height="18"
            rx="2.5"
            fill="#eab308"
            stroke="#000000"
            strokeWidth="2"
          />
          <rect x="7" y="10" width="8" height="5" rx="1" fill="#713f12" stroke="#000000" strokeWidth="1" />
          <line x1="7" y1="18" x2="25" y2="18" stroke="#000000" strokeWidth="1.5" />
          <line x1="7" y1="21" x2="18" y2="21" stroke="#000000" strokeWidth="1.5" />
        </svg>
      );

    case "gold":
      return (
        <svg
          viewBox="0 0 32 32"
          className={`${className} shrink-0 drop-shadow-[1px_1px_0px_#000000]`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Blood Strike Gold Ingot */}
          <polygon
            points="8,19 12,12 24,12 28,19"
            fill="#facc15"
            stroke="#000000"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <polygon
            points="8,19 28,19 26,24 6,24"
            fill="#eab308"
            stroke="#000000"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <polygon
            points="12,12 8,19 6,24 10,17"
            fill="#fef08a"
            stroke="#000000"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "delta":
      return (
        <svg
          viewBox="0 0 32 32"
          className={`${className} shrink-0 drop-shadow-[1px_1px_0px_#000000]`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Delta Force Triangle */}
          <polygon
            points="16,4 28,26 4,26"
            fill="#0ea5e9"
            stroke="#000000"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <polygon
            points="16,11 23,23 9,23"
            fill="#38bdf8"
            stroke="#000000"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="16" cy="18" r="2" fill="#ffffff" />
        </svg>
      );

    case "steam":
      return (
        <svg
          viewBox="0 0 32 32"
          className={`${className} shrink-0 drop-shadow-[1px_1px_0px_#000000]`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="13" fill="#1e293b" stroke="#000000" strokeWidth="2" />
          <circle cx="12" cy="19" r="3.5" fill="#38bdf8" stroke="#000000" strokeWidth="1" />
          <circle cx="21" cy="13" r="4.5" fill="#60a5fa" stroke="#000000" strokeWidth="1" />
          <line x1="12" y1="19" x2="21" y2="13" stroke="#ffffff" strokeWidth="2" />
        </svg>
      );

    case "google-play":
      return (
        <svg
          viewBox="0 0 32 32"
          className={`${className} shrink-0 drop-shadow-[1px_1px_0px_#000000]`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="5" y="6" width="22" height="20" rx="3" fill="#10b981" stroke="#000000" strokeWidth="2" />
          <polygon points="12,10 22,16 12,22" fill="#ffffff" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );

    case "vidio":
      return (
        <svg
          viewBox="0 0 32 32"
          className={`${className} shrink-0 drop-shadow-[1px_1px_0px_#000000]`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="5" y="6" width="22" height="20" rx="3" fill="#ef4444" stroke="#000000" strokeWidth="2" />
          <polygon points="13,11 22,16 13,21" fill="#ffffff" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );

    case "pulsa":
      return (
        <svg
          viewBox="0 0 32 32"
          className={`${className} shrink-0 drop-shadow-[1px_1px_0px_#000000]`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="7" y="4" width="18" height="24" rx="4" fill="#fb4903" stroke="#000000" strokeWidth="2" />
          <rect x="10" y="8" width="12" height="12" rx="1.5" fill="#ffffff" stroke="#000000" strokeWidth="1" />
          <circle cx="16" cy="24" r="1.5" fill="#ffffff" stroke="#000000" strokeWidth="0.8" />
        </svg>
      );

    case "ewallet":
      return (
        <svg
          viewBox="0 0 32 32"
          className={`${className} shrink-0 drop-shadow-[1px_1px_0px_#000000]`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="4" y="7" width="24" height="18" rx="3" fill="#00b4d8" stroke="#000000" strokeWidth="2" />
          <rect x="4" y="11" width="24" height="4" fill="#0077b6" stroke="#000000" strokeWidth="1" />
          <circle cx="21" cy="19" r="2.5" fill="#ffd731" stroke="#000000" strokeWidth="1" />
        </svg>
      );

    default:
      return (
        <div
          className={`${className} rounded-full flex items-center justify-center font-black text-xs ink-border shrink-0`}
          style={{ backgroundColor: meta.bgColor, color: meta.color }}
        >
          {meta.emoji}
        </div>
      );
  }
}
