// Muertos Card Matching Game
// Día de los Muertos themed memory game for dual-orientation display
// Portrait: 1080x1920 (Easy Mode) | Landscape: 1920x1080 (Hard Mode)

// Card types (10 regular + 1 winner)
const CARD_TYPES = {
    REGULAR: [
        'lady',
        'man',
        'pitcher',
        'dog',
        'cat',
        'cookies',
        'cross',
        'guitar',
        'kids',
        'owl'
    ],
    WINNER: 'winner'
};

// Configuration for Easy Mode (Portrait)
const EASY_CONFIG = {
    orientation: 'portrait',
    columns: 3,
    rows: 5,
    cardCount: 15,
    cardWidth: 200,
    cardHeight: 275,
    gapX: 80,
    gapY: 20,
    startX: 260,
    startY: 417.5,
    tiltRange: 4,
    offsetRange: 5,
    regularCardTypes: 6,  // Use 6 of the 10 regular card types
    winnerCards: 3
};

// Configuration for Hard Mode (Landscape)
const HARD_CONFIG = {
    orientation: 'landscape',
    columns: 7,
    rows: 3,
    cardCount: 21,
    cardWidth: 175,
    cardHeight: 241,
    gapX: 60,
    gapY: 70,
    startX: 175,
    startY: 336.5,
    tiltRange: 4,
    offsetRange: 5,
    regularCardTypes: 9,  // Use 9 of 10 available regular card types
    winnerCards: 3
};

// Game constants
const GAME_CONSTANTS = {
    MAX_MISMATCHED_TURNS: 5,
    FLIP_BACK_DELAY: 3000,
    INACTIVITY_WARNING: 45000,
    INACTIVITY_RETURN: 15000,
    MATCH_CELEBRATION_DURATION: 1000,
    END_SCREEN_DURATION: 7000  // 7 seconds for winner/play_again screens
};

// Global game state
const GAME_STATE = {
    difficulty: null,       // 'easy' or 'hard'
    config: null,          // Will hold EASY_CONFIG or HARD_CONFIG
    currentOrientation: null  // 'portrait' or 'landscape'
};

// Helper function to detect orientation
function detectOrientation() {
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
}

// ======================
// PRELOAD/BOOT SCENE
// ======================
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Show loading message with dialog frame
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Dialog frame for loading message
        const bgWidth = 720;
        const bgHeight = 160;
        this.loadingBg = this.add.rectangle(width / 2, height / 2, bgWidth, bgHeight, 0xF5D599, 1.0);
        this.loadingBg.setStrokeStyle(5, 0x000000);

        const style = {
            fontSize: '40px',
            fill: '#000',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        };

        this.loadingText = this.add.text(width / 2, height / 2,
            'Cargando... Por favor espere.', style).setOrigin(0.5);
    }

    create() {
        // Detect initial orientation
        GAME_STATE.currentOrientation = detectOrientation();

        // Move to difficulty select
        this.scene.start('DifficultySelectScene');
    }
}

