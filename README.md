# Little Beans Cat Cafe

A browser-first cat café game prototype. Run `node build-standalone.mjs` to create `Little Paws.html`, which opens directly in a browser, or run `node preview.mjs` and visit http://127.0.0.1:4173. Run `node build-standalone.mjs` to refresh the standalone copy after changes.

## Playable features

- Seventeen cats named from the supplied Little Beans poster, with actual reference-photo portraits and independent care needs, coats, accessories, and bond levels.
- Petting, play, rest, and inventory-based feeding from a compact, non-blocking cupboard menu. Escape or an outside click closes it; the room keeps running.
- Offline care decay and sickness. Play with a sick cat is locked until medicine and recovery care are complete.
- Purrfect pairs (memory game) and Treat catcher (20-second reaction game) pay coins even while a cat is sick.
- Food, medicine, and reusable accessories purchased with earned coins.
- Daily care goals, daily digital check-ins, visit streaks, and five-stamp coin bonuses.
- Editable resident profiles, coats, and locally stored replacement photos.
- Responsive layout, keyboard controls, reduced motion, and browser-local saved progress.
- An original 3D café with shadows, furniture, a garden window, and dimensional cats.
- Mouse/finger drag camera orbit, scroll zoom, arrow-key camera controls, and Reset view.
- Hover or touch strokes pet the cat, increase happiness, and trigger a purring animation. Toggle Sound on for the recorded purr.
- Compact translucent care, reward, game, and navigation controls over the room.
- One sound toggle controls real recorded purring and feeding, gentle UI clicks, resting chimes, and relaxed café music. Audio starts off and pauses when the tab is hidden.

## Prototype boundaries

The café identity, logo, and resident references are supplied by the user. The poster is a historical reference, not a live availability list. All progress is saved in localStorage on this browser/device. No accounts, server database, real purchases, visit verification, bookings, or redeemable café offers are connected. Uploaded photos appear on resident profile cards; the room uses an original 3D cat with the chosen coat and accessory. 3D needs WebGL; care controls and games remain available if it is unavailable. Sound starts off and can be enabled with the Sound button.

The café room and cats are original Three.js models. Enhanced portrait copies are made with the built-in image tool and labeled AI-enhanced; the cat selector can switch back to original reference photos. These infer detail and are not higher-resolution original photographs. Full prompt, file paths, material sources and licenses are in `dist/assets/credits.json`.

The seated cat model has a continuous torso, physical short guard hairs, textured irises, fine whiskers, reference-based coats, and a 0.86 overall scale. Models are approximations, not hyperrealistic reconstructions of the low-resolution collage. Faithful photoreal likeness requires higher-resolution multi-angle references and custom 3D work. Resident cards display the original reference photos through CSS portrait windows. The compact 9 × 9.4 unit room keeps its camera inside all four walls. Transparent glass sits in a true window opening, looking onto a 3D garden and a photographed sunny environment. Furniture uses rounded edges, tailored cushions, detailed ceramic shapes, wood PBR maps, fabric weave, daylight shadows, and environmental reflections. These improve realism but do not constitute a fully photorealistic scene. The design takes broad cozy pet-game inspiration from Capy — Pet Capybara without using its assets. Three.js r160.1 is bundled in `dist/vendor/` with its MIT license.

Care decay per hour: 4 fullness, 2.8 happiness, 1.7 energy. At 15 fullness or 10 happiness, sickness begins. Recovery requires a care kit plus 40 fullness, 40 happiness, and 35 energy. Use How to play → Simulate 24 hours away to try recovery.

The static website is in `dist/`. It needs no package installation. Web fonts are optional; system fonts provide a fallback. Run `node interaction-check.mjs` for the mouse/touch gesture checks, and `node sound-check.mjs` for sound and mute lifecycle checks. The cat recordings and music are bundled locally in `dist/audio/`, so playback does not depend on third-party audio hosts. Credits and licenses are available in How to play → Music & sound credits and in `dist/audio/credits.json`. The background uses Kevin MacLeod’s Bossa Antigua (CC BY 4.0), with no added room noise or cup clinks. Purring is by Peter Hull (CC BY-SA 4.0); eating is by admin_phpbb / PDSounds (public domain). Only UI clicks and resting chimes are synthesized.

## Development journal and versions

Read the [development journal](dist/blog/index.html) or its [hosted version](https://little-paws-cafe-ronnie.verve-4139.chatgpt.site/blog/). It covers six gameplay iterations from November 1–2, 2026, plus the journal and repository handoff. The initial 2D build has a screenshot but no saved Git snapshot. Saved source versions are exported to the `v0.2.0`, `v0.3.0`, and `v0.4.0` GitHub branches; `main` is the current v0.6.0 compact lounge build, also archived in `v0.6.0`. Version 2 of the save format migrates the old sample cats’ care to Zeus, Ralph, and Star, preserving the wallet, inventory, accessories, goals, and café card. See `versions.json` for original local commit hashes. GitHub export commits have their own hashes.

GitHub contains the portable source, bundled media, credits, and checks. The generated standalone HTML is rebuilt with `node build-standalone.mjs`; private Sites project metadata is not part of the public export. The repository is [rge625/Cat-game](https://github.com/rge625/Cat-game).
