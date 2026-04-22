export function calculateDurationDays(quantity, productivityRate) {
  if (!quantity || !productivityRate || productivityRate <= 0) return 1;
  return Math.max(1, Math.ceil(Number(quantity) / Number(productivityRate)));
}
