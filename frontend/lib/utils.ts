import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency conversion from USD to MMK (Myanmar Kyat)
// Using a rough conversion rate for demo purposes
export function currencyToMMK(usdAmount: number): string {
  const mmkRate = 2100; // Example rate: 1 USD = 2100 MMK
  const mmkAmount = usdAmount * mmkRate;
  return mmkAmount.toLocaleString('en-US');
}