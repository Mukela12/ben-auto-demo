import type { NextRequest } from "next/server";

export const ADMIN_SESSION_COOKIE = "benauto_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12;

export type AdminSession = {
  email: string;
  role: "admin";
  exp: number;
};

function getAdminAuthSecret() {
  const secret = process.env.ADMIN_AUTH_SECRET;
  if (!secret) {
    throw new Error("ADMIN_AUTH_SECRET is not configured");
  }

  return secret;
}

function getConfiguredAdminEmail() {
  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    throw new Error("ADMIN_EMAIL is not configured");
  }

  return email.trim().toLowerCase();
}

function getConfiguredAdminPassword() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD is not configured");
  }

  return password;
}

function encodeBase64Url(input: string | Uint8Array) {
  if (typeof input === "string") {
    return encodeBase64Url(new TextEncoder().encode(input));
  }

  if (typeof Buffer !== "undefined") {
    return Buffer.from(input).toString("base64url");
  }

  let binary = "";
  for (const byte of input) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(input: string) {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(input, "base64url"));
  }

  const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function getSigningKey() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getAdminAuthSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function signValue(value: string) {
  const key = await getSigningKey();
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return encodeBase64Url(new Uint8Array(signature));
}

async function verifyValue(value: string, signature: string) {
  const key = await getSigningKey();
  return crypto.subtle.verify(
    "HMAC",
    key,
    decodeBase64Url(signature),
    new TextEncoder().encode(value)
  );
}

function parseCookieHeader(cookieHeader: string | null | undefined) {
  const cookies = new Map<string, string>();

  if (!cookieHeader) {
    return cookies;
  }

  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (!name || rest.length === 0) {
      continue;
    }

    cookies.set(name, decodeURIComponent(rest.join("=")));
  }

  return cookies;
}

export function isAdminAuthConfigured() {
  return Boolean(
    process.env.ADMIN_AUTH_SECRET &&
      process.env.ADMIN_EMAIL &&
      process.env.ADMIN_PASSWORD
  );
}

export function getAdminIdentity() {
  return {
    email: getConfiguredAdminEmail(),
    role: "admin" as const,
  };
}

export function validateAdminCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const configuredEmail = getConfiguredAdminEmail();
  const configuredPassword = getConfiguredAdminPassword();

  let mismatch = normalizedEmail.length ^ configuredEmail.length;
  const emailLength = Math.max(normalizedEmail.length, configuredEmail.length);
  for (let index = 0; index < emailLength; index += 1) {
    mismatch |=
      (normalizedEmail.charCodeAt(index) || 0) ^
      (configuredEmail.charCodeAt(index) || 0);
  }

  mismatch |= password.length ^ configuredPassword.length;
  const passwordLength = Math.max(password.length, configuredPassword.length);
  for (let index = 0; index < passwordLength; index += 1) {
    mismatch |=
      (password.charCodeAt(index) || 0) ^
      (configuredPassword.charCodeAt(index) || 0);
  }

  return mismatch === 0;
}

export async function createAdminSessionToken(identity = getAdminIdentity()) {
  const payload: AdminSession = {
    email: identity.email,
    role: identity.role,
    exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE,
  };

  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = await signValue(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminSessionToken(token: string | null | undefined) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const valid = await verifyValue(encodedPayload, signature);
  if (!valid) {
    return null;
  }

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(decodeBase64Url(encodedPayload))
    ) as AdminSession;

    if (
      payload.role !== "admin" ||
      payload.email !== getConfiguredAdminEmail() ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getAdminSessionFromCookieHeader(
  cookieHeader: string | null | undefined
) {
  const token = parseCookieHeader(cookieHeader).get(ADMIN_SESSION_COOKIE);
  return verifyAdminSessionToken(token);
}

export async function getAdminSessionFromRequest(request: Request) {
  return getAdminSessionFromCookieHeader(request.headers.get("cookie"));
}

export async function getAdminSessionFromNextRequest(request: NextRequest) {
  return verifyAdminSessionToken(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  );
}