// ======================
// DIFFICULTY SELECT SCENE
// ======================
class DifficultySelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DifficultySelectScene' });
    }

    preload() {
        // Update orientation
        GAME_STATE.currentOrientation = detectOrientation();

        // Load appropriate lobby background
        const prefix = GAME_STATE.currentOrientation === 'landscape' ? 'land_' : '';
        this.load.image('lobby', `assets/${prefix}lobby.jpg`);
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Display lobby background - show ENTIRE image without cropping
        const lobby = this.add.image(width / 2, height / 2, 'lobby');

        // Scale to fit entire image (letterbox if needed)
        const scaleX = width / lobby.width;
        const scaleY = height / lobby.height;
        const scale = Math.min(scaleX, scaleY);
        lobby.setScale(scale);
        lobby.setScrollFactor(0);
        lobby.setDepth(-100);

        // Dialog frame for difficulty selection
        const dialogWidth = 800;
        const dialogHeight = 600;
        const dialogBg = this.add.rectangle(width / 2, height / 2, dialogWidth, dialogHeight, 0xF5D599, 1.0);
        dialogBg.setStrokeStyle(6, 0x000000);
        dialogBg.setDepth(50);

        // Title text - on top of dialog
        const titleStyle = {
            fontSize: '64px',
            fill: '#000',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        };
        const titleText = this.add.text(width / 2, height / 2 - 200, 'Selecciona Dificultad', titleStyle).setOrigin(0.5);
        titleText.setDepth(51);

        // Button style
        const buttonStyle = {
            fontSize: '56px',
            fill: '#000',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        };

        // Easy button
        const easyBg = this.add.rectangle(width / 2, height / 2 - 60, 500, 100, 0x90EE90, 1.0);
        easyBg.setStrokeStyle(4, 0x000000);
        easyBg.setInteractive();
        easyBg.setDepth(51);
        const easyText = this.add.text(width / 2, height / 2 - 60, 'FÁCIL', buttonStyle).setOrigin(0.5);
        easyText.setDepth(52);

        easyBg.on('pointerover', () => {
            easyBg.setFillStyle(0x00aa00, 1.0);
            this.tweens.add({
                targets: [easyBg, easyText],
                scale: 1.1,
                duration: 200
            });
        });

        easyBg.on('pointerout', () => {
            easyBg.setFillStyle(0x006400, 1.0);
            this.tweens.add({
                targets: [easyBg, easyText],
                scale: 1.0,
                duration: 200
            });
        });

        easyBg.on('pointerdown', () => {
            GAME_STATE.difficulty = 'easy';
            GAME_STATE.config = EASY_CONFIG;
            this.scene.start('LobbyScene');
        });

        // Hard button
        const hardBg = this.add.rectangle(width / 2, height / 2 + 70, 500, 100, 0xFFB6C1, 1.0);
        hardBg.setStrokeStyle(4, 0x000000);
        hardBg.setInteractive();
        hardBg.setDepth(51);
        const hardText = this.add.text(width / 2, height / 2 + 70, 'DIFÍCIL', buttonStyle).setOrigin(0.5);
        hardText.setDepth(52);

        hardBg.on('pointerover', () => {
            hardBg.setFillStyle(0xFF69B4, 1.0);
            this.tweens.add({
                targets: [hardBg, hardText],
                scale: 1.05,
                duration: 200
            });
        });

        hardBg.on('pointerout', () => {
            hardBg.setFillStyle(0xFFB6C1, 1.0);
            this.tweens.add({
                targets: [hardBg, hardText],
                scale: 1.0,
                duration: 200
            });
        });

        hardBg.on('pointerdown', () => {
            GAME_STATE.difficulty = 'hard';
            GAME_STATE.config = HARD_CONFIG;
            this.scene.start('LobbyScene');
        });

        // Description text
        const descStyle = {
            fontSize: '28px',
            fill: '#000',
            fontFamily: 'Arial',
            align: 'center'
        };
        const descText = this.add.text(width / 2, height / 2 + 210,
            'Fácil: 15 cartas | Difícil: 21 cartas',
            descStyle).setOrigin(0.5);
        descText.setDepth(51);
    }
}

