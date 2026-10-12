/**
 * Mathematical discount helper
 * Guarantees 100% mathematical consistency between:
 * - Original Price (MRP)
 * - Discount Percentage Badge (-X%)
 * - Final Price (Rounded to 2 decimals)
 * 
 * Example:
 * 31.59 - 20% = 31.59 - 6.318 = 25.272 ≈ 25.27
 */

export interface DiscountDetails {
  hasDiscount: boolean;
  discountPercent: number | null;
  originalPrice: number;
  finalPrice: number;
  discountAmount: number;
  discountBadge: string | null;
}

/**
 * Calculates exact discount details from original price and raw discounted price.
 */
export function calculateDiscount(
  price: number,
  rawDiscountPrice?: number | null
): DiscountDetails {
  const origPrice = Number(price) || 0;
  if (
    rawDiscountPrice == null ||
    rawDiscountPrice >= origPrice ||
    origPrice <= 0
  ) {
    return {
      hasDiscount: false,
      discountPercent: null,
      originalPrice: origPrice,
      finalPrice: origPrice,
      discountAmount: 0,
      discountBadge: null,
    };
  }

  // Calculate clean rounded discount percentage
  const discountPercent = Math.max(
    1,
    Math.min(99, Math.round((1 - rawDiscountPrice / origPrice) * 100))
  );

  // Exact final price: origPrice * (1 - discountPercent / 100), rounded to 2 decimals
  const finalPrice =
    Math.round(origPrice * (1 - discountPercent / 100) * 100) / 100;
  const discountAmount = Math.round((origPrice - finalPrice) * 100) / 100;

  return {
    hasDiscount: true,
    discountPercent,
    originalPrice: origPrice,
    finalPrice,
    discountAmount,
    discountBadge: `-${discountPercent}%`,
  };
}

/**
 * Calculates exact discount details given an explicit discount percentage (e.g. 20 for 20%).
 */
export function calculateDiscountWithPercent(
  price: number,
  percent: number
): DiscountDetails {
  const origPrice = Number(price) || 0;
  const cleanPercent = Math.max(0, Math.min(99, Math.round(percent)));

  if (cleanPercent === 0 || origPrice <= 0) {
    return {
      hasDiscount: false,
      discountPercent: null,
      originalPrice: origPrice,
      finalPrice: origPrice,
      discountAmount: 0,
      discountBadge: null,
    };
  }

  // Exact final price: origPrice * (1 - cleanPercent / 100), rounded to 2 decimals
  const finalPrice =
    Math.round(origPrice * (1 - cleanPercent / 100) * 100) / 100;
  const discountAmount = Math.round((origPrice - finalPrice) * 100) / 100;

  return {
    hasDiscount: true,
    discountPercent: cleanPercent,
    originalPrice: origPrice,
    finalPrice,
    discountAmount,
    discountBadge: `-${cleanPercent}%`,
  };
}
