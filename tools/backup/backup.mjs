/*
 * Bookshelf — server-side backup
 * ------------------------------
 * Pulls every book document straight out of Firestore using the Firebase Admin SDK
 * and writes a timestamped JSON snapshot to disk. Designed to run unattended on an
 * always-on machine (cron / Task Scheduler) so the shelf is backed up even if the
 * phone never opens the app.
 *
 * It reads ALL users' books via a collection-group query (the Admin SDK bypasses the
 * Firestore security rules), grouped by anonymous user id — so a lost/replaced device
 * is fully recoverable.
 *
 * Setup lives in README.md. In short:
 *   1. Create a service-account key in the Firebase console and save the JSON somewhere
 *      private (NOT in this repo).
 *   2. Point BOOKSHELF_SA_KEY at it (or use GOOGLE_APPLICATION_CREDENTIALS).
 *   3. `npm install` in this folder, then `node backup.mjs`.
 *   4. Schedule it (cron example in README).
 *
 * Env vars:
 *   BOOKSHELF_SA_KEY      Path to the service-account JSON key. (Falls back to
 *                         GOOGLE_APPLICATION_CREDENTIALS if set.)
 *   BOOKSHELF_BACKUP_DIR  Where to write snapshots. Default: ./backups
 *   BOOKSHELF_KEEP        How many snapshots to retain. Default: 30 (0 = keep all).
 */

import { readFileSync, mkdirSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { join, isAbsolute } from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const KEY_PATH = process.env.BOOKSHELF_SA_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS;
const BACKUP_DIR = process.env.BOOKSHELF_BACKUP_DIR || join(process.cwd(), 'backups');
const KEEP = process.env.BOOKSHELF_KEEP != null ? parseInt(process.env.BOOKSHELF_KEEP, 10) : 30;

if (!KEY_PATH) {
  console.error('No service-account key. Set BOOKSHELF_SA_KEY (or GOOGLE_APPLICATION_CREDENTIALS) to the key JSON path.');
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(isAbsolute(KEY_PATH) ? KEY_PATH : join(process.cwd(), KEY_PATH), 'utf8'));
} catch (e) {
  console.error(`Could not read service-account key at "${KEY_PATH}":`, e.message);
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// Firestore Timestamps -> ISO strings, recursively, so the snapshot is portable and
// matches the shape the app's in-browser Import expects.
function normalise(value) {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(normalise);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = normalise(v);
    return out;
  }
  return value;
}

async function run() {
  const snap = await db.collectionGroup('books').get();
  const users = {};
  let count = 0;
  snap.forEach(docSnap => {
    // Path is users/{uid}/books/{bookId} — grab the owning uid.
    const uid = docSnap.ref.parent.parent?.id || 'unknown';
    (users[uid] ||= []).push({ id: docSnap.id, ...normalise(docSnap.data()) });
    count++;
  });

  mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const payload = {
    app: 'bookshelf',
    version: 1,
    exportedAt: new Date().toISOString(),
    userCount: Object.keys(users).length,
    bookCount: count,
    users,
  };
  const file = join(BACKUP_DIR, `bookshelf-backup-${stamp}.json`);
  writeFileSync(file, JSON.stringify(payload, null, 2));
  // A stable "latest" pointer for convenience.
  writeFileSync(join(BACKUP_DIR, 'latest.json'), JSON.stringify(payload, null, 2));
  console.log(`Backed up ${count} book(s) across ${payload.userCount} user(s) -> ${file}`);

  // Retention: keep the most recent KEEP snapshots (latest.json is exempt).
  if (KEEP > 0) {
    const snaps = readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('bookshelf-backup-') && f.endsWith('.json'))
      .sort();
    const stale = snaps.slice(0, Math.max(0, snaps.length - KEEP));
    for (const f of stale) rmSync(join(BACKUP_DIR, f));
    if (stale.length) console.log(`Pruned ${stale.length} old snapshot(s), keeping ${KEEP}.`);
  }
}

run().catch(err => { console.error('Backup failed:', err); process.exit(1); });