// ======================
// LOBBY SCENE
// ======================
class LobbyScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LobbyScene' });
    }

    preload() {
        // Update orientation
        GAME_STATE.currentOrientation = detectOrientation();

        // Load assets based on current orientation
        const prefix = GAME_STATE.currentOrientation === 'landscape' ? 'land_' : '';

        // Load screen backgrounds
        this.load.image('play-screen', `assets/${prefix}play.jpg`);
        this.load.image('winner-screen', `assets/${prefix}winner.jpg`);
        this.load.image('playagain-screen', `assets/${prefix}play_again.jpg`);

        // Load card back
        this.load.image('card-back', 'assets/card_back.png');

        // Load card faces
        CARD_TYPES.REGULAR.forEach(type => {
            this.load.image(`card-${type}`, `assets/card_${type}.png`);
        });
        this.load.image('card-winner', 'assets/card_winner.png');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Display lobby background - show ENTIRE image without cropping
        const lobby = this.add.image(width / 2, height / 2, 'lobby');

        // Scale to fit entire image (letterbox if needed)
        const scaleX = width / lobby.width;
        const scaleY = height / lobby.height;
        const scale = Math.min(scaleX, scaleY);
        lobby.setScale(scale);
        lobby.setScrollFactor(0);
        lobby.setDepth(-100);

        // Dialog frame for start message
        const textY = GAME_STATE.currentOrientation === 'portrait' ? height * 0.88 : height * 0.80;

        const msgBg = this.add.rectangle(width / 2, textY, 740, 110, 0xF5D599, 1.0);
        msgBg.setStrokeStyle(5, 0x000000);
        msgBg.setDepth(50);

        const style = {
            fontSize: '40px',
            fill: '#000',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        };

        const startText = this.add.text(width / 2, textY, 'Toca la pantalla para comenzar', style).setOrigin(0.5);
        startText.setDepth(51);

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
        // Update orientation
        GAME_STATE.currentOrientation = detectOrientation();

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Display play screen background - show ENTIRE image without cropping
        const playBg = this.add.image(width / 2, height / 2, 'play-screen');

        // Scale to fit entire image (letterbox if needed)
        const scaleX = width / playBg.width;
        const scaleY = height / playBg.height;
        const scale = Math.min(scaleX, scaleY);
        playBg.setScale(scale);
        playBg.setScrollFactor(0);
        playBg.setDepth(-100);

        // Game state
        this.mismatchedTurns = 0;
        this.selectedCards = [];
        this.isProcessingTurn = false;
        this.matchedCards = [];
        this.inactivityTimer = null;
        this.warningText = null;
        this.mismatchDisplayCards = null;
        this.mismatchFlipTimer = null;

        // Create deck and deal cards
        this.dealCards();

        // Display turn counter
        this.createTurnCounter();

        // Start inactivity timer
        this.resetInactivityTimer();

        // Add global input listener for screen touches
        this.input.on('pointerdown', (pointer) => {
            this.resetInactivityTimer();

            if (this.mismatchDisplayCards) {
                if (this.mismatchFlipTimer) {
                    this.mismatchFlipTimer.remove();
                    this.mismatchFlipTimer = null;
                }

                const [card1, card2] = this.mismatchDisplayCards;
                this.flipCard(card1, false);
                this.flipCard(card2, false);

                this.mismatchDisplayCards = null;
                this.selectedCards = [];
                this.isProcessingTurn = false;
            }
        });
    }

    dealCards() {
        const config = GAME_STATE.config;
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const deck = [];

        // Add winner cards
        for (let i = 0; i < config.winnerCards; i++) {
            deck.push({ type: CARD_TYPES.WINNER, id: `winner-${i}` });
        }

        // Calculate how many regular cards we need
        const remainingCards = config.cardCount - config.winnerCards;
        const pairsNeeded = remainingCards / 2;

        // Randomly select the required number of regular card types
        const shuffledTypes = Phaser.Utils.Array.Shuffle([...CARD_TYPES.REGULAR]);
        const selectedTypes = shuffledTypes.slice(0, pairsNeeded);

        // Add pairs of each selected type
        selectedTypes.forEach(type => {
            deck.push({ type: type, id: `${type}-1` });
            deck.push({ type: type, id: `${type}-2` });
        });

        // Shuffle the deck
        Phaser.Utils.Array.Shuffle(deck);

        // Calculate grid positioning based on actual screen size
        const totalCardWidth = config.columns * config.cardWidth;
        const totalGapWidth = (config.columns - 1) * config.gapX;
        const gridWidth = totalCardWidth + totalGapWidth;

        const totalCardHeight = config.rows * config.cardHeight;
        const totalGapHeight = (config.rows - 1) * config.gapY;
        const gridHeight = totalCardHeight + totalGapHeight;

        // Center the grid in the screen
        const startX = (width - gridWidth) / 2 + config.cardWidth / 2;
        const startY = (height - gridHeight) / 2 + config.cardHeight / 2;

        // Deal cards in grid
        this.cards = [];
        let index = 0;

        for (let row = 0; row < config.rows; row++) {
            for (let col = 0; col < config.columns; col++) {
                const cardData = deck[index];
                const x = startX + (col * (config.cardWidth + config.gapX));
                const y = startY + (row * (config.cardHeight + config.gapY));

                const tilt = Phaser.Math.Between(-config.tiltRange, config.tiltRange);
                const offsetX = Phaser.Math.Between(-config.offsetRange, config.offsetRange);
                const offsetY = Phaser.Math.Between(-config.offsetRange, config.offsetRange);

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
        const config = GAME_STATE.config;
        const container = this.add.container(x, y);

        const back = this.add.image(0, 0, 'card-back');
        back.setDisplaySize(config.cardWidth, config.cardHeight);

        const front = this.add.image(0, 0, `card-${type}`);
        front.setDisplaySize(config.cardWidth, config.cardHeight);
        front.setVisible(false);

        container.add([back, front]);
        container.setSize(config.cardWidth, config.cardHeight);
        container.setAngle(rotation);
        container.setInteractive();

        container.cardData = {
            type: type,
            id: id,
            isFlipped: false,
            isMatched: false,
            back: back,
            front: front
        };

        container.on('pointerdown', () => this.onCardClick(container));

        return container;
    }

    onCardClick(card) {
        this.resetInactivityTimer();

        if (this.mismatchDisplayCards) {
            if (this.mismatchFlipTimer) {
                this.mismatchFlipTimer.remove();
                this.mismatchFlipTimer = null;
            }

            const [card1, card2] = this.mismatchDisplayCards;
            this.flipCard(card1, false);
            this.flipCard(card2, false);

            this.mismatchDisplayCards = null;
            this.selectedCards = [];
            this.isProcessingTurn = false;

            if (card !== card1 && card !== card2 && !card.cardData.isMatched) {
                this.flipCard(card, true);
                this.selectedCards.push(card);
            }
            return;
        }

        if (this.isProcessingTurn || card.cardData.isFlipped || card.cardData.isMatched) {
            return;
        }

        if (this.selectedCards.length >= 2) {
            return;
        }

        this.flipCard(card, true);
        this.selectedCards.push(card);

        if (this.selectedCards.length === 2) {
            this.isProcessingTurn = true;
            this.time.delayedCall(300, () => this.checkMatch());
        }
    }

    flipCard(card, showFront) {
        this.tweens.add({
            targets: card,
            scaleX: 0,
            duration: 150,
            ease: 'Cubic.easeIn',
            onComplete: () => {
                card.cardData.isFlipped = showFront;
                card.cardData.back.setVisible(!showFront);
                card.cardData.front.setVisible(showFront);

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
            this.handleMatch(card1, card2);
        } else {
            this.handleMismatch(card1, card2);
        }
    }

    handleMatch(card1, card2) {
        card1.cardData.isMatched = true;
        card2.cardData.isMatched = true;
        this.matchedCards.push(card1, card2);

        this.showMatchCelebration(card1, card2);

        if (card1.cardData.type === CARD_TYPES.WINNER) {
            this.time.delayedCall(GAME_CONSTANTS.MATCH_CELEBRATION_DURATION, () => {
                this.winGame();
            });
            return;
        }

        this.time.delayedCall(GAME_CONSTANTS.MATCH_CELEBRATION_DURATION, () => {
            this.removeMatchedCards(card1, card2);
            this.selectedCards = [];
            this.isProcessingTurn = false;
        });
    }

    handleMismatch(card1, card2) {
        this.mismatchedTurns++;
        this.updateTurnCounter();

        if (this.mismatchedTurns >= GAME_CONSTANTS.MAX_MISMATCHED_TURNS) {
            this.time.delayedCall(1000, () => {
                this.loseGame();
            });
            return;
        }

        this.mismatchDisplayCards = [card1, card2];

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
        const centerX = (card1.x + card2.x) / 2;
        const centerY = (card1.y + card2.y) / 2;

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
        const width = this.cameras.main.width;
        const centerY = GAME_STATE.currentOrientation === 'portrait' ? 150 : 80;

        const style = {
            fontSize: '36px',
            fill: '#000',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        };

        // Dialog frame
        this.turnBackground = this.add.rectangle(width / 2, centerY, 500, 80, 0xF5D599, 1.0);
        this.turnBackground.setStrokeStyle(4, 0x000000);
        this.turnBackground.setDepth(100);

        this.turnText = this.add.text(width / 2, centerY,
            `Intentos restantes: ${GAME_CONSTANTS.MAX_MISMATCHED_TURNS - this.mismatchedTurns}`,
            style
        ).setOrigin(0.5);
        this.turnText.setDepth(101);
    }

    updateTurnCounter() {
        const remaining = GAME_CONSTANTS.MAX_MISMATCHED_TURNS - this.mismatchedTurns;
        this.turnText.setText(`Intentos restantes: ${remaining}`);

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
        if (this.modalOverlay) {
            this.modalOverlay.destroy();
            this.modalOverlay = null;
        }

        this.inactivityTimer = this.time.delayedCall(GAME_CONSTANTS.INACTIVITY_WARNING, () => {
            this.showInactivityWarning();
        });
    }

    showInactivityWarning() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create modal overlay (dims entire screen)
        this.modalOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        this.modalOverlay.setDepth(199);

        const style = {
            fontSize: '44px',
            fill: '#000',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        };

        // Dialog frame
        this.warningBackground = this.add.rectangle(width / 2, height / 2, 700, 150, 0xF5D599, 1.0);
        this.warningBackground.setStrokeStyle(6, 0x000000);
        this.warningBackground.setDepth(200);

        this.warningText = this.add.text(width / 2, height / 2,
            '¿Sigues ahí? Toca 2 cartas.',
            style
        ).setOrigin(0.5);
        this.warningText.setDepth(201);

        this.tweens.add({
            targets: [this.warningText, this.warningBackground],
            scale: 1.05,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        this.returnTimer = this.time.delayedCall(GAME_CONSTANTS.INACTIVITY_RETURN, () => {
            this.returnToDifficulty();
        });
    }

    winGame() {
        this.scene.start('WinnerScene');
    }

    loseGame() {
        this.scene.start('PlayAgainScene');
    }

    returnToDifficulty() {
        this.scene.start('DifficultySelectScene');
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
        // Update orientation
        GAME_STATE.currentOrientation = detectOrientation();

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Display winner background - show ENTIRE image without cropping
        const winner = this.add.image(width / 2, height / 2, 'winner-screen');

        // Scale to fit entire image (letterbox if needed)
        const scaleX = width / winner.width;
        const scaleY = height / winner.height;
        const scale = Math.min(scaleX, scaleY);
        winner.setScale(scale);
        winner.setScrollFactor(0);
        winner.setDepth(-100);

        // Dialog frame for winner message
        const msgBg = this.add.rectangle(width / 2, height * 0.3, 650, 180, 0xF5D599, 1.0);
        msgBg.setStrokeStyle(8, 0x000000);
        msgBg.setDepth(499);

        const style = {
            fontSize: '90px',
            fill: '#000',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        };

        const winText = this.add.text(width / 2, height * 0.3, '¡GANADOR!', style).setOrigin(0.5);
        winText.setDepth(500);

        this.tweens.add({
            targets: [winText, msgBg],
            scale: 1.05,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        this.createFireworks();

        // 7 seconds timeout → return to difficulty select
        this.timeoutEvent = this.time.delayedCall(GAME_CONSTANTS.END_SCREEN_DURATION, () => {
            this.scene.start('DifficultySelectScene');
        });

        // Touch → return to play screen (restart game)
        this.input.once('pointerdown', () => {
            if (this.timeoutEvent) {
                this.timeoutEvent.remove();
            }
            this.scene.start('PlayScene');
        });
    }

    createFireworks() {
        for (let i = 0; i < 5; i++) {
            this.time.delayedCall(i * 1000, () => {
                this.createFireworkBurst();
            });
        }
    }

    createFireworkBurst() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const x = Phaser.Math.Between(width * 0.2, width * 0.8);
        const y = Phaser.Math.Between(height * 0.4, height * 0.7);
        const colors = [0xFF0000, 0xFF6B00, 0xFFFF00, 0x00FF00, 0x0000FF, 0xFF00FF];

        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2;
            const speed = Phaser.Math.Between(100, 300);

            const particle = this.add.circle(
                x, y, 8,
                colors[Phaser.Math.Between(0, colors.length - 1)]
            );

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
// PLAY AGAIN SCENE
// ======================
class PlayAgainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PlayAgainScene' });
    }

    create() {
        // Update orientation
        GAME_STATE.currentOrientation = detectOrientation();

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Display play again background - show ENTIRE image without cropping
        const playAgain = this.add.image(width / 2, height / 2, 'playagain-screen');

        // Scale to fit entire image (letterbox if needed)
        const scaleX = width / playAgain.width;
        const scaleY = height / playAgain.height;
        const scale = Math.min(scaleX, scaleY);
        playAgain.setScale(scale);
        playAgain.setScrollFactor(0);
        playAgain.setDepth(-100);

        const dimOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.3);

        // Dialog frame for message
        const msgBg = this.add.rectangle(width / 2, height / 2, 700, 150, 0xF5D599, 1.0);
        msgBg.setStrokeStyle(6, 0x000000);

        const style = {
            fontSize: '52px',
            fill: '#000',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        };

        this.add.text(width / 2, height / 2, 'Inténtalo otra vez', style).setOrigin(0.5);

        // 7 seconds timeout → return to difficulty select
        this.timeoutEvent = this.time.delayedCall(GAME_CONSTANTS.END_SCREEN_DURATION, () => {
            this.scene.start('DifficultySelectScene');
        });

        // Touch → return to play screen (restart game)
        this.input.once('pointerdown', () => {
            if (this.timeoutEvent) {
                this.timeoutEvent.remove();
            }
            this.scene.start('PlayScene');
        });
    }
}

// ======================
// GAME INITIALIZATION
// ======================
const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.RESIZE,
        parent: 'game-container',
        width: '100%',
        height: '100%',
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor: '#1a0a2e',
    scene: [BootScene, DifficultySelectScene, LobbyScene, PlayScene, WinnerScene, PlayAgainScene]
};

const game = new Phaser.Game(config);
