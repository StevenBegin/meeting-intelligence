export const DAILY_LIMIT = 5;
export const ANON_COOKIE_NAME = "mi_anon_id";

export function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}
