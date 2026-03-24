/**
 * Calculates Dayle's tiered platform fee based on the vault amount in USD.
 * 
 * Fees:
 * $0 to $500: 5% Settlement + 0.5% Processing = 5.5% Total
 * $501 to $2,000: 4% Settlement + 0.5% Processing = 4.5% Total
 * $2,001 to $10,000: 3% Settlement + 0.5% Processing = 3.5% Total
 * $10,001 and above: 2.5% Settlement + 0.5% Processing = 3% Total
 * 
 * @param vaultAmountUSD The total amount in the vault in USD
 * @returns Object containing fee breakdown and amounts in USD
 */
export function calculateDayleFee(vaultAmountUSD: number) {
  let settlementFeePercent: number;
  
  if (vaultAmountUSD <= 500) {
    settlementFeePercent = 5;
  } else if (vaultAmountUSD <= 2000) {
    settlementFeePercent = 4;
  } else if (vaultAmountUSD <= 10000) {
    settlementFeePercent = 3;
  } else {
    settlementFeePercent = 2.5;
  }

  const processingFeePercent = 0.5;
  
  const depositFeeUSD = Number(((vaultAmountUSD * processingFeePercent) / 100).toFixed(2));
  const settlementFeeUSD = Number(((vaultAmountUSD * settlementFeePercent) / 100).toFixed(2));
  
  // Withdrawal fee is 0.5% of the amount remaining after settlement
  const netAfterSettlement = vaultAmountUSD - settlementFeeUSD;
  const withdrawalFeeUSD = Number(((netAfterSettlement * processingFeePercent) / 100).toFixed(2));
  
  const totalFeeUSD = Number((settlementFeeUSD + withdrawalFeeUSD).toFixed(2));
  const freelancerReceivesUSD = Number((netAfterSettlement - withdrawalFeeUSD).toFixed(2));
  const totalClientPaysUSD = Number((vaultAmountUSD + depositFeeUSD).toFixed(2));

  return {
    settlementFeePercent,
    processingFeePercent,
    depositFeeUSD,
    settlementFeeUSD,
    withdrawalFeeUSD,
    totalFeeUSD,
    freelancerReceivesUSD,
    totalClientPaysUSD,
  };
}
