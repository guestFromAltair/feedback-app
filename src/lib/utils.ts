import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSafeRedirect(url: string | null | undefined, fallback: string): string {
  if (!url) return fallback;

  const isSafe = url.startsWith('/') && !url.startsWith('//');

  return isSafe ? url : fallback;
}
