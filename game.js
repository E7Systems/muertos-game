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

// Configuration for Easy Mode
const EASY_CONFIG = {
    cardCount: 15,
    tiltRange: 4,
    offsetRange: 5,
    regularCardTypes: 6,  // Use 6 of the 10 regular card types
    winnerCards: 3
};

// Configuration for Hard Mode
const HARD_CONFIG = {
    cardCount: 21,
    tiltRange: 4,
    offsetRange: 5,
    regularCardTypes: 9,  // Use 9 of 10 available regular card types
    winnerCards: 3
};

// Function to calculate grid layout based on orientation and card count
function calculateGridLayout(cardCount, screenWidth, screenHeight) {
    const isLandscape = screenWidth > screenHeight;

    if (isLandscape) {
        // Landscape: max 3 rows, calculate columns
        const maxRows = 3;
        const columns = Math.ceil(cardCount / maxRows);
        const rows = Math.min(maxRows, Math.ceil(cardCount / columns));
        return { columns, rows };
    } else {
        // Portrait: max 3 columns, calculate rows
        const maxColumns = 3;
        const rows = Math.ceil(cardCount / maxColumns);
        const columns = Math.min(maxColumns, Math.ceil(cardCount / rows));
        return { columns, rows };
    }
}

// Function to calculate card dimensions and spacing based on grid and play area
function calculateCardDimensions(gridLayout, playWidth, playHeight) {
    const { columns, rows } = gridLayout;

    // Card aspect ratio is 1:1.375 (width:height)
    const cardAspectRatio = 200 / 275;

    // Calculate maximum card size that fits within play area
    // Try fitting based on width
    const gapXRatio = 0.4; // Gap is 40% of card width
    const gapYRatio = 0.073; // Gap is ~7.3% of card height (20px / 275px)

    const maxCardWidthFromWidth = playWidth / (columns + (columns - 1) * gapXRatio);
    const maxCardHeightFromWidth = maxCardWidthFromWidth / cardAspectRatio;

    // Try fitting based on height
    const maxCardHeightFromHeight = playHeight / (rows + (rows - 1) * gapYRatio);
    const maxCardWidthFromHeight = maxCardHeightFromHeight * cardAspectRatio;

    // Use the smaller dimension to ensure cards fit
    let cardWidth, cardHeight;
    if (maxCardWidthFromWidth * (rows + (rows - 1) * gapYRatio) / cardAspectRatio <= playHeight) {
        cardWidth = maxCardWidthFromWidth;
        cardHeight = maxCardHeightFromWidth;
    } else {
        cardWidth = maxCardWidthFromHeight;
        cardHeight = maxCardHeightFromHeight;
    }

    // Calculate gaps
    const gapX = cardWidth * gapXRatio;
    const gapY = cardHeight * gapYRatio;

    return {
        cardWidth: Math.floor(cardWidth),
        cardHeight: Math.floor(cardHeight),
        gapX: Math.floor(gapX),
        gapY: Math.floor(gapY)
    };
}

// Game constants
const GAME_CONSTANTS = {
    EASY_MAX_TURNS: 5,
    HARD_MAX_TURNS: 10,
    FLIP_BACK_DELAY: 3000,
    INACTIVITY_WARNING: 45000,
    INACTIVITY_RETURN: 15000,
    MATCH_CELEBRATION_DURATION: 1000,
    END_SCREEN_DURATION: 15000  // 15 seconds for winner/play_again screens with advice
};

