/**
 * Shared utilities for the admin panel.
 * `cn` merges Tailwind classnames safely (last wins on conflict).
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
