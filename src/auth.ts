import { logAction } from './activity';
import { todayStr } from './data';
import { createStore } from './persist';

/* Local demo accounts: no server. Passwords are never stored; only a salted SHA-256 hash is kept in this browser. */
export interface User { username: string; hash: string; bio: string; skills: string[]; created: string }
interface AuthState { users: User[]; current: string | null }

const s = createStore<AuthState>('gravebound-auth-v1', { users: [], current: null });
export const useAuth = s.useValue;
export const currentUser = (st: AuthState) => st.users.find((u) => u.username === st.current);

/* Pure-JS SHA-256, used only when the Web Crypto API is unavailable (non-secure contexts). */
function sha256js(text: string): string {
  const bytes = new TextEncoder().encode(text);
  const primes: number[] = [];
  for (let n = 2; primes.length < 64; n++) if (primes.every((p) => n % p)) primes.push(n);
  const K = primes.map((p) => Math.floor((Math.cbrt(p) % 1) * 2 ** 32));
  const H = primes.slice(0, 8).map((p) => Math.floor((Math.sqrt(p) % 1) * 2 ** 32));
  const l = bytes.length;
  const padded = new Uint8Array((((l + 9 + 63) >> 6) << 6));
  padded.set(bytes); padded[l] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 4, (l * 8) >>> 0); dv.setUint32(padded.length - 8, Math.floor((l * 8) / 2 ** 32));
  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));
  const w = new Uint32Array(64);
  for (let i = 0; i < padded.length; i += 64) {
    for (let t = 0; t < 16; t++) w[t] = dv.getUint32(i + t * 4);
    for (let t = 16; t < 64; t++) {
      const s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
      const s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let t = 0; t < 64; t++) {
      const t1 = (h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[t] + w[t]) >>> 0;
      const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
  }
  return H.map((x) => x.toString(16).padStart(8, '0')).join('');
}

export async function sha256(text: string): Promise<string> {
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return sha256js(text);
}
export const __sha256js = sha256js;

const hashPw = (username: string, password: string) => sha256(`gravebound:${username}:${password}`);

/** Returns an error message, or null on success (and signs the new user in). */
export async function register(usernameRaw: string, password: string, bio: string, skills: string[]): Promise<string | null> {
  const username = usernameRaw.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(username)) return 'Username must be 3-20 characters: letters, numbers or underscore.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  if (s.get().users.some((u) => u.username === username)) return 'That username is already taken on this device.';
  const hash = await hashPw(username, password);
  const user: User = { username, hash, bio: bio.trim(), skills, created: todayStr() };
  s.set((st) => ({ users: [...st.users, user], current: username }));
  logAction();
  return null;
}

export async function login(usernameRaw: string, password: string): Promise<string | null> {
  const username = usernameRaw.trim().toLowerCase();
  const u = s.get().users.find((x) => x.username === username);
  if (!u) return 'No builder with that username. Register a pass first.';
  if ((await hashPw(username, password)) !== u.hash) return 'Wrong password. Try again.';
  s.set((st) => ({ ...st, current: username }));
  logAction();
  return null;
}

export const logout = () => s.set((st) => ({ ...st, current: null }));
