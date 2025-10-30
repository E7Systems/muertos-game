# Muertos Card Matching Game

A Día de los Muertos themed memory card matching game designed for kiosk displays (1080x1920 portrait).

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the game:**
   ```bash
   npm start
   ```

   This will start a local web server and open the game in your browser at `http://localhost:8080`

3. **For kiosk mode:**
   - Click the "Pantalla Completa" (Full Screen) button in the top-right corner
   - Or press F11 in most browsers

## Game Rules

- **Objective:** Find 2 matching "Winner" cards before running out of turns
- **Turns:** You have 5 mismatched turns (matches don't count against you - free turn!)
- **Grid:** 15 cards in a 3×5 layout
  - 3 Winner cards
  - 6 pairs of regular cards (randomly selected from 7 available types)
- **Matching:** Tap two cards to flip them
  - If they match: Cards are removed, you get a free turn
  - If they don't match: Cards flip back after 5 seconds, uses 1 turn
- **Win:** Match 2 Winner cards
- **Lose:** Use up all 5 mismatched turns without finding 2 Winner cards
- **Inactivity:** After 15 seconds, warning appears. After 30 seconds total, returns to lobby

## Assets

All game assets are in the `assets/` folder:

### Images
- **Screen backgrounds:** `lobby.jpg`, `winner.jpg`, `try_again.jpg` (1080×1920)
- **Cards:** `card_*.png` files (200×275)
  - `card_back.png` - Beautiful Spanish design
  - `card_lady.png` - Traditional dressed female skeleton
  - `card_man.png` - Traditional dressed male skeleton
  - `card_pitcher.png` - Sangria
  - `card_dog.png` - Spanish dog skeleton
  - `card_cat.png` - Spanish cat skeleton
  - `card_cookies.png` - Mexican wedding cookies
  - `card_cross.png` - Cross
  - `card_winner.png` - Winner card with fireworks

### Audio (Optional - currently disabled)
To enable audio, add these files to `assets/audio/` and uncomment the audio code in `game.js`:
- `mariachi-background.mp3` - Background music
- `fireworks-pop.mp3` - Win celebration sound
- `trumpet-flare.mp3` - Lose sound
- `match-celebration.mp3` - Match sound effect

## Technical Details

- **Framework:** Phaser 3.70.0 (loaded via CDN)
- **Display:** 1080×1920 portrait orientation
- **Grid Layout:**
  - Card size: 200×275 px
  - 3 columns × 5 rows
  - Horizontal gap: 40px
  - Vertical gap: 20px
  - Random tilt: ±4 degrees
  - Random offset: ±5 pixels

## Project Structure

```
muertos-game/
├── index.html          # Main HTML file
├── game.js             # Game logic (Phaser scenes)
├── package.json        # Node dependencies
├── assets/             # Game assets
│   ├── card_*.png      # Card images
│   ├── lobby.jpg       # Start screen
│   ├── winner.jpg      # Win screen
│   └── try_again.jpg   # Lose screen
└── README.md           # This file
```

## Game States

1. **Lobby** - Start screen, tap to begin
2. **Play** - Main gameplay with card matching
3. **Winner** - Victory screen with fireworks animation
4. **Try Again** - Game over screen

## Development

- **Start dev server:** `npm run dev`
- **Edit game logic:** Modify `game.js`
- **Add/replace assets:** Update files in `assets/` folder

## Browser Compatibility

Works in modern browsers with HTML5 support:
- Chrome/Edge (recommended)
- Firefox
- Safari

For best kiosk experience, use fullscreen mode on a 1080×1920 portrait display.
