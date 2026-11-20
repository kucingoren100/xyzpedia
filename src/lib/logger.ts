/**
 * Safe logger that redacts Personally Identifiable Information (PII):
 * emails, phone numbers, and potential sensitive user credentials.
 */

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const INDO_PHONE_REGEX = /(?:\+?62|08)[0-9]{8,12}/g;

export function redactPII(message: any): any {
  if (typeof message !== "string") {
    if (typeof message === "object" && message !== null) {
      try {
        const json = JSON.stringify(message, (key, value) => {
          if (typeof value === "string") {
            if (key.toLowerCase().includes("email")) {
              const [user, domain] = value.split("@");
              return user ? `${user.slice(0, 2)}***@${domain || ""}` : "***";
            }
            if (key.toLowerCase().includes("phone") || key.toLowerCase().includes("whatsapp")) {
              return value.length > 4 ? `${value.slice(0, 4)}***${value.slice(-2)}` : "***";
            }
            if (key.toLowerCase().includes("token") || key.toLowerCase().includes("password") || key.toLowerCase().includes("secret")) {
              return "••••••••";
            }
          }
          return value;
        });
        return JSON.parse(json);
      } catch {
        return message;
      }
    }
    return message;
  }

  return message
    .replace(EMAIL_REGEX, (match) => {
      const [user, domain] = match.split("@");
      return `${user.slice(0, 2)}***@${domain}`;
    })
    .replace(INDO_PHONE_REGEX, (match) => {
      return `${match.slice(0, 4)}***${match.slice(-2)}`;
    });
}

export const logger = {
  info: (msg: string, ...args: any[]) => {
    console.log(`[INFO] ${redactPII(msg)}`, ...args.map(redactPII));
  },
  warn: (msg: string, ...args: any[]) => {
    console.warn(`[WARN] ${redactPII(msg)}`, ...args.map(redactPII));
  },
  error: (msg: string, ...args: any[]) => {
    console.error(`[ERROR] ${redactPII(msg)}`, ...args.map(redactPII));
  },
};
