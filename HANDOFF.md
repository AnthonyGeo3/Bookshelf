---
project: Bookshelf
owner: Anthony (GitHub: anthonygeo3)
collaborator_profile: Amy (girlfriend — second local profile)
deploy_url: https://anthonygeo3.github.io/Bookshelf/
repo_path: G:\Coding\Bookshelf\Bookshelf\
status: v1 feature-complete
last_updated: 2026-05-29
cache_name: bookshelf-v25
firebase_project: bookshelf-anthony
files:
  - index.html
  - classics.js
  - sw.js
  - manifest.json
  - icons/icon-192.png
  - icons/icon-512.png
  - HANDOFF.md
---

# Bookshelf — Handoff Document

> **Note for future Claude instances:** This is a backup. The canonical context lives in your memory files (look for `project_bookshelf.md`, `feedback_workflow_rules.md`, `feedback_css_pitfalls.md`, `user_anthony_profile.md`). Read those first; this document exists as a safety net if memory isn't loaded and as human-readable reference.
>
> **Note for humans:** This file isn't part of the deployed app. It's a project-state dump for development continuity.

## 1. What this is

A personal Progressive Web App for **Anthony** to track finished books and get reading recommendations. He bought a new Kindle and wanted to justify the spend by making reading visible. The shelf "grows" as he reads. A second profile ("Amy") exists for his girlfriend.

Deployed at `https://anthonygeo3.github.io/Bookshelf/`, installable as a PWA on his Pixel.

## 2. Tech stack

- **Single-page `index.html`** with all CSS/JS inline. No build step. Tailwind CSS via CDN.
- **`classics.js`** — separate non-module script for the 50-book recommendation pool, exposed as `window.CLASSICS`. Loaded before the main module.
- **Firebase Auth (anonymous)** + **Firestore** — modular SDK from gstatic. No login UI.
- **Google Books API** — covers, blurbs, page counts, published dates, categories. API key in code with referrer restriction.
- **PWA** with manual service worker, cache-first shell, network-first for live data hosts.
- **GitHub Pages** deploy under `anthonygeo3`.

## 3. File structure

```
G:\Coding\Bookshelf\Bookshelf\
├── index.html       # The app — markup, CSS (inline <style>), JS (inline <script type="module">)
├── classics.js      # 50-book recommendation pool. Sets window.CLASSICS. Regular <script>, no module.
├── sw.js            # Service worker — cache-first shell, network-first for Google/Firebase hosts
├── manifest.json    # PWA manifest
├── icons/
│   ├── icon-192.png # Homemade-feel book-stack icon
│   └── icon-512.png # Same, larger
├── tools/
│   └── backup/      # SERVER-SIDE only, not deployed. Firebase Admin SDK cron backup.
│       ├── backup.mjs   # Pulls all books from Firestore -> timestamped JSON on the DAS
│       ├── package.json
│       ├── README.md    # Service-account + cron setup
│       └── .gitignore   # Blocks the SA key + backup output from git
└── HANDOFF.md       # This file
```

**Note:** `tools/backup/` runs on Anthony's always-on server, not in the browser, and is
not in `CORE_ASSETS`. The service-account key must never be committed.

### Key code anchors in `index.html`

Search for these strings to locate functionality fast:

