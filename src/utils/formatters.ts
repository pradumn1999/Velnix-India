export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calculateDiscount = (originalPrice: number, currentPrice: number): number => {
  if (originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

export const getEstimatedDeliveryString = (daysOffset: number = 4): string => {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysOffset);
  return targetDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};
