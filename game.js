// Muertos Card Matching Game
// Día de los Muertos themed memory game for kiosk display (1080x1920)

// Card types (7 regular + 1 winner)
const CARD_TYPES = {
    REGULAR: [
        'lady',
        'man',
        'pitcher',
        'dog',
        'cat',
        'cookies',
        'cross'
    ],
    WINNER: 'winner'
};

// Grid configuration
const GRID_CONFIG = {
    columns: 3,
    rows: 5,
    cardWidth: 200,
    cardHeight: 275,
    gapX: 80,          // Cards fill center 760px: (760 - 600) / 2 gaps = 80px
    gapY: 20,
    startX: 260,       // Center of first card: 160 (left margin) + 100 (half card width)
    startY: 417.5,     // 280 + (cardHeight/2) = center position for top-left at y=280
    tiltRange: 4,      // ±4 degrees
    offsetRange: 5     // ±5 pixels
};

// Game constants
const GAME_CONSTANTS = {
    MAX_MISMATCHED_TURNS: 5,
    FLIP_BACK_DELAY: 3000,      // 3 seconds
    INACTIVITY_WARNING: 45000,   // 45 seconds before warning
    INACTIVITY_RETURN: 15000,    // 15 seconds after warning to return to lobby
    MATCH_CELEBRATION_DURATION: 1000  // 1 second
};

// ======================
// LOBBY SCENE
// ======================
class LobbyScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LobbyScene' });
    }

    preload() {
        // Load all assets
        this.load.image('lobby', 'assets/lobby.jpg');
        this.load.image('play-screen', 'assets/Play.jpg');
        this.load.image('winner-screen', 'assets/winner.jpg');
        this.load.image('tryagain-screen', 'assets/try_again.jpg');

        // Load card back
        this.load.image('card-back', 'assets/card_back.png');

        // Load card faces
        CARD_TYPES.REGULAR.forEach(type => {
            this.load.image(`card-${type}`, `assets/card_${type}.png`);
        });
        this.load.image('card-winner', 'assets/card_winner.png');

        // Load audio (comment out if audio files not yet available)
        // this.load.audio('bg-music', 'assets/audio/mariachi-background.mp3');
        // this.load.audio('fireworks', 'assets/audio/fireworks-pop.mp3');
        // this.load.audio('trumpet-fail', 'assets/audio/trumpet-flare.mp3');
        // this.load.audio('match-sound', 'assets/audio/match-celebration.mp3');
    }

    create() {
        // Display lobby background
        const lobby = this.add.image(540, 960, 'lobby');
        lobby.setDisplaySize(1080, 1920);

        // Add tap instruction text
        const style = {
            fontSize: '48px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 6
        };
        this.add.text(540, 1700, 'Toca la pantalla para comenzar', style).setOrigin(0.5);

        // Tap to start
        this.input.once('pointerdown', () => {
            this.scene.start('PlayScene');
        });
    }
}

