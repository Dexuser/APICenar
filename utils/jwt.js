import crypto from "crypto";

const DEFAULT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
const DEFAULT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret";

function parseExpiresIn(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string" || !value.trim()) {
    return 60 * 60 * 24;
  }

  const trimmedValue = value.trim();
  const match = trimmedValue.match(/^(\d+)([smhd])?$/i);

  if (!match) {
    return 60 * 60 * 24;
  }

  const amount = Number(match[1]);
  const unit = (match[2] || "s").toLowerCase();

  switch (unit) {
    case "m":
      return amount * 60;
    case "h":
      return amount * 60 * 60;
    case "d":
      return amount * 60 * 60 * 24;
    case "s":
    default:
      return amount;
  }
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf-8");
}

function sign(payload, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
}

function decodeToken(token) {
  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid token format.");
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const header = JSON.parse(base64UrlDecode(encodedHeader));
  const payload = JSON.parse(base64UrlDecode(encodedPayload));

  return {
    header,
    payload,
    signature,
    signedContent: `${encodedHeader}.${encodedPayload}`,
  };
}

export function signAccessToken(user) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresInSeconds = parseExpiresIn(DEFAULT_EXPIRES_IN);
  const payload = {
    sub: user._id.toString(),
    role: user.role,
    email: user.email,
    userName: user.username,
    iat: issuedAt,
    exp: issuedAt + expiresInSeconds,
  };
  const header = {
    alg: "HS256",
    typ: "JWT",
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signedContent = `${encodedHeader}.${encodedPayload}`;
  const signature = sign(signedContent, DEFAULT_SECRET);

  return `${signedContent}.${signature}`;
}

export function verifyAccessToken(token) {
  const { header, payload, signature, signedContent } = decodeToken(token);

  if (header.alg !== "HS256") {
    throw new Error("Invalid token algorithm.");
  }

  const expectedSignature = sign(signedContent, DEFAULT_SECRET);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    throw new Error("Invalid token signature.");
  }

  if (payload.exp && payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired.");
  }

  return payload;
}

export function getTokenExpirationDate(token) {
  try {
    const { payload } = decodeToken(token);

    if (!payload?.exp) {
      return null;
    }

    return new Date(payload.exp * 1000);
  } catch {
    return null;
  }
}
