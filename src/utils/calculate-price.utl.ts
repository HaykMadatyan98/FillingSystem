export function calculateItemCost(items: number, basePrice: number): void {
    let totalCost = 0;
  
    for (let i = 1; i <= items; i++) {
      let itemPrice = basePrice;
      if (i === 2) {
        itemPrice *= 0.75;
      } else if (i >= 3) {
        itemPrice *= 0.5;
      }
      totalCost += itemPrice;
    }
  
}