# Little Paws

A browser-first cat café game prototype. Open `Little Paws.html` directly in a browser, or run `node preview.mjs` and visit http://127.0.0.1:4173. Run `node build-standalone.mjs` to refresh the standalone copy after changes.

## Playable features

- Three sample cats with independent care needs, coats, accessories, and bond levels.
- Petting, inventory-based feeding, play, and rest.
- Offline care decay and sickness. Play with a sick cat is locked until medicine and recovery care are complete.
- Purrfect pairs (memory game) and Treat catcher (20-second reaction game) pay coins even while a cat is sick.
- Food, medicine, and reusable accessories purchased with earned coins.
- Daily care goals, daily digital check-ins, visit streaks, and five-stamp coin bonuses.
- Editable sample names, personalities, coats, and locally stored profile photos.
- Responsive layout, keyboard controls, reduced motion, and browser-local saved progress.
- An original 3D café with shadows, furniture, a garden window, and dimensional cats.
- Mouse/finger drag camera orbit, scroll zoom, arrow-key camera controls, and Reset view.
- Hover or touch strokes pet the cat, increase happiness, and trigger a purring animation. Toggle Sound on for a synthesized purr.
- Compact translucent care, reward, game, and navigation controls over the room.

## Prototype boundaries

The café name and residents are placeholders. All progress is saved in localStorage on this browser/device. No accounts, server database, real purchases, visit verification, bookings, or redeemable café offers are connected. Uploaded photos appear on resident profile cards; the room uses an original 3D cat with the chosen coat and accessory. 3D needs WebGL; care controls and games remain available if it is unavailable. Sound starts off and can be enabled with the Sound button.

The café room and cats are original Three.js models. Resident cards use original SVG illustrations. The design takes broad cozy pet-game inspiration from Capy — Pet Capybara without using its assets. Three.js r160.1 is bundled in `dist/vendor/` with its MIT license.

Care decay per hour: 4 fullness, 2.8 happiness, 1.7 energy. At 15 fullness or 10 happiness, sickness begins. Recovery requires a care kit plus 40 fullness, 40 happiness, and 35 energy. Use How to play → Simulate 24 hours away to try recovery.

The static website is in `dist/`. It needs no package installation. Web fonts are optional; system fonts provide a fallback. Run `node interaction-check.mjs` for the mouse/touch gesture checks.