| What | Search for |
|---|---|
| Firebase config | `const firebaseConfig` |
| Google Books API key | `const GOOGLE_BOOKS_KEY` |
| Anonymous sign-in + data subscription | `onAuthStateChanged` |
| Cover/details fetcher | `async function fetchBookDetails` |
| Google→chip genre mapper | `function mapGoogleCategoriesToChips` |
| Recommendation engine — score & pick | `function pickRecommendation`, `function buildTasteProfile`, `function scoreCandidate` |
| Mystery modal flow | `async function openMysteryRecommendation`, `pickAndRenderMystery` |
| Backfill (covers/pageCount/genres) | `async function backfillMissingDetails` |
| Add book form submit | `document.getElementById('addForm').addEventListener('submit'` |
| Edit existing review | `function openAddModalForEdit` |
| Shelf rendering + per-row packing | `function renderShelves`, `function packIntoRows` |
| Book DOM element (face vs spine) | `function makeBookEl` |
| Sort + filter | `function sortBooks`, `function populateAuthorFilter` |
| Star picker | `function setRating` |
| Chip groups setup | `const CHIP_GROUPS`, `function setupChipGroup` |
| Profile swap | `function setActiveProfile` |
| View swap (Shelf/Bedside) | `function setActiveView` |
| Currently-reading strip | `function renderReadingStrip`, `function startReading`, `function moveToBedside` |
| Shelf grouping into sections | `function buildSections` (months/authors/genres/page-bands per sort), `function buildShelfEl` |
| View toggle (Shelf ↔ Bedside) | `id="viewToggle"`, `function setActiveView` |
| Stats modal | `function computeStats`, `function renderStats` |
| Backup export/import | `function exportBackup`, `async function importBackup` |
| Auto-tag from pool | `function findInPool`, `function prefillChipsFromPool` |

## 4. Firebase

- **Project:** `bookshelf-anthony`
- **Auth:** Anonymous sign-in only, runs silently. No login UI exists. Each device has its own anonymous UID.
- **Firestore:** Production mode.
- **Security rules:** `match /users/{userId}/{document=**}` with `allow read, write: if request.auth != null && request.auth.uid == userId;` — locks each user's tree to themselves.
- **apiKey:** `AIzaSyAHMaWQRXsAglvgPxsAfR0tmTNzSo67-Y4` — public, this is normal for client-side Firebase.

## 5. Google Books API

- **Key:** `AIzaSyBSlndU-ynvDIPzoPxaB9EjbYbEJSzBjAc`
- **Restrictions:** HTTP referrer locked to `https://anthonygeo3.github.io/*`, API restricted to Books API only.
- **Quota:** Default 1000 queries/day per project. Plenty for personal use (Anthony reads ~1 book/week).
- **Stored as:** `const GOOGLE_BOOKS_KEY` near the top of the module script in `index.html`.

## 6. Data model

### Book document: `/users/{uid}/books/{bookId}`

| Field | Type | Notes |
|---|---|---|
| `title` | string | Book title |
| `author` | string | Author name (may include multiple, joined with ", ") |
| `cover` | string \| null | Google Books thumbnail URL, https-normalised |
| `rating` | 1–5 \| null | Star rating. Null for bedside books (not yet read) |
| `notes` | string | Free-text user notes |
| `genres` | string[] | From chip vocab. Auto-derived from Google's categories on add; user can override |
| `tone` | string[] | From chip vocab |
| `pace` | string \| null | "Slow burn" / "Steady" / "Propulsive" |
| `lengthFelt` | string \| null | "Too short" / "Just right" / "A bit long" / "Way too long" |
| `chapterLength` | string \| null | "Short" / "Medium" / "Long" |
| `pageCount` | number \| null | From Google Books |
| `publishedDate` | string \| null | Raw Google value, e.g. "1949" or "2016-07-26" |
| `status` | "finished" \| "bedside" \| "reading" | Determines where the book appears. "reading" = currently-reading strip atop the Shelf. |
| `profile` | "anthony" \| "amy" | Which profile owns this book |
| `createdAt` | Timestamp | Server timestamp on add |
| `startedAt` | Timestamp \| null | Stamped when status becomes 'reading'. Null otherwise. Used for the "reading for N days" label + avg-days-to-finish stat. |
| `currentPage` | number \| null | Page you're on while `status === 'reading'`. Drives the reading-card progress bar. Set via the reading detail modal. Null otherwise. |
| `completedAt` | Timestamp \| null | Finish date. Defaults to "now" when a book becomes 'finished', but is **user-editable** via the "Date finished" field in the add/edit review form (so backlog books can be backdated). Null for bedside/reading. Falls back to `createdAt` in sort/stats for old books. |
| `spine` | string (hex) | Random colour for spine fallback view |
| `ink` | string (hex) | Random text colour for spine |
| `height` | number (140–190) | Random per-book height in px |
| `width` | number (30–46) | Random per-book width in px (only used for spine display) |
| `detailsAttempted` | boolean | Backfill flag — prevents re-fetching Google Books for books we've already tried |
| `fromRecommendation` | boolean | Set on books added via the mystery tile |