// ======================
// PLAY SCENE
// ======================
class PlayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PlayScene' });
    }

    create() {
        // Display play screen background
        const playBg = this.add.image(540, 960, 'play-screen');
        playBg.setDisplaySize(1080, 1920);

        // Game state
        this.mismatchedTurns = 0;
        this.selectedCards = [];
        this.isProcessingTurn = false;
        this.matchedCards = [];
        this.inactivityTimer = null;
        this.warningText = null;
        this.mismatchDisplayCards = null;  // Cards currently showing mismatch
        this.mismatchFlipTimer = null;     // Timer to flip mismatch cards back

        // Start background music (disabled until audio files are added)
        // if (!this.sound.get('bg-music')) {
        //     this.bgMusic = this.sound.add('bg-music', { loop: true, volume: 0.3 });
        //     this.bgMusic.play();
        // }

        // Create deck and deal cards
        this.dealCards();

        // Display turn counter
        this.createTurnCounter();

        // Start inactivity timer
        this.resetInactivityTimer();

        // Add global input listener for screen touches (not on cards)
        this.input.on('pointerdown', (pointer) => {
            this.resetInactivityTimer();

            // Check if we're displaying mismatched cards and touch is NOT on a card
            // The card click handler will have already dealt with card clicks
            if (this.mismatchDisplayCards) {
                // This touch was on empty space, not a card
                // Cancel the flip-back timer
                if (this.mismatchFlipTimer) {
                    this.mismatchFlipTimer.remove();
                    this.mismatchFlipTimer = null;
                }

                // Immediately flip the mismatched cards back down
                const [card1, card2] = this.mismatchDisplayCards;
                this.flipCard(card1, false);
                this.flipCard(card2, false);

                // Clear mismatch display state
                this.mismatchDisplayCards = null;
                this.selectedCards = [];
                this.isProcessingTurn = false;
            }
        });
    }

    dealCards() {
        // Create deck: 3 winner cards + 2 each of 6 randomly chosen regular cards
        const deck = [];

        // Add 3 winner cards
        for (let i = 0; i < 3; i++) {
            deck.push({ type: CARD_TYPES.WINNER, id: `winner-${i}` });
        }

        // Randomly select 6 of the 7 regular card types
        const shuffledTypes = Phaser.Utils.Array.Shuffle([...CARD_TYPES.REGULAR]);
        const selectedTypes = shuffledTypes.slice(0, 6);

        // Add 2 of each selected type
        selectedTypes.forEach(type => {
            deck.push({ type: type, id: `${type}-1` });
            deck.push({ type: type, id: `${type}-2` });
        });

        // Shuffle the deck
        Phaser.Utils.Array.Shuffle(deck);

        // Deal cards in 3x5 grid
        this.cards = [];
        let index = 0;

        for (let row = 0; row < GRID_CONFIG.rows; row++) {
            for (let col = 0; col < GRID_CONFIG.columns; col++) {
                const cardData = deck[index];
                const x = GRID_CONFIG.startX + (col * (GRID_CONFIG.cardWidth + GRID_CONFIG.gapX));
                const y = GRID_CONFIG.startY + (row * (GRID_CONFIG.cardHeight + GRID_CONFIG.gapY));

                // Add random tilt and offset
                const tilt = Phaser.Math.Between(-GRID_CONFIG.tiltRange, GRID_CONFIG.tiltRange);
                const offsetX = Phaser.Math.Between(-GRID_CONFIG.offsetRange, GRID_CONFIG.offsetRange);
                const offsetY = Phaser.Math.Between(-GRID_CONFIG.offsetRange, GRID_CONFIG.offsetRange);

                const card = this.createCard(
                    x + offsetX,
                    y + offsetY,
                    cardData.type,
                    cardData.id,
                    tilt
                );

                this.cards.push(card);
                index++;
            }
        }
    }

    createCard(x, y, type, id, rotation) {
        const container = this.add.container(x, y);

        // Card back (visible initially)
        const back = this.add.image(0, 0, 'card-back');
        back.setDisplaySize(GRID_CONFIG.cardWidth, GRID_CONFIG.cardHeight);

        // Card front (hidden initially)
        const front = this.add.image(0, 0, `card-${type}`);
        front.setDisplaySize(GRID_CONFIG.cardWidth, GRID_CONFIG.cardHeight);
        front.setVisible(false);

        container.add([back, front]);
        container.setSize(GRID_CONFIG.cardWidth, GRID_CONFIG.cardHeight);
        container.setAngle(rotation);
        container.setInteractive();

        // Card data
        container.cardData = {
            type: type,
            id: id,
            isFlipped: false,
            isMatched: false,
            back: back,
            front: front
        };

        // Click handler
        container.on('pointerdown', () => this.onCardClick(container));

        return container;
    }

    onCardClick(card) {
        // Reset inactivity timer on any interaction
        this.resetInactivityTimer();

        // Check if we're displaying mismatched cards (waiting for flip-back)
        if (this.mismatchDisplayCards) {
            // Cancel the flip-back timer
            if (this.mismatchFlipTimer) {
                this.mismatchFlipTimer.remove();
                this.mismatchFlipTimer = null;
            }

            // Immediately flip the mismatched cards back down
            const [card1, card2] = this.mismatchDisplayCards;
            this.flipCard(card1, false);
            this.flipCard(card2, false);

            // Clear mismatch display state
            this.mismatchDisplayCards = null;
            this.selectedCards = [];
            this.isProcessingTurn = false;

            // If the clicked card was one of the mismatched cards, don't flip it back up
            // Otherwise, continue with normal card flip
            if (card !== card1 && card !== card2 && !card.cardData.isMatched) {
                // Flip the newly clicked card
                this.flipCard(card, true);
                this.selectedCards.push(card);
            }
            return;
        }

        // Ignore if processing, already flipped, or already matched
        if (this.isProcessingTurn || card.cardData.isFlipped || card.cardData.isMatched) {
            return;
        }

        // Ignore if already have 2 cards selected
        if (this.selectedCards.length >= 2) {
            return;
        }

        // Flip the card
        this.flipCard(card, true);
        this.selectedCards.push(card);

        // Check if we have 2 cards selected
        if (this.selectedCards.length === 2) {
            this.isProcessingTurn = true;
            this.time.delayedCall(300, () => this.checkMatch());
        }
    }

    flipCard(card, showFront) {
        // Multi-frame 3D flip animation
        // First half: shrink to 0 (hide current face)
        this.tweens.add({
            targets: card,
            scaleX: 0,
            duration: 150,
            ease: 'Cubic.easeIn',
            onComplete: () => {
                // At the midpoint (scaleX = 0), switch the visible face
                card.cardData.isFlipped = showFront;
                card.cardData.back.setVisible(!showFront);
                card.cardData.front.setVisible(showFront);

                // Second half: expand to 1 (show new face)
                this.tweens.add({
                    targets: card,
                    scaleX: 1,
                    duration: 150,
                    ease: 'Cubic.easeOut'
                });
            }
        });
    }

    checkMatch() {
        const [card1, card2] = this.selectedCards;
        const match = card1.cardData.type === card2.cardData.type;

        if (match) {
            // Cards match!
            this.handleMatch(card1, card2);
        } else {
            // Cards don't match
            this.handleMismatch(card1, card2);
        }
    }

    handleMatch(card1, card2) {
        // Play match sound (disabled until audio files are added)
        // this.sound.play('match-sound', { volume: 0.5 });

        // Mark as matched
        card1.cardData.isMatched = true;
        card2.cardData.isMatched = true;
        this.matchedCards.push(card1, card2);

        // Show celebration effects (marigold petals / papel picado)
        this.showMatchCelebration(card1, card2);

        // Check if won (matched 2 winner cards)
        if (card1.cardData.type === CARD_TYPES.WINNER) {
            this.time.delayedCall(GAME_CONSTANTS.MATCH_CELEBRATION_DURATION, () => {
                this.winGame();
            });
            return;
        }

        // Remove cards after celebration
        this.time.delayedCall(GAME_CONSTANTS.MATCH_CELEBRATION_DURATION, () => {
            this.removeMatchedCards(card1, card2);
            this.selectedCards = [];
            this.isProcessingTurn = false;
        });

        // Match doesn't count against turns - free turn!
    }

    handleMismatch(card1, card2) {
        // Increment mismatched turn counter
        this.mismatchedTurns++;
        this.updateTurnCounter();

        // Check if lost (5 mismatched turns)
        if (this.mismatchedTurns >= GAME_CONSTANTS.MAX_MISMATCHED_TURNS) {
            this.time.delayedCall(1000, () => {
                this.loseGame();
            });
            return;
        }

        // Store mismatched cards state for early turn start
        this.mismatchDisplayCards = [card1, card2];

        // Flip cards back after delay
        this.mismatchFlipTimer = this.time.delayedCall(GAME_CONSTANTS.FLIP_BACK_DELAY, () => {
            this.flipCard(card1, false);
            this.flipCard(card2, false);
            this.selectedCards = [];
            this.isProcessingTurn = false;
            this.mismatchDisplayCards = null;
            this.mismatchFlipTimer = null;
        });
    }

    showMatchCelebration(card1, card2) {
        // Create particle effect for matches
        const centerX = (card1.x + card2.x) / 2;
        const centerY = (card1.y + card2.y) / 2;

        // Simple confetti effect using rectangles
        for (let i = 0; i < 20; i++) {
            const confetti = this.add.rectangle(
                centerX,
                centerY,
                10,
                10,
                Phaser.Display.Color.RandomRGB().color
            );

            this.tweens.add({
                targets: confetti,
                x: centerX + Phaser.Math.Between(-200, 200),
                y: centerY + Phaser.Math.Between(-200, 200),
                alpha: 0,
                duration: 1000,
                ease: 'Cubic.easeOut',
                onComplete: () => confetti.destroy()
            });
        }
    }

    removeMatchedCards(card1, card2) {
        // Fade out and destroy matched cards
        this.tweens.add({
            targets: [card1, card2],
            alpha: 0,
            scale: 0.5,
            duration: 500,
            ease: 'Back.easeIn',
            onComplete: () => {
                card1.destroy();
                card2.destroy();
            }
        });
    }

    createTurnCounter() {
        const style = {
            fontSize: '42px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 4
        };

        // Create background for turn counter
        this.turnBackground = this.add.rectangle(540, 150, 500, 80, 0x000000, 0.7);
        this.turnBackground.setDepth(100);

        this.turnText = this.add.text(540, 150,
            `Intentos restantes: ${GAME_CONSTANTS.MAX_MISMATCHED_TURNS - this.mismatchedTurns}`,
            style
        ).setOrigin(0.5);
        this.turnText.setDepth(101);
    }

    updateTurnCounter() {
        const remaining = GAME_CONSTANTS.MAX_MISMATCHED_TURNS - this.mismatchedTurns;
        this.turnText.setText(`Intentos restantes: ${remaining}`);

        // Flash red if low on turns
        if (remaining <= 2) {
            this.tweens.add({
                targets: this.turnText,
                alpha: 0.3,
                duration: 200,
                yoyo: true,
                repeat: 2
            });
        }
    }

    resetInactivityTimer() {
        // Clear existing timers
        if (this.inactivityTimer) {
            this.inactivityTimer.remove();
        }
        if (this.returnTimer) {
            this.returnTimer.remove();
        }
        if (this.warningText) {
            this.warningText.destroy();
            this.warningText = null;
        }
        if (this.warningBackground) {
            this.warningBackground.destroy();
            this.warningBackground = null;
        }

        // Start inactivity warning timer
        this.inactivityTimer = this.time.delayedCall(GAME_CONSTANTS.INACTIVITY_WARNING, () => {
            this.showInactivityWarning();
        });
    }

    showInactivityWarning() {
        const style = {
            fontSize: '56px',
            fill: '#ffff00',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 6
        };

        // Create background for warning message
        this.warningBackground = this.add.rectangle(540, 960, 700, 120, 0x000000, 0.8);
        this.warningBackground.setDepth(200);

        this.warningText = this.add.text(540, 960,
            '¿Sigues ahí? Toca 2 cartas.',
            style
        ).setOrigin(0.5);
        this.warningText.setDepth(201);

        // Pulse animation for both background and text
        this.tweens.add({
            targets: [this.warningText, this.warningBackground],
            scale: 1.1,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // Return to lobby after INACTIVITY_RETURN seconds
        this.returnTimer = this.time.delayedCall(GAME_CONSTANTS.INACTIVITY_RETURN, () => {
            this.returnToLobby();
        });
    }

    winGame() {
        // Stop music
        if (this.bgMusic) {
            this.bgMusic.stop();
        }

        this.scene.start('WinnerScene');
    }

    loseGame() {
        // Stop music
        if (this.bgMusic) {
            this.bgMusic.stop();
        }

        this.scene.start('TryAgainScene');
    }

    returnToLobby() {
        // Stop music
        if (this.bgMusic) {
            this.bgMusic.stop();
        }

        this.scene.start('LobbyScene');
    }
}

// ======================
// WINNER SCENE
// ======================
class WinnerScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WinnerScene' });
    }

    create() {
        // Display winner background
        const winner = this.add.image(540, 960, 'winner-screen');
        winner.setDisplaySize(1080, 1920);

        // Show "¡Ganador!" text
        const style = {
            fontSize: '120px',
            fill: '#FFD700',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 10,
            fontStyle: 'bold'
        };

        const winText = this.add.text(540, 400, '¡GANADOR!', style).setOrigin(0.5);
        winText.setDepth(500); // Ensure text is above background but fireworks can go over it

        // Pulse animation
        this.tweens.add({
            targets: winText,
            scale: 1.2,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // Play fireworks sound (disabled until audio files are added)
        // this.sound.play('fireworks', { volume: 0.7 });

        // Create JavaScript fireworks animation
        this.createFireworks();

        // Return to lobby after 10 seconds or on tap
        this.time.delayedCall(10000, () => {
            this.scene.start('LobbyScene');
        });

        this.input.once('pointerdown', () => {
            this.scene.start('LobbyScene');
        });
    }

    createFireworks() {
        // Create multiple firework bursts
        for (let i = 0; i < 5; i++) {
            this.time.delayedCall(i * 1000, () => {
                this.createFireworkBurst();
            });
        }
    }

    createFireworkBurst() {
        const x = Phaser.Math.Between(200, 880);
        const y = Phaser.Math.Between(600, 1200);
        const colors = [0xFF0000, 0xFF6B00, 0xFFFF00, 0x00FF00, 0x0000FF, 0xFF00FF];

        // Create burst of particles
        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2;
            const speed = Phaser.Math.Between(100, 300);

            const particle = this.add.circle(
                x, y, 8,
                colors[Phaser.Math.Between(0, colors.length - 1)]
            );

            // Set depth to ensure fireworks appear on top of everything
            particle.setDepth(1000);

            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                scale: 0.2,
                duration: 2000,
                ease: 'Cubic.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }
}

// ======================
// TRY AGAIN SCENE
// ======================
class TryAgainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TryAgainScene' });
    }

    create() {
        // Display try again background
        const tryAgain = this.add.image(540, 960, 'tryagain-screen');
        tryAgain.setDisplaySize(1080, 1920);

        // Play trumpet fail sound (disabled until audio files are added)
        // this.sound.play('trumpet-fail', { volume: 0.6 });

        // Dim effect
        const dimOverlay = this.add.rectangle(540, 960, 1080, 1920, 0x000000, 0.3);

        // Show "Inténtalo otra vez" text
        const style = {
            fontSize: '72px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 8
        };

        this.add.text(540, 960, 'Inténtalo otra vez', style).setOrigin(0.5);

        // Return to lobby after 5 seconds or on tap
        this.time.delayedCall(5000, () => {
            this.scene.start('LobbyScene');
        });

        this.input.once('pointerdown', () => {
            this.scene.start('LobbyScene');
        });
    }
}

// ======================
// GAME INITIALIZATION
// ======================
const config = {
    type: Phaser.AUTO,
    width: 1080,
    height: 1920,
    parent: 'game-container',
    backgroundColor: '#1a0a2e',
    scene: [LobbyScene, PlayScene, WinnerScene, TryAgainScene]
};

const game = new Phaser.Game(config);
