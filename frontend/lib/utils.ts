import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Change currency to MMK
export function currencyToMMK(value: number) {
  return value * 3600;
}
