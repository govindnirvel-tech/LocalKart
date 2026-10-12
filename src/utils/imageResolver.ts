/**
 * Global Image Resolver & CDN Mapper
 * 
 * Replaces dead/blocked image providers (e.g. loremflickr.com 401 Unauthorized)
 * with fast, reliable, high-resolution fashion photography from Unsplash.
 */

// Category-based curated Unsplash fashion photography pools
const PHOTO_POOLS: Record<string, string[]> = {
  // Baby & Kids
  baby: [
    'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
    'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=800',
    'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=800',
  ],
  kids: [
    'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=800',
    'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800',
    'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800',
    'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800',
  ],

  // Shoes & Footwear
  shoes: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800',
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800',
  ],

  // T-Shirts & Polos
  tshirt: [
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
    'https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=800',
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800',
  ],

  // Shirts
  shirt: [
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
    'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800',
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800',
  ],

  // Jeans, Pants & Trousers
  jeans: [
    'https://images.unsplash.com/photo-1542272604-780c96856592?w=800',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800',
    'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800',
  ],

  // Dresses & Skirts
  dress: [
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800',
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800',
    'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800',
  ],

  // Ethnic, Saree, Kurta, Lehenga
  ethnic: [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800',
    'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800',
  ],

  // Jackets, Coats & Hoodies
  jacket: [
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800',
    'https://images.unsplash.com/photo-1544441893-675973e31985?w=800',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
  ],

  // Bags, Backpacks & Wallets
  bag: [
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
  ],

  // Watches
  watch: [
    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
  ],

  // Jewellery & Accessories
  jewellery: [
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800',
  ],

  // Sunglasses & Eyewear
  eyewear: [
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800',
    'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800',
  ],

  // Activewear & Sportswear
  sport: [
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    'https://images.unsplash.com/photo-1483721074574-d2e850b677a8?w=800',
  ],

  // Lingerie, Sleepwear & Swimwear
  lingerie: [
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
    'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800',
  ],

  // Default Fashion
  general: [
    'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800',
  ],
};

function getPoolKey(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('baby') || lower.includes('sock')) return 'baby';
  if (lower.includes('kid')) return 'kids';
  if (lower.includes('shoe') || lower.includes('sneaker') || lower.includes('heel') || lower.includes('footwear')) return 'shoes';
  if (lower.includes('tshirt') || lower.includes('t-shirt') || lower.includes('polo')) return 'tshirt';
  if (lower.includes('shirt')) return 'shirt';
  if (lower.includes('jean') || lower.includes('pant') || lower.includes('trouser') || lower.includes('short')) return 'jeans';
  if (lower.includes('dress') || lower.includes('skirt')) return 'dress';
  if (lower.includes('saree') || lower.includes('kurta') || lower.includes('kurti') || lower.includes('ethnic') || lower.includes('lehenga') || lower.includes('dupatta')) return 'ethnic';
  if (lower.includes('jacket') || lower.includes('hoodie') || lower.includes('suit') || lower.includes('blazer') || lower.includes('coat') || lower.includes('sweater')) return 'jacket';
  if (lower.includes('bag') || lower.includes('backpack') || lower.includes('handbag') || lower.includes('wallet') || lower.includes('luggage')) return 'bag';
  if (lower.includes('watch')) return 'watch';
  if (lower.includes('sunglass') || lower.includes('eyewear')) return 'eyewear';
  if (lower.includes('jewel') || lower.includes('ring') || lower.includes('necklace')) return 'jewellery';
  if (lower.includes('gym') || lower.includes('sport') || lower.includes('yoga') || lower.includes('swim')) return 'sport';
  if (lower.includes('lingerie') || lower.includes('bra') || lower.includes('underwear') || lower.includes('sleep') || lower.includes('night')) return 'lingerie';
  return 'general';
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Resolves any image URL or title into an ultra-fast, high-resolution Unsplash CDN URL.
 * Automatically intercepts loremflickr.com (which returns 401 Unauthorized).
 */
export function resolveSafeImageUri(
  rawUri?: string | null,
  contextHint?: string
): string {
  if (!rawUri || typeof rawUri !== 'string' || rawUri.trim() === '') {
    const key = contextHint ? getPoolKey(contextHint) : 'general';
    const pool = PHOTO_POOLS[key] || PHOTO_POOLS.general;
    return pool[0];
  }

  const trimmed = rawUri.trim();

  // If it's already a working Unsplash, Supabase Storage, or Cloudinary URL, keep it!
  if (
    trimmed.startsWith('https://images.unsplash.com') ||
    trimmed.startsWith('https://res.cloudinary.com') ||
    trimmed.includes('supabase.co/storage')
  ) {
    return trimmed;
  }

  // Intercept loremflickr.com and broken placeholder domains
  if (
    trimmed.includes('loremflickr.com') ||
    trimmed.includes('via.placeholder.com') ||
    trimmed.includes('placehold.it') ||
    trimmed.includes('picsum.photos')
  ) {
    // Extract keyword and lock from loremflickr URL if possible
    // Example: https://loremflickr.com/800/800/baby,socks/all?lock=282210
    const match = trimmed.match(/\/(\d+)\/(\d+)\/([^/?]+)(?:\/all)?(?:\?lock=(\d+))?/i);
    let extractedKeywords = '';
    let lockSeed = 0;

    if (match) {
      extractedKeywords = decodeURIComponent(match[3]).replace(/,/g, ' ');
      lockSeed = match[4] ? parseInt(match[4], 10) : hashString(trimmed);
    } else {
      extractedKeywords = trimmed;
      lockSeed = hashString(trimmed);
    }

    const poolKey = getPoolKey(`${extractedKeywords} ${contextHint || ''}`);
    const pool = PHOTO_POOLS[poolKey] || PHOTO_POOLS.general;
    const picked = pool[lockSeed % pool.length];
    return picked;
  }

  return trimmed;
}

/**
 * Fallback image if an image fails to load across the network.
 */
export function getFallbackImage(hint?: string): string {
  const key = hint ? getPoolKey(hint) : 'general';
  const pool = PHOTO_POOLS[key] || PHOTO_POOLS.general;
  return pool[0];
}
