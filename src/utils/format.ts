/**
 * Utility functions for text formatting across Dating with Bouncer
 */

/**
 * Capitalizes the first letter of each name and surname component
 * Example: "chiedza moyo" -> "Chiedza Moyo", "FRANCIS-TAWANDA" -> "Francis-Tawanda"
 */
export function capitalizeName(str?: string): string {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => {
      if (!word) return '';
      return word
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('-');
    })
    .join(' ');
}

/**
 * Mask WhatsApp number for non-subscribers while clearly demonstrating it is verified & protected
 * Example: "+263 77 123 4567" -> "+263 77 ••• ••67"
 */
export function maskPhoneNumber(phone?: string): string {
  if (!phone) return '+263 77 ••• ••••';
  const clean = phone.trim();
  if (clean.length < 6) return '+263 7• ••• ••••';
  const prefix = clean.slice(0, 7);
  const suffix = clean.slice(-2);
  return `${prefix} ••• ••${suffix}`;
}
