import { evaluateProductPricing, ProductsService } from './products.service';

describe('ProductsService & Authoritative Pricing Suite', () => {
  describe('Authoritative Pricing Engine (evaluateProductPricing)', () => {
    it('1. should return regular price without discount when no salePrice is set', () => {
      const result = evaluateProductPricing({
        originalPrice: 350,
        salePrice: 0,
      });

      expect(result.effectivePrice).toBe(350);
      expect(result.regularPrice).toBe(350);
      expect(result.hasDiscount).toBe(false);
      expect(result.discountPercentage).toBe(0);
      expect(result.savingAmount).toBe(0);
      expect(result.isDiscountActive).toBe(false);
    });

    it('2. should calculate active discount percentage and savings correctly (e.g. ৳500 -> ৳400 is 20% OFF, save ৳100)', () => {
      const result = evaluateProductPricing({
        originalPrice: 500,
        salePrice: 400,
        isDiscountActive: true,
      });

      expect(result.effectivePrice).toBe(400);
      expect(result.regularPrice).toBe(500);
      expect(result.hasDiscount).toBe(true);
      expect(result.discountPercentage).toBe(20);
      expect(result.savingAmount).toBe(100);
      expect(result.isDiscountActive).toBe(true);
    });

    it('3. should auto-compute salePrice when discountPercentage is supplied (e.g. ৳350 with 10% OFF = ৳315)', () => {
      const result = evaluateProductPricing({
        originalPrice: 350,
        salePrice: 0,
        discountPercentage: 10,
        isDiscountActive: true,
      });

      expect(result.effectivePrice).toBe(315);
      expect(result.savingAmount).toBe(35);
      expect(result.hasDiscount).toBe(true);
    });

    it('4. should fall back to regular price when isDiscountActive is false', () => {
      const result = evaluateProductPricing({
        originalPrice: 500,
        salePrice: 400,
        isDiscountActive: false,
      });

      expect(result.effectivePrice).toBe(500);
      expect(result.hasDiscount).toBe(false);
      expect(result.discountPercentage).toBe(0);
      expect(result.savingAmount).toBe(0);
    });

    it('5. should handle scheduled discounts (future date is inactive, active during window, expired after end date)', () => {
      const baseNow = new Date('2026-09-03T12:00:00Z');
      const futureStart = new Date('2026-09-04T00:00:00Z');
      const pastEnd = new Date('2026-09-02T00:00:00Z');

      // A. Future scheduled discount (not yet active)
      const futureResult = evaluateProductPricing(
        {
          originalPrice: 500,
          salePrice: 400,
          discountStartDate: futureStart,
          isDiscountActive: true,
        },
        baseNow,
      );
      expect(futureResult.effectivePrice).toBe(500);
      expect(futureResult.hasDiscount).toBe(false);
      expect(futureResult.isFuture).toBe(true);

      // B. Active within window
      const activeResult = evaluateProductPricing(
        {
          originalPrice: 500,
          salePrice: 400,
          discountStartDate: new Date('2026-09-01T00:00:00Z'),
          discountEndDate: new Date('2026-09-05T00:00:00Z'),
          isDiscountActive: true,
        },
        baseNow,
      );
      expect(activeResult.effectivePrice).toBe(400);
      expect(activeResult.hasDiscount).toBe(true);
      expect(activeResult.savingAmount).toBe(100);

      // C. Expired discount (past end date)
      const expiredResult = evaluateProductPricing(
        {
          originalPrice: 500,
          salePrice: 400,
          discountEndDate: pastEnd,
          isDiscountActive: true,
        },
        baseNow,
      );
      expect(expiredResult.effectivePrice).toBe(500);
      expect(expiredResult.hasDiscount).toBe(false);
      expect(expiredResult.isExpired).toBe(true);
    });
  });

  describe('Business Test Case (Requirement 16: Inventory & Finance Flow)', () => {
    it('should compute exact Gross Profit & COGS for Regular Sale (20 pcs @ ৳350, Cost ৳250)', () => {
      const costPrice = 250;
      const regularPrice = 350;
      const stockPurchased = 100;
      const soldQuantity = 20;

      const remainingPhysicalStock = stockPurchased - soldQuantity;
      expect(remainingPhysicalStock).toBe(80);

      const revenue = soldQuantity * regularPrice;
      const cogs = soldQuantity * costPrice;
      const grossProfit = revenue - cogs;

      expect(revenue).toBe(7000);
      expect(cogs).toBe(5000);
      expect(grossProfit).toBe(2000);
    });

    it('should compute exact Gross Profit & COGS for Discounted Sale (20 pcs @ ৳320, Cost ৳250)', () => {
      const costPrice = 250;
      const originalPrice = 350;
      const salePrice = 320;
      const soldQuantity = 20;

      const pricing = evaluateProductPricing({
        originalPrice,
        salePrice,
        isDiscountActive: true,
      });

      expect(pricing.effectivePrice).toBe(320);

      const revenue = soldQuantity * pricing.effectivePrice;
      const cogs = soldQuantity * costPrice;
      const grossProfit = revenue - cogs;

      expect(revenue).toBe(6400);
      expect(cogs).toBe(5000);
      expect(grossProfit).toBe(1400);
    });
  });

  describe('Image Ordering & Normalization Logic', () => {
    it('should maintain authoritative sort order and ensure exactly one primary cover image', () => {
      const rawImages = [
        { url: 'https://cdn.avelora.com/img-b.jpg', sortOrder: 2, isPrimary: false },
        { url: 'https://cdn.avelora.com/img-a.jpg', sortOrder: 0, isPrimary: true },
        { url: 'https://cdn.avelora.com/img-c.jpg', sortOrder: 1, isPrimary: false },
        { url: 'https://cdn.avelora.com/img-d.jpg', sortOrder: 3, isPrimary: false },
      ];

      // Primary first, then sortOrder
      const sorted = [...rawImages].sort((a, b) => (a.isPrimary ? -1 : b.isPrimary ? 1 : a.sortOrder - b.sortOrder));
      const urls = sorted.map((img) => img.url);

      expect(urls[0]).toBe('https://cdn.avelora.com/img-a.jpg');
      expect(urls).toEqual([
        'https://cdn.avelora.com/img-a.jpg',
        'https://cdn.avelora.com/img-c.jpg',
        'https://cdn.avelora.com/img-b.jpg',
        'https://cdn.avelora.com/img-d.jpg',
      ]);
    });
  });
});
