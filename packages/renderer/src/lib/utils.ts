import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Hàm tiện ích kết hợp các class name từ clsx và tailwind-merge
 * Cho phép kết hợp và ghi đè các class Tailwind một cách thông minh
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
