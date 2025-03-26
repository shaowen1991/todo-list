/**
 * Formats a date string or Date object to a localized date string
 *
 * @param {string|Date} date
 * @param {Object} options
 * @param {string} locale
 * @returns {string}
 */
export const formatDate = (date, options = {}, locale = 'en-US') => {
  if (!date) return '';

  try {
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    const formattingOptions = { ...defaultOptions, ...options };
    const dateObj = date instanceof Date ? date : new Date(date);

    return dateObj.toLocaleDateString(locale, formattingOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};
