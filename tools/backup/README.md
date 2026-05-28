# Bookshelf — automatic server-side backup

This is a tiny Node script that pulls your whole Bookshelf out of Firestore and writes
a timestamped JSON snapshot to disk. Run it on your always-on PC/DAS via cron and your
shelf is safe even if your phone is lost, wiped, or the browser evicts its anonymous
login — none of which the in-app export can protect against on its own.

It backs up **every** anonymous user/device under the project (the Admin SDK bypasses
security rules), grouped by user id, so a full restore is always possible.

> This folder is **not** part of the deployed web app. It runs only on your server.

## One-time setup

### 1. Get a service-account key
1. Firebase console → project **bookshelf-anthony** → ⚙️ **Project settings** → **Service accounts**.
2. **Generate new private key** → download the JSON.
3. Save it somewhere private on your server, e.g. `/home/anthony/secrets/bookshelf-sa.json`.
   **Do not put it in this repo** — it grants full database access. (The `.gitignore`
   here already blocks stray key/backup files, but keep it out of git entirely.)

### 2. Install
```bash
cd tools/backup
npm install
```

### 3. Test run
```bash
BOOKSHELF_SA_KEY=/home/anthony/secrets/bookshelf-sa.json \
BOOKSHELF_BACKUP_DIR=/mnt/das/backups/bookshelf \
node backup.mjs
```
You should see something like:
```
Backed up 42 book(s) across 2 user(s) -> /mnt/das/backups/bookshelf/bookshelf-backup-2026-05-28T...json
```

## Configuration (env vars)

| Var | Default | Meaning |
|---|---|---|
| `BOOKSHELF_SA_KEY` | — (required) | Path to the service-account JSON key. `GOOGLE_APPLICATION_CREDENTIALS` works too. |
| `BOOKSHELF_BACKUP_DIR` | `./backups` | Where snapshots are written. Point this at your DAS. |
| `BOOKSHELF_KEEP` | `30` | How many snapshots to keep. `0` = keep everything. |

Each run writes `bookshelf-backup-<timestamp>.json` plus a stable `latest.json`.

## Schedule it (nightly cron, Linux)

```bash
crontab -e
```
Add (runs daily at 03:30):
```cron
30 3 * * * BOOKSHELF_SA_KEY=/home/anthony/secrets/bookshelf-sa.json BOOKSHELF_BACKUP_DIR=/mnt/das/backups/bookshelf /usr/bin/node /path/to/Bookshelf/tools/backup/backup.mjs >> /mnt/das/backups/bookshelf/backup.log 2>&1
```

(On Windows, use Task Scheduler with the same env vars and a `node backup.mjs` action.)

## Restoring

The snapshot JSON is the same shape the app understands. To restore onto a device:

- **Per-user restore:** open `latest.json`, copy the `books` array for the user you want
  into a file shaped like `{ "books": [ ... ] }`, then use **Stats → Import backup** in
  the app on that device.
- The in-app importer dedupes by title/author/profile, so re-importing is safe.

For a bulk/programmatic restore straight back into Firestore, the same Admin SDK
credentials can write the documents back — ask and a `restore.mjs` can be added.
