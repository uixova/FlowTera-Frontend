/**
 * Demo mode detection.
 *
 * Demo accounts can VIEW everything (enterprise features visible) but
 * CANNOT create/modify any data — all write actions show a signup prompt.
 * Mock data is served from the backend seed and is read-only.
 */

/** Emails that identify demo accounts. */
export const DEMO_EMAILS: ReadonlySet<string> = new Set([
    "demo@flowtera.app",
    "admin@flowtera.app",
]);

/** True if the given email belongs to a demo account. */
export function isDemoUser(email?: string | null): boolean {
    if (!email) return false;
    return DEMO_EMAILS.has(email.trim().toLowerCase());
}

/** True if the current session is a demo session (set on login). */
export function isDemoMode(): boolean {
    return sessionStorage.getItem('is_demo') === 'true';
}