// App color palette
const APP_COLORS = {
    YELLOW: 0xffd24d,
    ORANGE: 0xbe3d12,
    GREEN: 0x4a7158,
    RED: 0xbb3612,
    DIALOG_BG: 0xF5D599
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
        this.loadingBg = this.add.rectangle(width / 2, height / 2, bgWidth, bgHeight, APP_COLORS.DIALOG_BG, 1.0);
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

        // Portrait mode: always Easy, skip difficulty selection
        // Landscape mode: show difficulty selection
        if (GAME_STATE.currentOrientation === 'portrait') {
            GAME_STATE.difficulty = 'easy';
            GAME_STATE.config = EASY_CONFIG;
            this.scene.start('LobbyScene');
        } else {
            this.scene.start('DifficultySelectScene');
        }
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

        // Display lobby background - STRETCH to fill entire screen
        const lobby = this.add.image(width / 2, height / 2, 'lobby');
        lobby.setDisplaySize(width, height);
        lobby.setScrollFactor(0);
        lobby.setDepth(-100);

        // Dialog frame for difficulty selection - 2/3 smaller with rounded corners
        const dialogWidth = 533;
        const dialogHeight = 400;
        const cornerRadius = 20;

        const dialogBg = this.add.graphics();
        dialogBg.fillStyle(APP_COLORS.DIALOG_BG, 1.0);
        dialogBg.lineStyle(6, 0x000000, 1.0);
        dialogBg.fillRoundedRect(width / 2 - dialogWidth / 2, height / 2 - dialogHeight / 2, dialogWidth, dialogHeight, cornerRadius);
        dialogBg.strokeRoundedRect(width / 2 - dialogWidth / 2, height / 2 - dialogHeight / 2, dialogWidth, dialogHeight, cornerRadius);
        dialogBg.setDepth(50);

        // Header text - "Modo Experto" at top
        const headerStyle = {
            fontSize: '42px',
            fill: '#000',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        };
        const headerText = this.add.text(width / 2, height / 2 - 133, 'Modo Experto', headerStyle).setOrigin(0.5);
        headerText.setDepth(51);

        // Button style
        const buttonStyle = {
            fontSize: '38px',
            fill: '#000',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        };

        // Easy button (Green) with rounded corners
        const buttonWidth = 333;
        const buttonHeight = 67;
        const buttonRadius = 15;

        const easyBg = this.add.graphics();
        easyBg.fillStyle(APP_COLORS.GREEN, 1.0);
        easyBg.lineStyle(4, 0x000000, 1.0);
        easyBg.fillRoundedRect(width / 2 - buttonWidth / 2, height / 2 - 40 - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
        easyBg.strokeRoundedRect(width / 2 - buttonWidth / 2, height / 2 - 40 - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
        easyBg.setDepth(51);
        easyBg.setInteractive(new Phaser.Geom.Rectangle(width / 2 - buttonWidth / 2, height / 2 - 40 - buttonHeight / 2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);

        const easyText = this.add.text(width / 2, height / 2 - 40, 'FÁCIL', buttonStyle).setOrigin(0.5);
        easyText.setDepth(52);

        easyBg.on('pointerover', () => {
            easyBg.clear();
            easyBg.fillStyle(APP_COLORS.YELLOW, 1.0);
            easyBg.lineStyle(4, 0x000000, 1.0);
            easyBg.fillRoundedRect(width / 2 - buttonWidth / 2, height / 2 - 40 - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
            easyBg.strokeRoundedRect(width / 2 - buttonWidth / 2, height / 2 - 40 - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
            this.tweens.add({
                targets: [easyText],
                scale: 1.05,
                duration: 200
            });
        });

        easyBg.on('pointerout', () => {
            easyBg.clear();
            easyBg.fillStyle(APP_COLORS.GREEN, 1.0);
            easyBg.lineStyle(4, 0x000000, 1.0);
            easyBg.fillRoundedRect(width / 2 - buttonWidth / 2, height / 2 - 40 - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
            easyBg.strokeRoundedRect(width / 2 - buttonWidth / 2, height / 2 - 40 - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
            this.tweens.add({
                targets: [easyText],
                scale: 1.0,
                duration: 200
            });
        });

        easyBg.on('pointerdown', () => {
            GAME_STATE.difficulty = 'easy';
            GAME_STATE.config = EASY_CONFIG;
            this.scene.start('LobbyScene');
        });

        // Hard button (Orange) with rounded corners
        const hardBg = this.add.graphics();
        hardBg.fillStyle(APP_COLORS.ORANGE, 1.0);
        hardBg.lineStyle(4, 0x000000, 1.0);
        hardBg.fillRoundedRect(width / 2 - buttonWidth / 2, height / 2 + 47 - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
        hardBg.strokeRoundedRect(width / 2 - buttonWidth / 2, height / 2 + 47 - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
        hardBg.setDepth(51);
        hardBg.setInteractive(new Phaser.Geom.Rectangle(width / 2 - buttonWidth / 2, height / 2 + 47 - buttonHeight / 2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);

        const hardText = this.add.text(width / 2, height / 2 + 47, 'DIFÍCIL', buttonStyle).setOrigin(0.5);
        hardText.setDepth(52);

        hardBg.on('pointerover', () => {
            hardBg.clear();
            hardBg.fillStyle(APP_COLORS.RED, 1.0);
            hardBg.lineStyle(4, 0x000000, 1.0);
            hardBg.fillRoundedRect(width / 2 - buttonWidth / 2, height / 2 + 47 - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
            hardBg.strokeRoundedRect(width / 2 - buttonWidth / 2, height / 2 + 47 - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
            this.tweens.add({
                targets: [hardText],
                scale: 1.05,
                duration: 200
            });
        });

        hardBg.on('pointerout', () => {
            hardBg.clear();
            hardBg.fillStyle(APP_COLORS.ORANGE, 1.0);
            hardBg.lineStyle(4, 0x000000, 1.0);
            hardBg.fillRoundedRect(width / 2 - buttonWidth / 2, height / 2 + 47 - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
            hardBg.strokeRoundedRect(width / 2 - buttonWidth / 2, height / 2 + 47 - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
            this.tweens.add({
                targets: [hardText],
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
            fontSize: '19px',
            fill: '#000',
            fontFamily: 'Arial',
            align: 'center',
            wordWrap: { width: dialogWidth - 40 }
        };
        const descText = this.add.text(width / 2, height / 2 + 140,
            'Fácil: 15 cartas, 5 intentos\nDifícil: 21 cartas, 10 intentos',
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

        // Load lobby background (needed for portrait mode which skips DifficultySelectScene)
        this.load.image('lobby', `assets/${prefix}lobby.jpg`);

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

        // Display lobby background - STRETCH to fill entire screen
        const lobby = this.add.image(width / 2, height / 2, 'lobby');
        lobby.setDisplaySize(width, height);
        lobby.setScrollFactor(0);
        lobby.setDepth(-100);

        // Dialog frame for start message
        const textY = GAME_STATE.currentOrientation === 'portrait' ? height * 0.88 : height * 0.80;

        const msgBg = this.add.rectangle(width / 2, textY, 740, 110, APP_COLORS.DIALOG_BG, 1.0);
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

        // Display play screen background - STRETCH to fill entire screen
        const playBg = this.add.image(width / 2, height / 2, 'play-screen');
        playBg.setDisplaySize(width, height);
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

        // Calculate play area with margins: 12% vertical, 8% horizontal
        const marginX = width * 0.08;
        const marginY = height * 0.12;
        const playWidth = width - (2 * marginX);
        const playHeight = height - (2 * marginY);

        // Calculate dynamic grid layout based on orientation
        const gridLayout = calculateGridLayout(config.cardCount, width, height);
        const cardDimensions = calculateCardDimensions(gridLayout, playWidth, playHeight);

        // Store calculated dimensions for use in createCard
        this.cardWidth = cardDimensions.cardWidth;
        this.cardHeight = cardDimensions.cardHeight;
        this.gridLayout = gridLayout;

        // Calculate grid positioning to fit within play area
        const totalCardWidth = gridLayout.columns * cardDimensions.cardWidth;
        const totalGapWidth = (gridLayout.columns - 1) * cardDimensions.gapX;
        const gridWidth = totalCardWidth + totalGapWidth;

        const totalCardHeight = gridLayout.rows * cardDimensions.cardHeight;
        const totalGapHeight = (gridLayout.rows - 1) * cardDimensions.gapY;
        const gridHeight = totalCardHeight + totalGapHeight;

        // Center the grid within the play area
        const startX = marginX + (playWidth - gridWidth) / 2 + cardDimensions.cardWidth / 2;
        const startY = marginY + (playHeight - gridHeight) / 2 + cardDimensions.cardHeight / 2;

        // Deal cards in grid
        this.cards = [];
        let index = 0;

        for (let row = 0; row < gridLayout.rows; row++) {
            for (let col = 0; col < gridLayout.columns; col++) {
                const cardData = deck[index];
                const x = startX + (col * (cardDimensions.cardWidth + cardDimensions.gapX));
                const y = startY + (row * (cardDimensions.cardHeight + cardDimensions.gapY));

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
        const container = this.add.container(x, y);

        const back = this.add.image(0, 0, 'card-back');
        back.setDisplaySize(this.cardWidth, this.cardHeight);

        const front = this.add.image(0, 0, `card-${type}`);
        front.setDisplaySize(this.cardWidth, this.cardHeight);
        front.setVisible(false);

        container.add([back, front]);
        container.setSize(this.cardWidth, this.cardHeight);
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

        const maxTurns = GAME_STATE.difficulty === 'easy' ? GAME_CONSTANTS.EASY_MAX_TURNS : GAME_CONSTANTS.HARD_MAX_TURNS;

        if (this.mismatchedTurns >= maxTurns) {
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

        // Get max turns based on difficulty
        const maxTurns = GAME_STATE.difficulty === 'easy' ? GAME_CONSTANTS.EASY_MAX_TURNS : GAME_CONSTANTS.HARD_MAX_TURNS;

        // Dialog frame
        this.turnBackground = this.add.rectangle(width / 2, centerY, 500, 80, APP_COLORS.DIALOG_BG, 1.0);
        this.turnBackground.setStrokeStyle(4, 0x000000);
        this.turnBackground.setDepth(100);

        this.turnText = this.add.text(width / 2, centerY,
            `Intentos restantes: ${maxTurns - this.mismatchedTurns}`,
            style
        ).setOrigin(0.5);
        this.turnText.setDepth(101);
    }

    updateTurnCounter() {
        const maxTurns = GAME_STATE.difficulty === 'easy' ? GAME_CONSTANTS.EASY_MAX_TURNS : GAME_CONSTANTS.HARD_MAX_TURNS;
        const remaining = maxTurns - this.mismatchedTurns;
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

        // Dialog frame (Yellow for warning)
        this.warningBackground = this.add.rectangle(width / 2, height / 2, 700, 150, APP_COLORS.YELLOW, 1.0);
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
        // Portrait mode: return to lobby with Easy mode
        // Landscape mode: return to difficulty selection
        if (GAME_STATE.currentOrientation === 'portrait') {
            GAME_STATE.difficulty = 'easy';
            GAME_STATE.config = EASY_CONFIG;
            this.scene.start('LobbyScene');
        } else {
            this.scene.start('DifficultySelectScene');
        }
    }
}

// ======================
// WINNER SCENE
// ======================
class WinnerScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WinnerScene' });
    }

    preload() {
        // Load fortunes file
        this.load.text('fortunes', 'assets/fortunes.txt');
        // Load card_lady for fortune display
        this.load.image('fortune-lady', 'assets/card_lady.png');
    }

    create() {
        // Update orientation
        GAME_STATE.currentOrientation = detectOrientation();

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Display winner background - STRETCH to fill entire screen
        const winner = this.add.image(width / 2, height / 2, 'winner-screen');
        winner.setDisplaySize(width, height);
        winner.setScrollFactor(0);
        winner.setDepth(-100);

        this.createFireworks();

        // Display fortune in upper right quadrant
        this.displayFortune(width, height);

        // 7 seconds timeout → return to start (difficulty select in landscape, lobby in portrait)
        this.timeoutEvent = this.time.delayedCall(GAME_CONSTANTS.END_SCREEN_DURATION, () => {
            if (GAME_STATE.currentOrientation === 'portrait') {
                GAME_STATE.difficulty = 'easy';
                GAME_STATE.config = EASY_CONFIG;
                this.scene.start('LobbyScene');
            } else {
                this.scene.start('DifficultySelectScene');
            }
        });

        // Touch → return to play screen (restart game)
        this.input.once('pointerdown', () => {
            if (this.timeoutEvent) {
                this.timeoutEvent.remove();
            }
            this.scene.start('PlayScene');
        });
    }

    displayFortune(width, height) {
        // Get random fortune from lines 1-50
        const fortunesText = this.cache.text.get('fortunes');
        const lines = fortunesText.split('\n').filter(line => line.trim() !== '');
        const randomIndex = Phaser.Math.Between(0, Math.min(49, lines.length - 1));
        const fortuneLine = lines[randomIndex];

        // Split by em-dash delimiter
        const parts = fortuneLine.split(' — ');
        if (parts.length < 2) return;

        const spanish = parts[0].trim();
        const english = parts[1].trim();

        // Position based on orientation
        let fortuneX, fortuneY, maxWidth, spanishFontSize, englishFontSize;
        if (GAME_STATE.currentOrientation === 'portrait') {
            // Portrait: centered horizontally, positioned vertically between 60%-80%
            fortuneX = width * 0.5;
            fortuneY = height * 0.7; // Center of 60%-80% range
            maxWidth = width * 0.6;  // Use 60% of screen width
            // Reduce font size by 20% for portrait
            spanishFontSize = '32px';
            englishFontSize = '29px';
        } else {
            // Landscape: upper right quadrant
            fortuneX = width * 0.75;
            fortuneY = height * 0.25;
            maxWidth = width * 0.22;
            spanishFontSize = '40px';
            englishFontSize = '36px';
        }

        // Create container for fortune display
        const fortuneContainer = this.add.container(fortuneX, fortuneY);
        fortuneContainer.setDepth(500);

        // Add card_lady image (150px wide)
        const ladyImage = this.add.image(-maxWidth / 2 + 75, 0, 'fortune-lady');
        const imageWidth = 150;
        const imageHeight = imageWidth * (275 / 200); // Maintain card aspect ratio
        ladyImage.setDisplaySize(imageWidth, imageHeight);
        fortuneContainer.add(ladyImage);

        // Spanish text (bold, beige color)
        const spanishStyle = {
            fontSize: spanishFontSize,
            fill: '#F5D599',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            wordWrap: { width: maxWidth - 160 },
            align: 'left'
        };
        const spanishText = this.add.text(-maxWidth / 2 + 160, -imageHeight / 2, spanish, spanishStyle);
        spanishText.setOrigin(0, 0);
        fortuneContainer.add(spanishText);

        // English text (bold, beige color)
        const englishStyle = {
            fontSize: englishFontSize,
            fill: '#F5D599',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            wordWrap: { width: maxWidth - 160 },
            align: 'left'
        };
        const englishText = this.add.text(-maxWidth / 2 + 160, -imageHeight / 2 + spanishText.height + 10, english, englishStyle);
        englishText.setOrigin(0, 0);
        fortuneContainer.add(englishText);
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

    preload() {
        // Load fortunes file
        this.load.text('fortunes', 'assets/fortunes.txt');
        // Load card_lady for fortune display
        this.load.image('fortune-lady', 'assets/card_lady.png');
    }

    create() {
        // Update orientation
        GAME_STATE.currentOrientation = detectOrientation();

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Display play again background - STRETCH to fill entire screen
        const playAgain = this.add.image(width / 2, height / 2, 'playagain-screen');
        playAgain.setDisplaySize(width, height);
        playAgain.setScrollFactor(0);
        playAgain.setDepth(-100);

        // Display fortune in upper right quadrant
        this.displayFortune(width, height);

        // 7 seconds timeout → return to start (difficulty select in landscape, lobby in portrait)
        this.timeoutEvent = this.time.delayedCall(GAME_CONSTANTS.END_SCREEN_DURATION, () => {
            if (GAME_STATE.currentOrientation === 'portrait') {
                GAME_STATE.difficulty = 'easy';
                GAME_STATE.config = EASY_CONFIG;
                this.scene.start('LobbyScene');
            } else {
                this.scene.start('DifficultySelectScene');
            }
        });

        // Touch → return to play screen (restart game)
        this.input.once('pointerdown', () => {
            if (this.timeoutEvent) {
                this.timeoutEvent.remove();
            }
            this.scene.start('PlayScene');
        });
    }

    displayFortune(width, height) {
        // Get random fortune from lines 1-50
        const fortunesText = this.cache.text.get('fortunes');
        const lines = fortunesText.split('\n').filter(line => line.trim() !== '');
        const randomIndex = Phaser.Math.Between(0, Math.min(49, lines.length - 1));
        const fortuneLine = lines[randomIndex];

        // Split by em-dash delimiter
        const parts = fortuneLine.split(' — ');
        if (parts.length < 2) return;

        const spanish = parts[0].trim();
        const english = parts[1].trim();

        // Position based on orientation
        let fortuneX, fortuneY, maxWidth, spanishFontSize, englishFontSize;
        if (GAME_STATE.currentOrientation === 'portrait') {
            // Portrait: centered horizontally, positioned vertically between 60%-80%
            fortuneX = width * 0.5;
            fortuneY = height * 0.7; // Center of 60%-80% range
            maxWidth = width * 0.6;  // Use 60% of screen width
            // Reduce font size by 20% for portrait
            spanishFontSize = '32px';
            englishFontSize = '29px';
        } else {
            // Landscape: upper right quadrant
            fortuneX = width * 0.75;
            fortuneY = height * 0.25;
            maxWidth = width * 0.22;
            spanishFontSize = '40px';
            englishFontSize = '36px';
        }

        // Create container for fortune display
        const fortuneContainer = this.add.container(fortuneX, fortuneY);
        fortuneContainer.setDepth(500);

        // Add card_lady image (150px wide)
        const ladyImage = this.add.image(-maxWidth / 2 + 75, 0, 'fortune-lady');
        const imageWidth = 150;
        const imageHeight = imageWidth * (275 / 200); // Maintain card aspect ratio
        ladyImage.setDisplaySize(imageWidth, imageHeight);
        fortuneContainer.add(ladyImage);

        // Spanish text (bold, beige color)
        const spanishStyle = {
            fontSize: spanishFontSize,
            fill: '#F5D599',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            wordWrap: { width: maxWidth - 160 },
            align: 'left'
        };
        const spanishText = this.add.text(-maxWidth / 2 + 160, -imageHeight / 2, spanish, spanishStyle);
        spanishText.setOrigin(0, 0);
        fortuneContainer.add(spanishText);

        // English text (bold, beige color)
        const englishStyle = {
            fontSize: englishFontSize,
            fill: '#F5D599',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            wordWrap: { width: maxWidth - 160 },
            align: 'left'
        };
        const englishText = this.add.text(-maxWidth / 2 + 160, -imageHeight / 2 + spanishText.height + 10, english, englishStyle);
        englishText.setOrigin(0, 0);
        fortuneContainer.add(englishText);
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
