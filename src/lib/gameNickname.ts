/**
 * Helper to fetch and verify in-game nicknames for popular game products.
 * Queries primary GoPay game preparation endpoint with fallback to Cloudflare/Codashop endpoints.
 */

export interface CheckNicknameResult {
  success: boolean;
  name?: string | null;
  isFound: boolean;
  message: string;
}

const GAME_ENDPOINT_MAP: Record<
  string,
  {
    gopayEndpoint: string;
    requiresZone: boolean;
    isanPath?: string;
  }
> = {
  "mobile-legends": {
    gopayEndpoint: "MOBILE_LEGENDS",
    requiresZone: true,
    isanPath: "ml",
  },
  "mobile-legends-bang-bang": {
    gopayEndpoint: "MOBILE_LEGENDS",
    requiresZone: true,
    isanPath: "ml",
  },
  "magic-chess-go-go": {
    gopayEndpoint: "MAGIC_CHESS_GO_GO",
    requiresZone: true,
  },
  "magic-chess": {
    gopayEndpoint: "MAGIC_CHESS_GO_GO",
    requiresZone: true,
  },
  "free-fire": {
    gopayEndpoint: "FREEFIRE",
    requiresZone: false,
    isanPath: "ff",
  },
  "free-fire-membership": {
    gopayEndpoint: "FREEFIRE",
    requiresZone: false,
    isanPath: "ff",
  },
  "honor-of-kings": {
    gopayEndpoint: "HONOR_OF_KINGS",
    requiresZone: false,
  },
  "pubg-mobile": {
    gopayEndpoint: "PUBG_MOBILE",
    requiresZone: false,
  },
  "pubg-mobile-global": {
    gopayEndpoint: "PUBG_MOBILE",
    requiresZone: false,
  },
  "call-of-duty-mobile": {
    gopayEndpoint: "CALL_OF_DUTY",
    requiresZone: false,
  },
  "arena-of-valor": {
    gopayEndpoint: "ARENA_OF_VALOR",
    requiresZone: false,
  },
  "point-blank": {
    gopayEndpoint: "POINT_BLANK",
    requiresZone: false,
  },
  "point-blank-zepetto": {
    gopayEndpoint: "POINT_BLANK",
    requiresZone: false,
  },
  "blood-strike": {
    gopayEndpoint: "BLOOD_STRIKE",
    requiresZone: false,
  },
  "delta-force-mobile": {
    gopayEndpoint: "DELTA_FORCE",
    requiresZone: false,
  },
  "arena-breakout": {
    gopayEndpoint: "ARENA_BREAKOUT",
    requiresZone: false,
  },
};

export async function checkGameAccount(
  userId: string,
  zoneId?: string | null,
  gameSlug?: string
): Promise<CheckNicknameResult> {
  const cleanId = (userId || "").trim();
  const cleanZone = (zoneId || "").trim();
  const slug = (gameSlug || "").toLowerCase().trim();

  if (!cleanId) {
    return {
      success: false,
      isFound: false,
      message: "User ID wajib diisi.",
    };
  }

  const mapping = GAME_ENDPOINT_MAP[slug];

  // 1. If not mapped or manual product
  if (!mapping) {
    return {
      success: true,
      name: cleanId,
      isFound: true,
      message: "Format ID tersimpan. Pesanan akan diproses langsung ke ID akun Anda.",
    };
  }

  // Check if zone is required
  if (mapping.requiresZone && !cleanZone) {
    return {
      success: false,
      isFound: false,
      message: "Zone ID / Server ID wajib diisi.",
    };
  }

  // 2. Primary Inquiry via GoPay Games Preparation Engine
  try {
    const url = new URL(`https://gopay.co.id/games/v1/order/prepare/${mapping.gopayEndpoint}`);
    url.searchParams.set("userId", cleanId);
    if (mapping.requiresZone && cleanZone) {
      url.searchParams.set("zoneId", cleanZone);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        Accept: "application/json",
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    const json = await res.json().catch(() => null);

    if (res.status === 200 && json && json.data) {
      const rawName = String(json.data).trim();
      // Sometimes rawName is just the numeric ID if nickname isn't publicly published
      const finalName = rawName !== cleanId && rawName !== `${cleanId}${cleanZone}` ? rawName : cleanId;
      return {
        success: true,
        name: finalName,
        isFound: true,
        message: "Akun game berhasil diverifikasi.",
      };
    }

    // Explicit user not found
    if (
      res.status === 404 ||
      (json &&
        typeof json.message === "string" &&
        (json.message.toLowerCase().includes("not recognized") ||
          json.message.toLowerCase().includes("invalid user account") ||
          json.message.toLowerCase().includes("unknown user")))
    ) {
      return {
        success: false,
        isFound: false,
        message: "Akun game tidak ditemukan. Pastikan User ID dan Server ID sudah benar.",
      };
    }
  } catch (err: any) {
    console.warn(`[Nickname Check Primary Error: ${slug}]`, err?.message);
  }

  // 3. Secondary Fallback via Public Validator API (MLBB, FF, etc.)
  if (mapping.isanPath) {
    try {
      let isanUrl = `https://api.isan.eu.org/nickname/${mapping.isanPath}?id=${encodeURIComponent(cleanId)}`;
      if (mapping.requiresZone && cleanZone) {
        isanUrl += `&zone=${encodeURIComponent(cleanZone)}&server=${encodeURIComponent(cleanZone)}`;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(isanUrl, {
        headers: { "User-Agent": "XYZPEDIA-DirectFulfillment/1.0" },
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));

      const data = await res.json().catch(() => null);
      if (data && data.success && data.name) {
        return {
          success: true,
          name: String(data.name).trim(),
          isFound: true,
          message: "Akun game berhasil diverifikasi.",
        };
      }

      if (data && data.success === false) {
        return {
          success: false,
          isFound: false,
          message: "Akun game tidak ditemukan. Pastikan User ID dan Server ID sudah benar.",
        };
      }
    } catch (err: any) {
      console.warn(`[Nickname Check Fallback Error: ${slug}]`, err?.message);
    }
  }

  // 4. If inquiry timed out or service is temporarily unreachable, allow buyer to proceed without blocking
  return {
    success: true,
    name: null,
    isFound: true,
    message: "Server verifikasi sedang sibuk. Data akun Anda tetap tersimpan dan dapat diproses.",
  };
}

/**
 * Returns nickname string or null (used for invoice / receipt generation)
 */
export async function fetchGameNickname(
  userId: string,
  zoneId?: string | null,
  gameSlug?: string
): Promise<string | null> {
  const result = await checkGameAccount(userId, zoneId, gameSlug);
  if (result.success && result.name && result.name !== userId) {
    return result.name;
  }
  return null;
}
