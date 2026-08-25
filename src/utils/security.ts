/**
 * Enterprise Cryptographic Security Engine for CAD CUTZ & ICE Staff Portal
 * - SHA-256 password hashing with salt using native Web Crypto API
 * - Time-based session management with automatic expiration
 * - Brute-force lockout and rate limiting
 */

const SALT = "CAD_CUTZ_ICE_ATELIER_SECURE_SALT_2026_PH";
const SESSION_DURATION_HOURS = 2; // Session valid for 2 hours
const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;

// Default initial hash for fallback passcode: "CAD123" and "CAD-VIP-2026#"
// We calculate hashes dynamically via Web Crypto
export async function hashPasscode(passcode: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(passcode + SALT);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export interface SecuritySession {
  token: string;
  expiresAt: number; // Unix timestamp in ms
  authenticatedAt: number;
}

export interface LockoutState {
  failedAttempts: number;
  lockedUntil: number | null; // Unix timestamp
}

class SecurityEngine {
  private SESSION_KEY = "cad_atelier_sec_session_v2";
  private HASH_KEY = "cad_atelier_pass_hash_v2";
  private LOCKOUT_KEY = "cad_atelier_lockout_v2";

  // Initial default passcode
  private DEFAULT_PASSCODES = ["CAD123", "CAD-VIP-2026#"];

  /**
   * Initializes or verifies custom password hash
   */
  async verifyPasscode(inputPasscode: string): Promise<boolean> {
    const inputHash = await hashPasscode(inputPasscode.trim());

    // 1. Check custom configured hash in localStorage
    const savedCustomHash = localStorage.getItem(this.HASH_KEY);
    if (savedCustomHash) {
      return inputHash === savedCustomHash;
    }

    // 2. Check default master passcodes
    for (const def of this.DEFAULT_PASSCODES) {
      const defHash = await hashPasscode(def);
      if (inputHash === defHash) {
        return true;
      }
    }

    return false;
  }

  /**
   * Allows authenticated admin to change their master passcode
   */
  async updatePasscode(newPasscode: string): Promise<void> {
    if (newPasscode.length < 5) {
      throw new Error("New passcode must be at least 5 characters long.");
    }
    const newHash = await hashPasscode(newPasscode.trim());
    localStorage.setItem(this.HASH_KEY, newHash);
  }

  /**
   * Creates a cryptographically randomized, time-limited session
   */
  async createSession(): Promise<SecuritySession> {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const token = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const now = Date.now();
    const expiresAt = now + SESSION_DURATION_HOURS * 60 * 60 * 1000;

    const session: SecuritySession = {
      token,
      expiresAt,
      authenticatedAt: now,
    };

    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    this.resetLockout();
    return session;
  }

  /**
   * Validates if current session is active and unexpired
   */
  isSessionValid(): boolean {
    try {
      const sessionRaw = localStorage.getItem(this.SESSION_KEY);
      if (!sessionRaw) return false;

      const session: SecuritySession = JSON.parse(sessionRaw);
      if (!session.token || !session.expiresAt) return false;

      // Check if session has expired
      if (Date.now() > session.expiresAt) {
        this.terminateSession();
        return false;
      }

      return true;
    } catch {
      this.terminateSession();
      return false;
    }
  }

  /**
   * Destroys current session and logs out
   */
  terminateSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem("barber_admin");
  }

  /**
   * Brute-Force Protection & Lockout Tracking
   */
  getLockoutState(): LockoutState {
    try {
      const raw = localStorage.getItem(this.LOCKOUT_KEY);
      if (!raw) return { failedAttempts: 0, lockedUntil: null };

      const state: LockoutState = JSON.parse(raw);
      if (state.lockedUntil && Date.now() > state.lockedUntil) {
        // Lockout expired, reset
        this.resetLockout();
        return { failedAttempts: 0, lockedUntil: null };
      }
      return state;
    } catch {
      return { failedAttempts: 0, lockedUntil: null };
    }
  }

  recordFailedAttempt(): { isLocked: boolean; secondsRemaining: number } {
    const current = this.getLockoutState();
    const failedAttempts = current.failedAttempts + 1;

    let lockedUntil = null;
    let isLocked = false;
    let secondsRemaining = 0;

    if (failedAttempts >= MAX_ATTEMPTS) {
      lockedUntil = Date.now() + LOCKOUT_SECONDS * 1000;
      isLocked = true;
      secondsRemaining = LOCKOUT_SECONDS;
    }

    localStorage.setItem(
      this.LOCKOUT_KEY,
      JSON.stringify({ failedAttempts, lockedUntil })
    );

    return { isLocked, secondsRemaining };
  }

  resetLockout(): void {
    localStorage.removeItem(this.LOCKOUT_KEY);
  }
}

export const securityEngine = new SecurityEngine();
