# SpeedGame

**Current package:** 1.2.0

SpeedGame is a Vue 3 card game inspired by classic Speed. Race a computer opponent to empty five hand slots and your draw pile using keyboard, mouse, or touch controls.

## Version 1.2 highlights

- Natural AI reaction ranges instead of fixed delays
- Difficulty-based AI mistakes that animate without changing card state
- Visible `NO MOVES → 1 → 2 → REVEAL` deadlock sequence
- Separate player-left and computer-right reserve piles
- Four optional match settings
- Standard, Custom, Practice, and migrated Legacy statistics
- Guided Practice mode
- Mouse, click, tap, and mobile support
- Improved legal-move hints, selection feedback, accessibility announcements, and short-screen layouts
- Clean committed `docs` build for GitHub Pages

The visual design uses an original industrial-mecha palette with weathered red, brass, olive, teal, and parchment. No Xenogears artwork, logos, characters, fonts, music, or other copyrighted assets are included.

## Requirements

- Node.js 20 or newer; Node.js 22 LTS is recommended
- npm 9 or newer
- A modern browser

## Install and run

Run the package check first, then install from the committed public-registry lockfile:

```bash
npm run doctor
npm ci
npm run dev
```

`npm ci` is preferred for a clean, repeatable install. If an earlier attempt created a partial `node_modules` folder, remove it before running `npm ci`.

Windows PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm run doctor
npm ci
npm run dev
```

macOS or Linux:

```bash
rm -rf node_modules
npm run doctor
npm ci
npm run dev
```

## Modes

### Quick Game

Choose Easy, Normal, or Hard and race the computer. A match is classified as **Standard** only when all default settings are used. Changing any setting classifies it as **Custom**.

### Guided Practice

Practice teaches card selection, center-pile placement, and slot refilling. Opponent cards and legal hints are shown, the AI waits through the tutorial, and then continues at a slow natural pace. Practice results are not ranked.

### Timed Challenge

Visible on the home screen as a future mode and currently disabled.

## Match settings

- **Show opponent cards:** reveal the computer hand
- **Allow AI mistakes:** enable difficulty-based failed attempts
- **Highlight legal moves:** mark playable cards and valid center piles
- **Auto-refill empty slots:** refill a newly emptied player slot after 400 ms

The Standard preset is:

- Opponent cards hidden
- AI mistakes enabled
- Legal hints disabled
- Manual refill

## Controls

### Keyboard

- Press `1` through `5` to select an occupied hand slot.
- Press `Left Arrow` or `Right Arrow` within the selection window to play on that center pile.
- Press the number of an empty slot to draw one replacement card.
- Press the selected number again to cancel.
- Press `Escape` to pause or resume a manually paused match.

### Mouse and touch

- Click or tap an occupied card to select it.
- Click or tap the selected card again to cancel.
- Click or tap the left or right center pile to attempt the play.
- Click or tap an empty slot to draw.

Native button clicks handle mouse, stylus, and touch input. Separate touch handlers are intentionally avoided so one tap cannot trigger two actions.

## Rules

- Play a card exactly one rank higher or lower than a center card.
- Suits and colors do not affect legality.
- Ace connects to both 2 and King.
- Refill empty hand slots from the participant's draw pile.
- The first participant with no hand cards and no draw cards wins.
- When neither participant can play or refill, input pauses and the reserve sequence appears.
- The player's reserve always feeds the left center pile.
- The computer's reserve always feeds the right center pile.
- Buried center cards are recycled when reserve cards run out.
- An unrecoverable stall ends as a draw.

## Computer behavior

Each AI action samples a fresh delay from its difficulty range:

- Easy: 1.5–2.2 seconds; 12% mistake chance
- Normal: 0.9–1.4 seconds; 5% mistake chance
- Hard: 0.45–0.8 seconds; 1% mistake chance
- Guided Practice after the tutorial: 2.6–3.8 seconds; no mistakes

A mistake selects an occupied computer card and an illegal center pile, animates the failed attempt, returns the card, and changes no game data. The AI cannot intentionally fail twice in succession.

## Statistics

Statistics are stored locally in the browser:

- **Standard:** default Quick Game settings
- **Custom:** any modified Quick Game setting
- **Practice:** not ranked
- **Legacy:** totals migrated from the previous v1 storage format

Standard and Custom best times are kept separately by difficulty. Existing v1 totals are preserved rather than discarded or mixed into new records.

## Tests

Run the complete automated suite:

```bash
npm test
```

Run tests and the production build together:

```bash
npm run check
```

The suite covers card rules, dealing, card conservation, AI legality and mistakes, natural reaction ranges, deadlock sequencing, reserve ownership, recycling, auto-refill cancellation, Practice gating, statistics separation, v1 migration, pointer/touch regressions, responsive breakpoints, and public npm registry configuration.

## Production build

```bash
npm run build
```

Vite writes a clean production site to `docs/`. The output uses relative asset paths and Vue Router hash history so it works as a GitHub Pages project site and inside an iframe.

Do not edit generated files in `docs/` manually. Change files under `src/`, then rebuild.

## GitHub Pages deployment

1. Run `npm run check`.
2. Commit the source files and generated `docs/` folder.
3. Push to the `main` branch of `officialjivaro/SpeedGame`.
4. Open the repository's **Settings → Pages**.
5. Choose **Deploy from a branch**.
6. Select `main` and `/docs`.
7. Save and verify the published URL.

## Iframe example

```html
<iframe
  src="https://officialjivaro.github.io/SpeedGame/"
  title="SpeedGame"
  width="100%"
  height="720"
  allow="fullscreen"
></iframe>
```

The child app intentionally has no document-level scrollbars. Recommended minimum game areas are approximately 340 × 560 in portrait or 560 × 330 in landscape. The parent page must provide the iframe dimensions.

If the iframe uses `sandbox`, allow scripts and user-activated top navigation so the **Games** link can open `https://jivaro.net/games` in the top page.

## Architecture

- `src/game/` contains framework-independent cards, deck, rules, engine, and AI logic.
- `src/stores/game.js` is the single source of truth for the active match.
- `src/composables/` owns cancellable input, opponent, deadlock, and auto-refill timing.
- `src/config/` contains modes, difficulty ranges, and match settings.
- `src/services/` isolates local persistence and statistics migration.
- `src/components/` contains layout, home, game, Practice, and results presentation.
- `tests/` contains deterministic Vitest coverage.

Supabase, accounts, online leaderboards, multiplayer, sound, achievements, match history, and Timed Challenge gameplay remain intentionally deferred.