### Chip vocabulary (must match exactly — scorer + filters depend on these)

| Group | Type | Values |
|---|---|---|
| Genre | multi | Literary fiction, Sci-fi, Fantasy, Mystery/Thriller, Horror, Romance, Classic, Historical fiction, Non-fiction, Biography/Memoir, Pop science, Philosophy, Poetry |
| Pace | single | Slow burn, Steady, Propulsive |
| Tone | multi | Dark, Hopeful, Witty, Bleak, Earnest, Playful, Contemplative, Romantic, Tense |
| Length felt | single | Too short, Just right, A bit long, Way too long |
| Chapter length | single | Short, Medium, Long |

## 7. Architecture / key flows

### View model
- **Shelf** (default, cream wall) — finished books
- **Bedside** (dusty-pink wall) — books planned to read, has a mystery "?" tile at the start
- Switched via tabs below the header. Persisted in `localStorage['bookshelf:view']`.
- Each device has its own anonymous Firebase UID. Profile swap (Anthony ↔ Amy) is local to that UID — books are partitioned by `profile` field within the same Firestore tree.

### Add book flow
1. Tap **+** FAB or the empty-slot "+" in a shelf row → `openAddModal` opens the modal
2. Search input → `runBookSearch` (debounced 500ms, min 4 chars) calls Google Books API
3. User clicks a result → `selectSearchResult` stores it in `selectedBook`, hides the search, shows the selected card, and **pre-selects genre chips** from Google's mapped categories
4. User sets rating (star picker), adjusts chips, writes notes
5. Save → `addDoc` with all fields including auto-derived genres if user hasn't picked any
6. Modal closes, `onSnapshot` fires, shelf re-renders

### Edit existing review
1. Tap a finished book → detail modal shows pills + small purple "Edit review" link
2. → `openAddModalForEdit(b)` — pre-fills everything (chips via `CSS.escape` selectors, rating via `setRating`, notes), sets `dataset.editing = b.id`
3. User changes what they want, saves → `updateDoc` (not `addDoc`) so original metadata is preserved
4. The form's `data-editing` attribute is the toggle between addDoc/updateDoc in form submit

