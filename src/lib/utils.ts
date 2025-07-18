import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Standard utility function for combining Tailwind classes.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
