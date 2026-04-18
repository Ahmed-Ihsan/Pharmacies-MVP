// Format IQD currency
export const formatIQD = (amount: number): string => {
  return new Intl.NumberFormat('ar-IQ', {
    style: 'currency',
    currency: 'IQD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format number with Arabic numerals
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ar-IQ').format(num);
};

// Format date to Arabic
export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('ar-IQ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

// Format dateTime to Arabic
export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('ar-IQ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};
