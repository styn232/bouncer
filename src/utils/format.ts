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
 * Truncates text cleanly if it exceeds the maximum length
 */
export function truncateText(str?: string, maxLength: number = 20): string {
  if (!str) return '';
  const trimmed = str.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1)}…`;
}

/**
 * Formats a single's name: capitalizes first letter of names and surnames,
 * and truncates longer names so they display cleanly inside cards, modals, and headers.
 * Example: "nyasha tatenda mukamuri" -> "Nyasha Tatenda M…"
 */
export function formatDisplayName(name?: string, maxLength: number = 18): string {
  if (!name) return '';
  const capitalized = capitalizeName(name);
  if (capitalized.length <= maxLength) return capitalized;
  return `${capitalized.slice(0, maxLength - 1)}…`;
}

/**
 * Formats a full name composed of first name and surname with proper capitalization and truncation
 */
export function formatFullName(firstName?: string, surname?: string, maxLength: number = 20): string {
  const combined = [firstName, surname].filter(Boolean).join(' ');
  return formatDisplayName(combined, maxLength);
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

