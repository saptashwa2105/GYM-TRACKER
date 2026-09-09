import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes conditionally
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format date in standard YYYY-MM-DD format
 */
export function formatDateKey(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Safe local storage parser
 */
export function getLocalStorage(key, fallback = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.warn(`[LocalStorage] Failed to parse key ${key}:`, err);
    return fallback;
  }
}

/**
 * Safe local storage setter
 */
export function setLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`[LocalStorage] Failed to write key ${key}:`, err);
  }
}
