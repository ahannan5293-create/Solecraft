export function formatPrice(amount: number): string {
  // Using explicit string prefix instead of Intl's style:'currency' 
  // because Node.js default for en-PK is 'Rs 12,500', 
  // but we prefer 'PKR 12,500' for consistency.
  return `PKR ${amount.toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`
}
