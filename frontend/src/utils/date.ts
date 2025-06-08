// frontend/src/utils/date.ts
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export const formatDateRelative = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: fr });
};

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "PPp", { locale: fr });
};

export const formatDateShort = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "P", { locale: fr });
};

export const formatTimeOnly = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "p", { locale: fr });
};

export const isToday = (date: string | Date): boolean => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const today = new Date();
  return dateObj.toDateString() === today.toDateString();
};

export const isThisWeek = (date: string | Date): boolean => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  return dateObj >= weekAgo && dateObj <= today;
};
