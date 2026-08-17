export const getVariantPrice = (basePrice: number, weight?: string, productWeights?: any[]): number => {
  if (!weight) return basePrice;
  
  // 1. If weights are stored in the database as objects with explicit prices, use them
  if (productWeights && Array.isArray(productWeights)) {
    const cleanWeight = weight.toLowerCase().replace(/\s+/g, '');
    const found = productWeights.find((w: any) => {
      if (typeof w === 'object' && w !== null && w.weight) {
        return w.weight.toLowerCase().replace(/\s+/g, '') === cleanWeight;
      }
      return false;
    });
    if (found && typeof found.price === 'number') {
      return found.price;
    }
  }

  // 2. Fallback to dynamic multiplier calculation relative to 500g base price
  const w = weight.toLowerCase().replace(/\s+/g, '');
  if (w === '250g') {
    return Math.round(basePrice * 0.6);
  }
  if (w === '1kg' || w === '1000g') {
    return Math.round(basePrice * 1.8);
  }
  return basePrice;
};
