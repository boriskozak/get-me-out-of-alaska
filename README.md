# Get Me Out of Alaska! 🦌

A tongue-in-cheek rescue app for Clint & Mike Lippy, who got stranded in Alaska
after their pilot timed out. It packs two things:

1. **Flight Finder** — search mock alternate routes out of Alaska (Anchorage,
   Fairbanks, Juneau, Sitka, Ketchikan) to Lower 48 destinations. All results
   are fictional demo data; the "Book Now" button just cheers them on.
2. **Moose Escape** — a canvas side-scrolling runner game: help Clint & Mike
   dodge moose, rocks, stumps, and eagles while they wait for their flight.
   High score persists in `localStorage`.

## Run it

No build step, no dependencies. Any of these works:

```bash
# option 1: open directly
open index.html            # macOS
xdg-open index.html        # linux

# option 2: serve locally (recommended, avoids file:// quirks)
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Game controls

| Input | Action |
|---|---|
| `Space` or `↑` | Jump (or start the game) |
| `↓` | Duck |
| Tap (mobile) | Jump (or start the game) |

## Layout

- `index.html` — markup for the landing hero, flight finder, and game sections
- `styles.css` — all styling (aurora background, snowfall, glassmorphism panels)
- `app.js` — flight finder logic + the Moose Escape game engine
