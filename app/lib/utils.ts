import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// utils/cookies.js
export function setCookie(name: string, value: string, options = {}) {
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  for (const [key, option] of Object.entries(options)) {
    if (option) {
      cookieString += `; ${key}`;
      if (option !== true) {
        cookieString += `=${option}`;
      }
    }
  }

  document.cookie = cookieString;
}

export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

export const createColumns = (keys: string[]) => {
  return keys.map((key) => {
    return {
      key,
      title: key,
    };
  });
};
