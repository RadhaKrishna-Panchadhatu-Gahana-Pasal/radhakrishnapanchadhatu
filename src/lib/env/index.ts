/**
 * Type-safe environment variable access.
 * Throws at startup if a required server-side variable is missing.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. Check your .env file.`
    );
  }
  return value;
}

function optionalEnv(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}

// ─── Server-side (never expose to browser) ────────────────────────────────

export const env = {
  // App
  NODE_ENV: optionalEnv("NODE_ENV", "development"),
  APP_TIMEZONE: optionalEnv("APP_TIMEZONE", "Asia/Kathmandu"),

  // Database
  get DATABASE_URL() { return requireEnv("DATABASE_URL"); },

  // Auth
  get AUTH_SECRET() { return requireEnv("AUTH_SECRET"); },
  GOOGLE_CLIENT_ID: optionalEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: optionalEnv("GOOGLE_CLIENT_SECRET"),

  // Email
  RESEND_API_KEY: optionalEnv("RESEND_API_KEY"),
  EMAIL_FROM: optionalEnv("EMAIL_FROM"),

  // Payments
  ESEWA_PRODUCT_CODE: optionalEnv("ESEWA_PRODUCT_CODE"),
  ESEWA_SECRET_KEY: optionalEnv("ESEWA_SECRET_KEY"),
  ESEWA_ENV: optionalEnv("ESEWA_ENV", "sandbox"),

  KHALTI_SECRET_KEY: optionalEnv("KHALTI_SECRET_KEY"),
  KHALTI_ENV: optionalEnv("KHALTI_ENV", "sandbox"),

  FONEPAY_MERCHANT_ID: optionalEnv("FONEPAY_MERCHANT_ID"),
  FONEPAY_SECRET_KEY: optionalEnv("FONEPAY_SECRET_KEY"),

  // Storage
  STORAGE_ENDPOINT: optionalEnv("STORAGE_ENDPOINT"),
  STORAGE_BUCKET: optionalEnv("STORAGE_BUCKET"),
  STORAGE_ACCESS_KEY_ID: optionalEnv("STORAGE_ACCESS_KEY_ID"),
  STORAGE_SECRET_ACCESS_KEY: optionalEnv("STORAGE_SECRET_ACCESS_KEY"),
  STORAGE_PUBLIC_BASE_URL: optionalEnv("STORAGE_PUBLIC_BASE_URL"),

  // Redis
  REDIS_URL: optionalEnv("REDIS_URL"),

  // WhatsApp
  WHATSAPP_ACCESS_TOKEN: optionalEnv("WHATSAPP_ACCESS_TOKEN"),
  WHATSAPP_PHONE_NUMBER_ID: optionalEnv("WHATSAPP_PHONE_NUMBER_ID"),
  WHATSAPP_VERIFY_TOKEN: optionalEnv("WHATSAPP_VERIFY_TOKEN"),
};

// ─── Public (safe for browser) ────────────────────────────────────────────

export const publicEnv = {
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Radha Krishna Panchha Dhatu",
  WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9779846703068",
};
