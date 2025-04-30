
/**
 * Format a date string into a localized date format
 */
export const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  });
};

/**
 * Format a number into a currency string (INR)
 */
export const formatCurrency = (amount: number | null | undefined) => {
  if (amount == null) return "N/A";
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};