### Mystery recommendation
1. Tap the plum "?" tile on Bedside → `openMysteryRecommendation`
2. `pickAndRenderMystery` builds taste profile from user's **finished** books, picks a candidate from `window.CLASSICS` excluding already-known books
3. 25% of the time it's a "stretch" (picks from bottom 40% of scored candidates)
4. Otherwise weighted-random from top 5 (gives variety vs always picking #1)
5. `fetchBookDetails` pulls cover + blurb + pageCount + year + categories from Google Books (cached per session)
6. Modal renders cover, title, author+year, genre pills (from CLASSICS tagging), "X pages · pace · chapter length" meta line, blurb (truncated at sentence boundary near 280 chars), reasoning text
7. "Try another" → re-rolls; "Add to bedside" → saves with status='bedside'

### Move bedside → shelf
1. Tap a bedside book → detail modal shows "I've read this — move to shelf" button
2. → closes detail modal, opens the add/edit modal pre-filled (`openAddModalForEdit`)
3. User reviews (rating, chips, notes), saves
4. `updateDoc` flips status to 'finished' AND stamps `completedAt = serverTimestamp()`
5. Book disappears from bedside, appears on shelf

### Sort = grouped sections (both views) — redesigned 2026-05-29
- One `sort by` control (funnel). Picking a sort **groups the shelves into labelled sections** via `buildSections`:
  - **most recent** → month sections ("May 2026"), newest first
  - **author** → author sections, alphabetical
  - **genre** → primary-genre sections (untagged last)
  - **length** → 100-page bands ("Under 100 pages", "100–199 pages", … unknown last)
- The old separate **author filter dropdown was removed** — author *grouping* replaces it.
- Sort choice stored in `localStorage['bookshelf:sort']`. Applies to both views.

### Header + navigation — redesigned 2026-05-29
- Condensed header: title + subtitle left; `stats` + `profile` icons top-right; a single **view-toggle button** beneath them ("Go to Bedside →" / "← Back to Shelf"). The old two-tab `.view-switcher` is gone; the purple wall tells you you're on Bedside.
- Books render **spread evenly across the plank** (`justify-content: space-evenly`), rows tighter together. The mystery "?" tile sits on its own pinned shelf at the top of Bedside.

### Backfill (one-shot per session)
- After auth resolves and books load, `backfillMissingDetails` runs once
- For every book without `detailsAttempted: true`, fetches Google Books and fills in any missing cover/pageCount/publishedDate/genres
- Marks `detailsAttempted: true` after — never re-fetches, even if results were null

## 8. Features built (v1)

- [x] Visual bookshelf with wooden plank rendering, dynamic per-row packing based on container width
- [x] Books render face-out (cover) when cover exists, spine-out (random colour + title) as fallback
- [x] ResizeObserver re-renders shelves on orientation/window change
- [x] Two profiles (Anthony / Amy) via header chip swap, per-device
- [x] Two views (Shelf / Bedside) via tabs, with visual differentiation
- [x] Add-book search via Google Books with autocomplete
- [x] "Add manually" fallback for obscure books
- [x] Tagged review form: 5-star picker, Genre/Pace/Tone/Length-felt/Chapter-length chips, notes
- [x] Auto-genre-tag from Google categories on add (user can override)
- [x] Edit existing review (pre-fills everything)
- [x] Move bedside → shelf with proper completedAt stamping
- [x] Delete book / remove from bedside
- [x] Mystery recommendation tile (plum "?") on Bedside
- [x] Recommendation engine with taste profile + scoring + stretch picks + weighted random top-5
- [x] Mystery card with cover, blurb, page count, pace, chapter length, genre pills, reasoning
- [x] Sort by Most recent / Author / Genre / Length on both views
- [x] Filter by author on both views
- [x] Cover/details backfill for legacy books (one-shot per session)
- [x] PWA with cache-first shell, installable on mobile
- [x] Firestore security rules locking everything to owning user
- [x] **Currently-reading** strip atop the Shelf (status "reading"; bedside→reading→finished; `startedAt` stamping) — *added 2026-05-28*
- [x] **Stats** modal (chart icon in header): totals, finished this year, pages read, avg rating, avg pages/book, avg days-to-finish, finished-per-month bars, top-genre bars — *added 2026-05-28*
- [x] **Backup/restore**: in-app one-tap JSON Export/Import (in the Stats modal) + server-side `tools/backup` cron script (Firebase Admin SDK) — *added 2026-05-28*
- [x] **Auto-tagging**: adding a book that matches the curated pool pre-fills genre/tone/pace/chapter chips (Google categories as genre backstop); full manual override — *added 2026-05-28*
- [x] Recommendation pool expanded from 50 classics to ~90 incl. modern bestsellers/popular titles — *added 2026-05-28*

## 9. Deliberate non-features (don't re-suggest unprompted)

These have been explicitly rejected or scoped out. Adding them would be a regression of intent.

- ❌ **Difficulty rating** — Anthony rejected on 2026-05-22. No standardised reading-level source (Lexile is paywalled, Flesch-Kincaid needs full text we don't have). Guesses didn't add value.
- ❌ **Cross-device sync / login UX** — explicit reject. Anthony: "I dislike how you have to login to every website these days." Each device is its own world. **Note:** backup/restore now exists (in-app JSON export/import + server-side cron pull) — that is *not* login/sync, just data safety, and was explicitly wanted.
- ❌ **Editing book title/author** — only review fields are editable. Wrong-book = delete + re-add.
- ❌ **Per-view sort/filter state** — shared between views for now. Easy to split if asked.
- ✅ ~~**Currently-reading status**~~ — **now built (2026-05-28).** Third status "reading", surfaced as a highlighted strip at the top of the Shelf. bedside → reading → finished, with `startedAt`/`completedAt` stamping.
- ❌ **Recommendation engine scoring by chapter length or pageCount** — these are display-only. Could be added if asked but currently not factored into scoring weights.
- ❌ **Half-star ratings** — integer 1–5 only.
- ❌ **AI-polished assets** — homemade is the aesthetic. Don't pitch Claude Design / Gemini Image for icon redesigns.

## 10. Operating rules (Anthony's workflow)

Hard rules, no exceptions:

1. **Never run `git` from the sandbox.** Leaves stale `.git/index.lock` files that block GitHub Desktop commits. Read/Write/Edit only against `G:\Coding\Bookshelf\Bookshelf\`.
2. **Never auto-commit.** Anthony reviews every change in GitHub Desktop before committing. Summarise changes and stop — he commits when satisfied.
3. **One change at a time.** He prefers reviewing diffs in small chunks. Resist the urge to "also fix X while I'm here."
4. **Always bump `CACHE_NAME` in `sw.js`** when any asset in `CORE_ASSETS` changes. The service worker won't ship new files otherwise.
5. **Concise direct help.** Skip flowery preamble. Tell him what changed, point at what to review, stop. No trailing summaries of obvious stuff.

## 11. CSS/JS pitfalls to remember

- `backdrop-filter`/`filter`/`transform` on an ancestor breaks `position: fixed` in descendants. Don't nest fixed elements inside a glassmorphic parent.
- `cache.addAll` in a service worker is atomic — one bad URL kills the whole install. Use `Promise.allSettled` around `cache.add()` for CDN URLs.
- Leaflet's `invalidateSize()` on mobile often needs to fire multiple times after a resize (rAF + a couple of `setTimeout` follow-ups).

## 12. Open items / immediate context

**As of this handoff (2026-05-22):**

- All requested features built and shipped through v19 of the cache.
- Most recent change: extracted `CLASSICS` array from `index.html` into `classics.js` to reduce per-turn context size.
- Memory was refreshed comprehensively (see `project_bookshelf.md` in memory store).
- Anthony asked to condense the conversation but couldn't find the option in Cowork UI — hence this handoff doc as the alternative.
- **No outstanding work items.** Project is in a stable, fully-tested state.

**As of 2026-05-28:** large feature pass landed on branch `claude/handoff-file-review-TJoEK` — currently-reading status, stats modal, backup/restore (in-app + server cron), auto-tagging from the pool, expanded recommendation pool, plus small bug fixes (a11y rating label, spine width floor, author-filter rebuild memoisation). Cache bumped to v20.

**Possible future asks Anthony has hinted at (remaining):**
- ✅ ~~Expand the CLASSICS list~~ — done (now ~90 titles incl. bestsellers).
- ✅ ~~Stats page~~ — done.
- ✅ ~~"Currently reading" 3rd status~~ — done.
- Show pageCount in the book detail modal (currently stored + sortable but not displayed)
- Sort by chapter length (would be a 4th sort option, ordered Short → Medium → Long)
- Factor pageCount + chapterLength preferences into the mystery recommendation scoring
- `restore.mjs` companion to the backup script for bulk programmatic restore into Firestore

## 12.5 Changelog — v20 → v25 (2026-05-28 → 05-29)

Cache versions map 1:1 to shipped batches. All on branch `claude/handoff-file-review-TJoEK`.

- **v20 — Major feature pass** *(PR #1)*
  - Currently-reading status (`reading`) — strip atop the Shelf; bedside → reading → finished, `startedAt` stamped.
  - Stats modal (header chart icon): totals, finished-this-year, pages read, avg rating, avg pages/book, avg days-to-finish, finished-per-month + top-genre bars. Pure CSS.
  - In-app backup: one-tap JSON Export/Import in the Stats modal (dedupes by title/author/profile; ISO timestamps).
  - Server-side backup: `tools/backup/` Node + Admin SDK cron script → timestamped JSON, with README.
  - Recommendation pool grown ~50 → ~90 (hand-tagged modern bestsellers).
  - Auto-tagging: pool-matched adds pre-fill genre/tone/pace/chapter chips (Google categories back up genre); overridable.
  - Fixes: "rated null of 5" a11y label; spine-out min width; author-filter rebuild memoised; bedside/reading no longer store phantom 5-star.
- **v21 — Editable finish date**
  - "Date finished" field in the add/edit review form (defaults today, capped today). Drives most-recent sort + stats. Detail shows "finished <date>".
- **v22 — Visual redesign** *(PR #2)*
  - Condensed header; single view-toggle button replaces the two tabs (wall colour signals the view).
  - Sort = labelled sections via `buildSections`: months / authors / genres / 100-page bands. Separate author-filter dropdown removed.
  - Books spread evenly across the plank; rows tightened; mystery "?" tile pinned to its own shelf atop Bedside.
  - Currently-reading card gains a progress bar; `currentPage` field + setter in the reading detail.
- **v23 — Mystery-book tags fix** *(PR #3)* — mystery-added books inherit the pool's genres/tone/pace/chapter (no longer "Untagged").
- **v24 — Total pages for reading books** *(PR #3)* — editable "of N pages" total in the reading detail (Google omits page count for some editions); live bar update.
- **v25 — Editable Pages field** *(PR #4)* — Pages field in the add/edit review form to correct wrong Google counts; feeds length bands + page stats.

> Verification note: this range was checked via JS syntax checks + real-CSS render previews, not a live Firebase run (not reachable from the dev sandbox) — Anthony was the live tester.

## 13. Quick onboarding checklist (first interaction in a future session)

1. Read your memory files. `project_bookshelf.md` is the canonical context.
2. If memory seems stale or empty, read this `HANDOFF.md` end-to-end.
3. `Read` the current `sw.js` to get the live `CACHE_NAME` value.
4. Don't `Read` the full `index.html` unless you need to — it's large. Use the search anchors in section 3 to jump to specific functions.
5. Confirm with Anthony what he wants to do before making edits.
6. If you find yourself about to re-suggest a non-feature from section 9, **stop and double-check**.

## 14. Glossary

- **Bedside** — the second view, for books Anthony plans to read. Cute name chosen deliberately ("books wait on the bedside table to be picked up"). Visually differentiated by dusty-pink wall colour.
- **Shelf** — the main view, for finished books. Cream-coloured wall with wooden planks.
- **Mystery tile** — the plum/purple "?" book at the start of the Bedside row. Tapping it surfaces a recommendation from the classics pool.
- **Stretch pick** — a recommendation deliberately picked from the bottom 40% of scored candidates. Fires 25% of the time. Implements Anthony's original "books I wouldn't obviously pick" requirement.
- **Convert** — moving a bedside book to the shelf, via "I've read this" button. Same underlying mechanism as Edit.
- **Backfill** — the one-shot per-session function that fills in missing Google Books data (cover, pageCount, year, genres) for any book that hasn't been attempted before.
- **detailsAttempted** — the flag on a book doc that says "we've tried to fetch its details from Google Books; don't try again even if values are null".
- **CLASSICS** — the 50-book recommendation pool. Lives in `classics.js`, exposed as `window.CLASSICS`.

---

*Last full update: 2026-05-22. If you're picking this up significantly later, expect drift — sanity-check against the actual files before trusting any specifics.*
