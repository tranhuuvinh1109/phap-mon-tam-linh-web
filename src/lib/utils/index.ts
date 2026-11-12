import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export * from "./audio";
export * from "./format-time";
export * from "./html";
export * from "./important-date-description";
export * from "./slugify";
