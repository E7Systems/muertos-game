# Muertos Game - Complete Specification

## Project Overview

**Game Type:** Card Matching Memory Game
**Theme:** Día de los Muertos (Day of the Dead)
**Platform:** Web-based kiosk game
**Target Display:** 1080×1920 portrait orientation touchscreen
**Target Audience:** Día de los Muertos festival attendees (all ages, no complex thinking required, kid-friendly)
**Deployment:** http://muertos.e7systems.com (Ubuntu/Apache2)

---

## Game Description

A festive card-matching memory game where players race against 5 mismatched turns to find 2 matching "Winner" cards among a beautifully illustrated 15-card grid featuring traditional Day of the Dead imagery with vibrant Latin American aesthetics.

---

## Card Deck Specification

### Total Cards: 8 Unique Designs

#### Card Back
- **Design:** Beautiful Spanish back-face design
- **Color Palette:** Bright Latin American colors
- **File:** `card_back.png`

#### Card Faces (Front)
1. **Traditional Dressed Female Skeleton** - `card_lady.png`
2. **Traditional Dressed Male Skeleton** - `card_man.png`
3. **Sangria Pitcher** - `card_pitcher.png`
4. **Spanish Dog Skeleton** - `card_dog.png`
5. **Spanish Cat Skeleton** - `card_cat.png`
6. **Plate of Mexican Wedding Cookies** - `card_cookies.png`
7. **Cross** - `card_cross.png`
8. **Winner Card** - "Winner" text with fireworks background - `card_winner.png`

### Card Specifications
- **Size:** 200×275 pixels
- **Aspect Ratio:** 1:1.375 (portrait, poker-style)
- **Format:** PNG

---

## Game States

### 1. Lobby State
**Screen:** `lobby.jpg` (1080×1920)

**Behavior:**
- Display lobby background image
- Show text: "Toca la pantalla para comenzar"
- Wait for user tap anywhere on screen
- On tap → Transition to Play Screen

---

### 2. Play Screen State
**Screen:** `play.jpg` (1080×1920) as background

**Initial Setup:**
- Deal 15 cards in 3 columns × 5 rows grid
- **Card Distribution:**
  - 3 Winner cards
  - 6 card types randomly selected (without repeating) from the 7 regular card faces
  - 2 cards of each selected type (creating 6 pairs)

**Card Layout:**
- **Grid Position:** 3 cards across × 5 cards down
- **Grid Top-Left:** x=125, y=280 (from screen top-left)
- **Card Centers Fill:** Center 760px of 1080px screen width
  - Left margin: 160px
  - Right margin: 160px
  - Card center positions: 260px, 540px, 820px
- **Card Size:** 200×275 pixels
- **Horizontal Gap:** 80px between card centers
- **Vertical Gap:** 20px between cards
- **Random Tilt:** ±4 degrees per card
- **Random Offset:** ±5 pixels per card (x and y)

**Aesthetic Notes:**
- Cards have random tilt and offset for a hand-dealt, natural feel
- Cards initially show back face (Spanish design)

**Turn Counter Display:**
- **Position:** Top of screen (y=150)
- **Text:** "Intentos restantes: X"
- **Background:** Semi-transparent black rectangle (70% opacity, 500×80px)
- **Font:** 42px white Arial with black stroke (4px)
- **Z-depth:** 100 (background), 101 (text)

---

### 3. Winner State
**Screen:** `winner.jpg` (1080×1920)

**Trigger:** Player successfully matches 2 Winner cards

