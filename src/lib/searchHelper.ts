import Fuse, { IFuseOptions } from "fuse.js";

// Common gaming aliases and shorthand popular in Indonesia
export const GAME_ALIASES: Record<string, string[]> = {
  "mobile-legends": ["ml", "mlbb", "mobile legend", "mobel lejen", "moba", "dm ml", "diamond ml"],
  "free-fire": ["ff", "ep ep", "epep", "free fire max", "ff max", "dm ff", "diamond ff"],
  "free-fire-max": ["ff", "ep ep", "epep", "free fire", "ff max", "dm ff"],
  "genshin-impact": ["gi", "gensin", "genshin", "impact", "primogem", "genesis"],
  "honkai-star-rail": ["hsr", "honkai", "star rail", "oneiric"],
  "pubg-mobile": ["pubg", "pubgm", "uc pubg", "uc", "battleground"],
  "valorant": ["valo", "vp", "valorant points", "riot"],
  "honor-of-kings": ["hok", "honor of king", "tokens hok"],
  "call-of-duty-mobile": ["codm", "cod", "cp codm", "call of duty"],
  "roblox": ["rbx", "roblx", "robux"],
  "arena-of-valor": ["aov", "arena of valor", "voucher aov"],
  "point-blank": ["pb", "zepetto", "cash pb"],
  "clash-of-clans": ["coc", "clash of clans", "gems coc"],
  "brawl-stars": ["bs", "brawl", "gems bs"],
  "undawn": ["undawn", "garena undawn"],
};

export interface SearchableProduct {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  developer?: string | null;
  [key: string]: any;
}

/**
 * Perform intelligent fuzzy search on products list using Fuse.js
 * Falls back to case-insensitive substring matching if Fuse yields no results.
 */
export function fuzzySearchProducts<T extends SearchableProduct>(
  products: T[],
  query: string
): T[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return products;

  // Augment items with alias keywords for deeper match
  const augmented = products.map((p) => {
    const slugKey = p.slug.toLowerCase();
    const aliases = GAME_ALIASES[slugKey] || [];
    return {
      product: p,
      searchCorpus: `${p.name} ${p.developer || ""} ${p.categorySlug} ${aliases.join(" ")}`.toLowerCase(),
      aliases: aliases.join(" "),
    };
  });

  const fuseOptions: IFuseOptions<(typeof augmented)[0]> = {
    keys: [
      { name: "product.name", weight: 0.6 },
      { name: "aliases", weight: 0.3 },
      { name: "product.developer", weight: 0.1 },
    ],
    threshold: 0.38, // Balance between typo tolerance and precision
    ignoreLocation: true,
    minMatchCharLength: 2,
  };

  const fuse = new Fuse(augmented, fuseOptions);
  const fuseResults = fuse.search(trimmed);

  if (fuseResults.length > 0) {
    return fuseResults.map((r) => r.item.product);
  }

  // Substring fallback (for very short 1-2 char searches or partial exact matches)
  return products.filter((p) => {
    const slugKey = p.slug.toLowerCase();
    const aliases = GAME_ALIASES[slugKey] || [];
    const inName = p.name.toLowerCase().includes(trimmed);
    const inDev = p.developer ? p.developer.toLowerCase().includes(trimmed) : false;
    const inAlias = aliases.some((a) => a.includes(trimmed) || trimmed.includes(a));
    return inName || inDev || inAlias;
  });
}
