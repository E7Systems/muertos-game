# Muertos Card Matching Game

A Día de los Muertos themed memory card matching game designed for festival kiosk displays (1080x1920 portrait).

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the game locally:**
   ```bash
   npm start
   ```

   This will start a local web server and open the game in your browser at `http://localhost:8080`

3. **For kiosk mode:**
   - Click the "Pantalla Completa" (Full Screen) button in the top-right corner
   - Or press F11 in most browsers

## Deployment

See **GITHUB-DEPLOY.md** for instructions on deploying to your web server.

## Game Rules

### Objective
Find 2 matching "Winner" cards before running out of turns.

### Gameplay
- **Turns:** You have 5 mismatched turns
  - Matching cards = FREE TURN (doesn't count against you)
  - Non-matching cards = Uses 1 turn

- **Grid:** 15 cards in a 3×5 layout
  - 3 Winner cards (need to find 2 to win)
  - 6 pairs of regular cards (randomly selected from 7 available types)

- **Card Flipping:**
  - Tap two cards to flip them with 3D animation
  - If they match: Cards are removed with celebration confetti
  - If they don't match: Cards flip back after **3 seconds**

- **Early Turn Start:** Touch anywhere during mismatch display to immediately flip cards back and start new turn
  - Touch a different card: Old cards flip back, new card flips up
  - Touch background: All cards flip back, ready for new turn

### Win/Lose Conditions
- **Win:** Match any 2 of the 3 Winner cards → Fireworks celebration!
- **Lose:** Use up all 5 mismatched turns → "Inténtalo otra vez"

### Inactivity Timeout
- **45 seconds:** Warning message appears with dark background: "¿Sigues ahí? Toca 2 cartas."
- **60 seconds total:** Returns to lobby automatically
- **Touch anywhere** on screen to completely reset the timeout timer

## Visual Features

### Card Animations
- **3D Flip Effect:** Multi-frame animation with horizontal scaling
  - Cards shrink to edge (150ms)
  - Face switches at midpoint
  - Cards expand back (150ms)

### Visual Feedback
- **Toast Messages:** All on-screen messages have semi-transparent dark backgrounds for readability
  - Turn counter: Black background (70% opacity)
  - Warning message: Black background (80% opacity)

- **Match Celebration:** Colorful confetti particles burst from matched cards

- **Winner Celebration:**
  - "¡GANADOR!" text with pulsing animation
  - Fireworks bursts with particles (displayed on top z-level)
  - Multiple bursts over 5 seconds

### Card Layout
- **Centered Grid:** Cards span the center 760px of the 1080px screen
  - Left/right margins: 160px each
  - Column spacing: 80px between cards

- **Natural Feel:**
  - Random tilt: ±4 degrees per card
  - Random offset: ±5 pixels per card

## Assets

All game assets are in the `assets/` folder:

### Images
- **Screen backgrounds:** (1080×1920 portrait)
  - `lobby.jpg` - Start screen
  - `play.jpg` - Play screen background
  - `winner.jpg` - Win screen
  - `try_again.jpg` - Lose screen

- **Cards:** `card_*.png` files (200×275)
  - `card_back.png` - Beautiful Spanish design with bright Latin American colors
  - `card_lady.png` - Traditional dressed female skeleton
  - `card_man.png` - Traditional dressed male skeleton
  - `card_pitcher.png` - Sangria pitcher
  - `card_dog.png` - Spanish dog skeleton
  - `card_cat.png` - Spanish cat skeleton
  - `card_cookies.png` - Plate of Mexican wedding cookies
  - `card_cross.png` - Cross
  - `card_winner.png` - Winner card with fireworks background

### Audio (Optional - currently disabled)
To enable audio, add these files to `assets/audio/` and uncomment the audio code in `game.js`:
- `mariachi-background.mp3` - Background music (looping)
- `fireworks-pop.mp3` - Win celebration sound
- `trumpet-flare.mp3` - Lose sound
- `match-celebration.mp3` - Match sound effect

## Technical Specifications

### Framework
- **Phaser 3.70.0** (loaded via CDN)
- **Display:** 1080×1920 portrait orientation
- **Target:** Kiosk touchscreen displays

### Grid Layout
- **Card size:** 200×275 px (aspect ratio 1:1.375)
- **Grid:** 3 columns × 5 rows
- **Horizontal gap:** 80px (cards fill center 760px)
- **Vertical gap:** 20px
- **Grid position:** Top-left card center at (260, 417.5)
- **Random tilt:** ±4 degrees
- **Random offset:** ±5 pixels

### Timing
- **Card flip animation:** 300ms (150ms shrink + 150ms expand)
- **Mismatch display:** 3 seconds before auto flip-back
- **Match celebration:** 1 second
- **Inactivity warning:** 45 seconds
- **Return to lobby:** 60 seconds total (45s + 15s)

### Interaction
- **Mouse wheel scrolling:** Enabled for desktop testing
- **Touch input:** Full screen touch detection
- **Touch resets:** Any screen touch resets inactivity timer
- **Early turn start:** Touch during mismatch display to skip wait

## Project Structure

```
muertos-game/
├── index.html                    # Main HTML file with kiosk settings
├── game.js                       # Game logic (Phaser scenes)
├── .htaccess                     # Apache configuration
├── muertos.e7systems.com.conf   # Apache virtual host config
├── package.json                  # Node dependencies (dev only)
├── assets/                       # Game assets
│   ├── card_*.png               # Card images (9 cards)
│   ├── lobby.jpg                # Start screen
│   ├── play.jpg                 # Play screen background
│   ├── winner.jpg               # Win screen
│   └── try_again.jpg            # Lose screen
├── DEPLOYMENT.md                 # Full deployment guide
├── GITHUB-DEPLOY.md             # Simple GitHub deployment
└── README.md                     # This file
```

## Game States

1. **Lobby Scene** - Start screen with lobby.jpg background
   - "Toca la pantalla para comenzar" text
   - Tap anywhere to start game

2. **Play Scene** - Main gameplay with play.jpg background
   - 15 cards in 3×5 grid
   - Turn counter at top with dark background
   - Inactivity warnings with dark background
   - Touch anywhere to reset timeout

3. **Winner Scene** - Victory screen with winner.jpg background
   - "¡GANADOR!" text with pulse animation
   - Fireworks animation (5 bursts over 5 seconds)
   - Returns to lobby after 10 seconds or on tap

4. **Try Again Scene** - Game over screen with try_again.jpg background
   - "Inténtalo otra vez" text
   - Screen dimmed with 30% overlay
   - Returns to lobby after 5 seconds or on tap

## Development

### Local Testing
```bash
npm run dev
```
Open `http://localhost:8080` in your browser.

### Making Changes
- **Game logic:** Edit `game.js`
- **Styling:** Edit `index.html` (CSS in `<style>` tag)
- **Assets:** Replace files in `assets/` folder

### Deploying Updates
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Then on the server:
```bash
ssh e7system@muertos.e7systems.com
cd /var/www/muertos.e7systems.com
sudo git pull origin main
```

## Browser Compatibility

Works in modern browsers with HTML5 Canvas support:
- Chrome/Edge (recommended for kiosk)
- Firefox
- Safari

### For Kiosk Deployment
- Use fullscreen mode (F11 or click button)
- Disable browser chrome/UI
- Enable touch input
- Portrait orientation (1080×1920)

## Configuration Constants

Key game constants in `game.js`:

```javascript
GAME_CONSTANTS = {
    MAX_MISMATCHED_TURNS: 5,           // 5 mismatched turns allowed
    FLIP_BACK_DELAY: 3000,             // 3 seconds to view mismatched cards
    INACTIVITY_WARNING: 45000,         // 45 seconds before warning
    INACTIVITY_RETURN: 15000,          // 15 more seconds to return to lobby
    MATCH_CELEBRATION_DURATION: 1000   // 1 second celebration
}

GRID_CONFIG = {
    columns: 3,
    rows: 5,
    cardWidth: 200,
    cardHeight: 275,
    gapX: 80,                          // 80px horizontal spacing
    gapY: 20,                          // 20px vertical spacing
    startX: 260,                       // Center of first card
    startY: 417.5,                     // Center of first card
    tiltRange: 4,                      // ±4 degrees
    offsetRange: 5                     // ±5 pixels
}
```

## Features Implemented

✅ 3D card flip animations with multi-frame scaling
✅ Early turn start on screen touch during mismatch display
✅ Toast messages with dark backgrounds for readability
✅ Extended inactivity timeout (45s + 15s)
✅ Touch anywhere resets timeout completely
✅ Cards centered in 760px with 80px gaps
✅ Fireworks displayed on top z-level
✅ Mouse wheel scrolling for desktop testing
✅ Confetti celebration on matches
✅ Random card tilt and offset for natural look
✅ Winner celebration with particle fireworks

## Live Deployment

**URL:** http://muertos.e7systems.com

**Server:** Ubuntu with Apache2
**Repository:** https://github.com/E7Systems/muertos-game

## Support & Troubleshooting

See **DEPLOYMENT.md** for:
- Server configuration
- Apache logs location
- Common issues and fixes
- SSL setup with Let's Encrypt

## License

MIT

## Credits

Created for Día de los Muertos festival.
Built with Phaser 3 game framework.
