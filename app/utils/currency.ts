export const formatAmount = (amount: number, currency: string) => {
  const formattedAmount = Number((amount / 100).toFixed(2));
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(formattedAmount);
};