**Visual Effects:**
- Display "¡GANADOR!" text
  - Font: 120px bold Arial
  - Color: Gold (#FFD700)
  - Black stroke: 10px
  - Pulse animation: scale 1.0 → 1.2 (500ms, repeating)
  - Z-depth: 500

- **Fireworks Animation:**
  - 5 firework bursts over 5 seconds (1 per second)
  - Each burst: 30 particles radiating from random point
  - Colors: Red, Orange, Yellow, Green, Blue, Magenta
  - Particle size: 8px circles
  - Animation: 2 seconds fade-out with scale reduction
  - Z-depth: 1000 (on top of everything)

**Duration:** 10 seconds, then return to lobby (or tap to skip)

---

### 4. Try Again State
**Screen:** `try_again.jpg` (1080×1920)

**Trigger:** Player uses all 5 mismatched turns without finding 2 Winner cards

**Visual Effects:**
- Display try again background
- 30% black dim overlay
- Text: "Inténtalo otra vez"
  - Font: 72px white Arial with black stroke (8px)
  - Position: Center screen

**Sound:** Trumpet flare (when audio enabled)

**Duration:** 5 seconds, then return to lobby (or tap to skip)

---

## Gameplay Mechanics

### Turn System

**Turn Definition:**
- Player taps two cards to flip them
- If cards match → FREE TURN (doesn't count)
- If cards don't match → Uses 1 turn

**Turn Limit:** 5 mismatched turns maximum

**Turn Counter:** Displayed at top of screen, updates after each mismatch

### Card Selection Flow

1. **First Card Tap:**
   - Card flips to show face with 3D animation (300ms)
   - Card remains face-up
   - Wait for second card selection

2. **Second Card Tap:**
   - Card flips to show face with 3D animation (300ms)
   - Both cards visible
   - Brief pause (300ms) then check for match

3. **Match Detected:**
   - Celebrate with confetti particle effect (1 second)
   - Remove both cards with fade-out animation (500ms)
   - Free turn - ready for next selection immediately
   - Special case: If both are Winner cards → Win Game

4. **No Match:**
   - **Display Duration:** 3 seconds with both cards face-up
   - Increment mismatched turn counter
   - **Early Turn Start:**
     - If player touches another card → Immediately flip mismatched cards back, flip new card up
     - If player touches one of the shown cards → Immediately flip both back
     - If player touches background → Immediately flip both back
   - **Auto Flip-Back:** After 3 seconds, cards flip back to show card-back
   - Mismatch uses 1 turn
   - Ready for next selection

### Card Flip Animation

**3D Flip Effect (300ms total):**
1. **Shrink Phase (150ms):**
   - Scale X: 1.0 → 0.0
   - Easing: Cubic.easeIn

2. **Switch Face at Midpoint (instant):**
   - When scaleX reaches 0
   - Toggle visibility between back and front

3. **Expand Phase (150ms):**
   - Scale X: 0.0 → 1.0
   - Easing: Cubic.easeOut

**Result:** Smooth 3D horizontal flip animation

### Celebration Effects

**Match Celebration (1 second):**
- 20 confetti rectangles burst from center point between matched cards
- Random colors
- Radiate outward 200px in random directions
- Fade out to alpha 0
- Duration: 1000ms

**Winner Celebration:**
- See Winner State above
- Multiple firework bursts with particle systems
- Synchronized to popping sounds (when audio enabled)

### Win Condition
- Player matches ANY 2 of the 3 Winner cards
- Triggers Winner State immediately

### Lose Condition
- Player uses all 5 mismatched turns
- No Winner cards matched
- Triggers Try Again State

---

## Inactivity Timeout System

### Timeout Stages

**Stage 1 - Normal Play:**
- No warnings
- User actively playing

**Stage 2 - First Warning (45 seconds of inactivity):**
- Display warning message: "¿Sigues ahí? Toca 2 cartas."
  - Font: 56px yellow Arial with black stroke (6px)
  - Background: Semi-transparent black rectangle (80% opacity, 700×120px)
  - Pulse animation: scale 1.0 → 1.1 (500ms, repeating)
  - Z-depth: 200 (background), 201 (text)

**Stage 3 - Return to Lobby (15 seconds after warning = 60 seconds total):**
- Automatically return to Lobby State
- Reset all game state

### Reset Triggers

**Any of these actions reset the entire timeout clock:**
- Tap any card
- Touch anywhere on screen (play area background)
- Any pointer/touch event

**Important:** Touching the screen during mismatch card display:
- Resets timeout
- AND triggers early turn start (flips cards back immediately)

---

## Screen Layout Specifications

### Display Dimensions
- **Resolution:** 1080×1920 pixels (portrait)
- **Browser:** Full screen mode, forced
- **Scrolling:** Vertical mouse-wheel enabled (for desktop testing)

### Play Area Grid

**Total Play Area:** 820px wide × 1530px tall

**Grid Layout:**
- **Columns:** 3
- **Rows:** 5
- **Total Cards:** 15

**Card Positioning:**
- **Card Size:** 200×275px
- **Horizontal Gap:** 80px (between card centers)
- **Vertical Gap:** 20px (between cards)
- **Top Margin:** 280px from screen top to first card center
- **Left Margin:** 160px from screen edge
- **Right Margin:** 160px from screen edge

**Column Centers (X positions):**
- Column 1: 260px
- Column 2: 540px
- Column 3: 820px

**Row Centers (Y positions):**
- Row 1: 417.5px
- Row 2: 712.5px
- Row 3: 1007.5px
- Row 4: 1302.5px
- Row 5: 1597.5px

**Random Variations per Card:**
- Rotation: ±4 degrees
- Offset X: ±5 pixels
- Offset Y: ±5 pixels

### Hitbox Alignment
- Fixed to grid cells for proper tap detection
- Random tilt/offset are visual only
- Collision boxes remain aligned to grid

---

## Timing Specifications

### Animation Timings
- **Card Flip:** 300ms (150ms + 150ms)
- **Match Check Delay:** 300ms after second card flipped
- **Match Celebration:** 1000ms
- **Card Removal (fade out):** 500ms
- **Mismatch Display:** 3000ms (before auto flip-back)
- **Winner Fireworks Burst Interval:** 1000ms (5 bursts total)
- **Winner Firework Particle Duration:** 2000ms
- **Winner Screen Auto-Return:** 10000ms
- **Try Again Screen Auto-Return:** 5000ms

### Timeout Timings
- **Inactivity Warning:** 45000ms (45 seconds)
- **Return to Lobby:** 15000ms after warning (60 seconds total)

---

## Visual & Audio Feedback

### When Match is Made
- **Visual:** Confetti particles (marigold petals / papel picado style)
- **Audio:** Match celebration sound (when enabled)
- **Duration:** 1 second celebration

### When Winning
- **Visual:**
  - "¡GANADOR!" text with pulse animation
  - 5 firework bursts with colorful particles
  - Winner.jpg background
- **Audio:** Fireworks popping sounds (when enabled)

### When Losing
- **Visual:**
  - Screen dimmed (30% black overlay)
  - "Inténtalo otra vez" message
  - Try_again.jpg background
- **Audio:** Trumpet flare (when enabled)

### Background Music
- **File:** Gentle mariachi guitar or festive folk rhythm
- **Behavior:** Loops softly during Play State
- **Volume:** 0.3 (30%)
- **Status:** Currently disabled (can be enabled by adding audio files)

---

## Technical Implementation

### Framework
- **Engine:** Phaser 3.70.0
- **Delivery:** CDN loaded
- **Language:** JavaScript (ES6)

### Architecture
- **Scenes:** 4 total
  1. LobbyScene
  2. PlayScene
  3. WinnerScene
  4. TryAgainScene

### Game Constants

```javascript
CARD_TYPES = {
    REGULAR: ['lady', 'man', 'pitcher', 'dog', 'cat', 'cookies', 'cross'],
    WINNER: 'winner'
}

GRID_CONFIG = {
    columns: 3,
    rows: 5,
    cardWidth: 200,
    cardHeight: 275,
    gapX: 80,
    gapY: 20,
    startX: 260,        // Center of first card
    startY: 417.5,      // Center of first card
    tiltRange: 4,       // ±4 degrees
    offsetRange: 5      // ±5 pixels
}

GAME_CONSTANTS = {
    MAX_MISMATCHED_TURNS: 5,
    FLIP_BACK_DELAY: 3000,
    INACTIVITY_WARNING: 45000,
    INACTIVITY_RETURN: 15000,
    MATCH_CELEBRATION_DURATION: 1000
}
```

### Asset Loading
- All images loaded via Phaser asset loader in preload()
- **Case Sensitivity:** Linux server requires exact case match (play.jpg not Play.jpg)
- Assets organized in `/assets/` directory

### Input Handling
- **Touch Events:** Phaser pointer events
- **Mouse Support:** For desktop testing
- **Scrolling:** Enabled for desktop testing (overflow-y: auto)
- **Global Touch Handler:** Resets inactivity timer on any screen touch

### State Management
```javascript
PlayScene state variables:
- mismatchedTurns (counter)
- selectedCards (array, max 2)
- isProcessingTurn (boolean)
- matchedCards (array)
- inactivityTimer (Phaser timer)
- returnTimer (Phaser timer)
- warningText (Phaser text object)
- warningBackground (Phaser rectangle)
- mismatchDisplayCards (array, tracks cards waiting to flip back)
- mismatchFlipTimer (Phaser timer)
```

### Z-Depth Layering
- **Background Images:** 0 (default)
- **Cards:** Default layer
- **Turn Counter Background:** 100
- **Turn Counter Text:** 101
- **Warning Background:** 200
- **Warning Text:** 201
- **Winner Text:** 500
- **Fireworks Particles:** 1000 (topmost)

---

## Platform & Deployment

### Development
- **Local Testing:** npm start (http-server on port 8080)
- **Requirements:** Node.js (for dev server only)
- **Browser Testing:** Chrome/Edge recommended

### Production Deployment
- **Server:** Ubuntu Linux with Apache2
- **Web Server:** Apache 2.4
- **Domain:** muertos.e7systems.com
- **Document Root:** /var/www/muertos.e7systems.com
- **Version Control:** GitHub (public repository)
- **Deployment Method:** Git pull from repository

### Apache Configuration
- **Compression:** Enabled (mod_deflate)
- **Caching:** Static assets cached (mod_expires)
- **MIME Types:** Configured via .htaccess
- **Security Headers:** X-Frame-Options, X-Content-Type-Options, X-XSS-Protection

### Browser Requirements
- HTML5 Canvas support
- Touch events (for kiosk)
- Modern JavaScript (ES6)
- Tested on: Chrome, Edge, Firefox, Safari

---

## Accessibility & Usability

### No Learning Curve
- Game starts with simple instruction: "Toca la pantalla para comenzar"
- No complex rules to remember
- Visual feedback for all actions
- Suitable for children and adults
- No text-heavy instructions

### Festival Environment Considerations
- Large touch targets (200×275px cards)
- High contrast visuals
- Clear win/lose states
- Quick play sessions (2-3 minutes average)
- Automatic return to lobby (idle timeout)
- No account/login required
- Single-player experience

### Touch Optimization
- Generous hitboxes on cards
- Background touch to reset/skip
- Early turn start for faster gameplay
- Visual feedback on all interactions

---

## File Structure

```
muertos-game/
├── index.html                      # Main game page
├── game.js                         # Game logic (all scenes)
├── .htaccess                       # Apache config (MIME types, caching)
├── muertos.e7systems.com.conf     # Apache virtual host config
├── package.json                    # Dev dependencies
├── .gitignore                      # Git ignore rules
├── assets/
│   ├── lobby.jpg                  # 1080×1920 lobby screen
│   ├── play.jpg                   # 1080×1920 play background
│   ├── winner.jpg                 # 1080×1920 winner screen
│   ├── try_again.jpg              # 1080×1920 lose screen
│   ├── card_back.png              # 200×275 card back
│   ├── card_lady.png              # 200×275 female skeleton
│   ├── card_man.png               # 200×275 male skeleton
│   ├── card_pitcher.png           # 200×275 sangria pitcher
│   ├── card_dog.png               # 200×275 dog skeleton
│   ├── card_cat.png               # 200×275 cat skeleton
│   ├── card_cookies.png           # 200×275 wedding cookies
│   ├── card_cross.png             # 200×275 cross
│   └── card_winner.png            # 200×275 winner card
├── README.md                       # Project documentation
├── GAME-SPECIFICATION.md          # This file
├── DEPLOYMENT.md                   # Full deployment guide
└── GITHUB-DEPLOY.md               # Simple GitHub deployment
```

---

## Change Log / Evolution

### Initial Requirements
- Basic card matching game
- 8 card designs with Day of the Dead theme
- 3×5 grid, 15 cards
- 5 turns to find 2 Winner cards
- Screen images for lobby/winner/try again states

### Refinements During Development

1. **Card Positioning Refinement**
   - Initially specified top-left at x=125, y=280
   - Adjusted to center 760px of screen (cards too far left initially)
   - Final: Cards centered with 160px margins, 80px gaps

2. **Flip-Back Timing**
   - Initial: 5 seconds
   - Adjusted to: 3 seconds (user request for faster gameplay)

3. **Inactivity Timeout Extension**
   - Initial: 15 seconds warning, 30 seconds total
   - Extended to: 45 seconds warning, 60 seconds total
   - Added: Touch anywhere to reset (not just cards)

4. **Early Turn Start Feature**
   - Added: Touch during mismatch display immediately starts new turn
   - Behavior: Flip mismatched cards back, start fresh
   - Enhancement: Touch different card to flip it up immediately

5. **Toast Message Backgrounds**
   - Added: Semi-transparent dark backgrounds to all on-screen text
   - Ensures readability over colorful background images

6. **Animation Enhancement**
   - Added: 3D card flip with multi-frame scaling animation
   - Creates realistic horizontal flip effect

7. **Fireworks Z-Level Fix**
   - Ensured: Fireworks render on top of all other elements (z-depth 1000)

8. **Scrolling Support**
   - Added: Vertical scrolling for desktop testing
   - Kiosk displays at full 1920px height

9. **Case Sensitivity Fix**
   - Fixed: Play.jpg → play.jpg for Linux server compatibility

10. **Background Image Fix**
    - Added: play.jpg as background for Play Screen
    - Previously missing from initial spec

---

## Future Enhancements (Out of Scope)

### Audio Integration
- Add audio files to /assets/audio/
- Uncomment audio loading in game.js
- Files needed:
  - mariachi-background.mp3
  - fireworks-pop.mp3
  - trumpet-flare.mp3
  - match-celebration.mp3

### Potential Features
- Score tracking
- Difficulty levels (fewer turns, more cards)
- Multiple themes
- Leaderboard
- Sound on/off toggle
- Different card sets
- Animation speed options

---

## Testing Checklist

### Functional Testing
- [ ] Cards flip with proper 3D animation
- [ ] Match detection works correctly
- [ ] Winner cards trigger win state
- [ ] Turn counter decrements on mismatch
- [ ] 5 mismatched turns triggers lose state
- [ ] Confetti appears on matches
- [ ] Fireworks animate on win
- [ ] Early turn start works (touch during mismatch)
- [ ] Inactivity warning appears at 45s
- [ ] Auto-return to lobby at 60s
- [ ] Touch resets inactivity timer
- [ ] Cards properly centered in 760px
- [ ] Random tilt/offset applied
- [ ] All backgrounds load correctly

### Cross-Browser Testing
- [ ] Chrome/Edge (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop)
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)

### Kiosk Testing
- [ ] Fullscreen mode works
- [ ] Touch input responsive
- [ ] Portrait orientation correct
- [ ] No scrollbars in fullscreen
- [ ] Auto-return to lobby (idle handling)
- [ ] Performance smooth (60fps)

---

## Repository Information

**GitHub:** https://github.com/E7Systems/muertos-game
**Visibility:** Public
**Primary Branch:** main
**Live URL:** http://muertos.e7systems.com

---

## Credits

**Created For:** Día de los Muertos Festival
**Development Framework:** Phaser 3
**Platform:** Web (HTML5/JavaScript)
**Target Deployment:** Ubuntu/Apache2 kiosk display

---

*Document Version: 1.0*
*Last Updated: 2025-10-30*
*Status: Production Ready*
