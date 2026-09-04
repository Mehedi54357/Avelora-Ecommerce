/**
 * AVELORA Authoritative Product Pricing & Discount Evaluator (Frontend Client Mirror)
 * Mirrors backend calculation logic in products.service.ts for instant UI previews
 * without deviating from server authority.
 */

export interface ProductPricingResult {
  regularPrice: number;
  salePrice: number;
  effectivePrice: number;
  hasDiscount: boolean;
  discountPercentage: number;
  savingAmount: number;
  isDiscountActive: boolean;
  isScheduled: boolean;
  isExpired: boolean;
  isFuture: boolean;
}

export function evaluatePricing(
  product: {
    originalPrice?: number;
    salePrice?: number;
    discountPercentage?: number;
    isDiscountActive?: boolean;
    discountStartDate?: string | Date | null;
    discountEndDate?: string | Date | null;
  } | null | undefined,
  now: Date = new Date(),
): ProductPricingResult {
  if (!product) {
    return {
      regularPrice: 0,
      salePrice: 0,
      effectivePrice: 0,
      hasDiscount: false,
      discountPercentage: 0,
      savingAmount: 0,
      isDiscountActive: false,
      isScheduled: false,
      isExpired: false,
      isFuture: false,
    };
  }

  const originalPrice = Math.max(0, Number(product.originalPrice) || 0);
  let salePrice = Math.max(0, Number(product.salePrice) || 0);

  if ((!salePrice || salePrice === originalPrice) && product.discountPercentage && product.discountPercentage > 0 && originalPrice > 0) {
    salePrice = Math.round(originalPrice * (1 - product.discountPercentage / 100));
  }

  const isEnabled = product.isDiscountActive !== false;
  let isFuture = false;
  let isExpired = false;

  if (product.discountStartDate) {
    const start = new Date(product.discountStartDate);
    if (!isNaN(start.getTime()) && now.getTime() < start.getTime()) {
      isFuture = true;
    }
  }

  if (product.discountEndDate) {
    const end = new Date(product.discountEndDate);
    if (!isNaN(end.getTime()) && now.getTime() > end.getTime()) {
      isExpired = true;
    }
  }

  const isTimeValid = !isFuture && !isExpired;
  const isDiscountValid = isEnabled && isTimeValid && salePrice > 0 && salePrice < originalPrice;

  if (isDiscountValid) {
    const savingAmount = originalPrice - salePrice;
    const discountPercentage = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
    return {
      regularPrice: originalPrice,
      salePrice,
      effectivePrice: salePrice,
      hasDiscount: true,
      discountPercentage,
      savingAmount,
      isDiscountActive: true,
      isScheduled: Boolean(product.discountStartDate || product.discountEndDate),
      isExpired: false,
      isFuture: false,
    };
  }

  const fallbackPrice = originalPrice > 0 ? originalPrice : salePrice;
  return {
    regularPrice: fallbackPrice,
    salePrice: 0,
    effectivePrice: fallbackPrice,
    hasDiscount: false,
    discountPercentage: 0,
    savingAmount: 0,
    isDiscountActive: false,
    isScheduled: Boolean(product.discountStartDate || product.discountEndDate),
    isExpired,
    isFuture,
  };
}
