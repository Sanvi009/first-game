const gameContainer = document.getElementById("game-container");
const player = document.getElementById("player");
const scoreDisplay = document.getElementById("score");
const liveScoreDisplay = document.getElementById("live-score-value");
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over");
const finalScoreDisplay = document.getElementById("final-score");
const bestScoreDisplay = document.getElementById("best-score-display");
const bestScoreFinalDisplay = document.getElementById("best-score-final");
const aboutCreator = document.getElementById("about-creator");
const playerLine = document.getElementById("player-line");

// Audio Elements
const backgroundMusic = document.getElementById("background-music");
const fireSound = document.getElementById("fire-sound");
const hitSound = document.getElementById("hit-sound");
const gameoverSound = document.getElementById("gameover-sound");
const hasina1Sound = document.getElementById("hasina1-sound");
const hasina2Sound = document.getElementById("hasina2-sound");
const hasina3Sound = document.getElementById("hasina3-sound");

// Set volume levels
backgroundMusic.volume = 0.1;
fireSound.volume = 1.0;
hitSound.volume = 1.0;
gameoverSound.volume = 1.0;
hasina1Sound.volume = 0.3;
hasina2Sound.volume = 0.3;
hasina3Sound.volume = 0.3;

backgroundMusic.loop = true;

let gameState = {
    running: false,
    playerX: window.innerWidth / 2,
    score: 0,
    bestScore: parseInt(localStorage.getItem("bestScore")) || 0,
    enemySpeed: 3,
    spawnRate: 2000,
    bullets: [],
    enemies: [],
    bombs: [],
    intervals: []
};

// Initialize best score display
bestScoreDisplay.textContent = gameState.bestScore;
bestScoreFinalDisplay.textContent = gameState.bestScore;

// Prevent default touch behavior
document.addEventListener("touchmove", (e) => {
    if (gameState.running) {
        e.preventDefault();
    }
}, { passive: false });

// Move player on touch
window.addEventListener("touchmove", (e) => {
    if (gameState.running) {
        gameState.playerX = e.touches[0].clientX;
        player.style.left = `${gameState.playerX - player.offsetWidth / 2}px`;
    }
});

// Fire bullet on tap
window.addEventListener("touchstart", (e) => {
    if (gameState.running) {
        e.preventDefault();
        fireBullet();
    }
});

// Toggle About Creator section
function toggleAboutCreator() {
    aboutCreator.style.display = aboutCreator.style.display === "block" ? "none" : "block";
}

// Play random Hasina sound
function playRandomHasinaSound() {
    const sounds = [hasina1Sound, hasina2Sound, hasina3Sound];
    const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
    randomSound.currentTime = 0;
    randomSound.play();
}

function fireBullet() {
    const bullet = document.createElement("div");
    bullet.classList.add("bullet");

    const playerRect = player.getBoundingClientRect();
    bullet.style.left = `${playerRect.left + playerRect.width / 2 - 4}px`;
    bullet.style.bottom = `${window.innerHeight - playerRect.top}px`;

    gameContainer.appendChild(bullet);
    gameState.bullets.push(bullet);
    moveBullet(bullet);

    // Play fire sound
    if (fireSound.paused) {
        fireSound.currentTime = 0; // Reset sound to start
        fireSound.play().catch(error => {
            console.error("Fire sound playback failed:", error);
        });
    } else {
        fireSound.currentTime = 0; // Reset sound to start
        fireSound.play();
    }
}

function moveBullet(bullet) {
    const bulletInterval = setInterval(() => {
        if (!gameState.running) {
            clearInterval(bulletInterval);
            return;
        }

        let bulletBottom = parseInt(bullet.style.bottom);
        if (bulletBottom >= window.innerHeight) {
            bullet.remove();
            clearInterval(bulletInterval);
            gameState.bullets = gameState.bullets.filter(b => b !== bullet);
        } else {
            bullet.style.bottom = `${bulletBottom + 10}px`;
            checkCollision(bullet, bulletInterval);
            checkBombCollision(bullet, bulletInterval);
        }
    }, 20);
    gameState.intervals.push(bulletInterval);
}

function spawnEnemy() {
    if (!gameState.running) return;

    const enemyTypes = ["villain", "modi", "qader", "joy"]; // Add new enemy types
    const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];

    const enemy = document.createElement("div");
    enemy.classList.add("enemy");
    enemy.classList.add(randomType); // Add class for enemy type
    enemy.style.left = `${Math.random() * (window.innerWidth - 60)}px`;
    enemy.style.top = "-60px";
    gameContainer.appendChild(enemy);

    gameState.enemies.push(enemy);
    moveEnemy(enemy, randomType);
}

function moveEnemy(enemy, type) {
    const enemyInterval = setInterval(() => {
        if (!gameState.running) {
            clearInterval(enemyInterval);
            return;
        }

        let enemyTop = parseInt(enemy.style.top);
        if (enemyTop > window.innerHeight) {
            enemy.remove();
            clearInterval(enemyInterval);
            gameState.enemies = gameState.enemies.filter(e => e !== enemy);
        } else {
            enemy.style.top = `${enemyTop + gameState.enemySpeed}px`;

            // Special movement for joy.png
            if (type === "joy") {
                let enemyLeft = parseInt(enemy.style.left);
                enemyLeft += Math.sin(enemyTop / 50) * 2; // Move horizontally while falling
                enemy.style.left = `${enemyLeft}px`;
            }

            checkGameOver(enemy, enemyInterval);
        }
    }, 30);
    gameState.intervals.push(enemyInterval);
}

function spawnBomb() {
    if (!gameState.running) return;

    const bomb = document.createElement("div");
    bomb.classList.add("bomb");
    bomb.style.left = `${Math.random() * (window.innerWidth - 60)}px`;
    bomb.style.top = "-60px";
    gameContainer.appendChild(bomb);

    gameState.bombs.push(bomb);
    moveBomb(bomb);
}

function moveBomb(bomb) {
    const bombInterval = setInterval(() => {
        if (!gameState.running) {
            clearInterval(bombInterval);
            return;
        }

        let bombTop = parseInt(bomb.style.top);
        if (bombTop > window.innerHeight) {
            bomb.remove();
            clearInterval(bombInterval);
            gameState.bombs = gameState.bombs.filter(b => b !== bomb);
        } else {
            bomb.style.top = `${bombTop + gameState.enemySpeed}px`;
        }
    }, 30);
    gameState.intervals.push(bombInterval);
}

function checkCollision(bullet, bulletInterval) {
    gameState.enemies.forEach(enemy => {
        let bulletRect = bullet.getBoundingClientRect();
        let enemyRect = enemy.getBoundingClientRect();

        if (
            bulletRect.top <= enemyRect.bottom &&
            bulletRect.bottom >= enemyRect.top &&
            bulletRect.left <= enemyRect.right &&
            bulletRect.right >= enemyRect.left
        ) {
            bullet.remove();
            enemy.remove();
            clearInterval(bulletInterval);
            gameState.bullets = gameState.bullets.filter(b => b !== bullet);
            gameState.enemies = gameState.enemies.filter(e => e !== enemy);

            // Assign points based on enemy type
            if (enemy.classList.contains("joy")) {
                gameState.score += 20; // 20 points for joy.png
            } else {
                gameState.score += 10; // 10 points for others
            }

            updateScore();

            // Play hit sound
            hitSound.currentTime = 0;
            hitSound.play();

            // Play random Hasina sound
            if (Math.random() < 0.3) {
                playRandomHasinaSound();
            }
        }
    });
}

function checkBombCollision(bullet, bulletInterval) {
    gameState.bombs.forEach(bomb => {
        let bulletRect = bullet.getBoundingClientRect();
        let bombRect = bomb.getBoundingClientRect();

        if (
            bulletRect.top <= bombRect.bottom &&
            bulletRect.bottom >= bombRect.top &&
            bulletRect.left <= bombRect.right &&
            bulletRect.right >= bombRect.left
        ) {
            // Bullet hits the bomb
            bullet.remove();
            bomb.remove();
            clearInterval(bulletInterval);
            gameState.bullets = gameState.bullets.filter(b => b !== bullet);
            gameState.bombs = gameState.bombs.filter(b => b !== bomb);
            gameOver(); // End the game
        }
    });
}

function checkGameOver(enemy, enemyInterval) {
    let enemyRect = enemy.getBoundingClientRect();
    let playerRect = player.getBoundingClientRect();

    if (
        enemyRect.bottom >= playerRect.top &&
        enemyRect.left < playerRect.right &&
        enemyRect.right > playerRect.left
    ) {
        gameOver();
        clearInterval(enemyInterval);
    }
}

function updateScore() {
    scoreDisplay.textContent = gameState.score;
    liveScoreDisplay.textContent = gameState.score;
}

function gameOver() {
    gameState.running = false;
    gameOverScreen.style.display = "flex";
    finalScoreDisplay.textContent = gameState.score;

    if (gameState.score > gameState.bestScore) {
        gameState.bestScore = gameState.score;
        localStorage.setItem("bestScore", gameState.bestScore);
    }

    bestScoreDisplay.textContent = gameState.bestScore;
    bestScoreFinalDisplay.textContent = gameState.bestScore;

    gameState.intervals.forEach(interval => clearInterval(interval));
    gameState.intervals = [];

    gameoverSound.currentTime = 0;
    gameoverSound.play();

    backgroundMusic.pause();
}

function restartGame() {
    gameState = {
        running: true,
        playerX: window.innerWidth / 2,
        score: 0,
        bestScore: gameState.bestScore,
        enemySpeed: 3,
        spawnRate: 2000,
        bullets: [],
        enemies: [],
        bombs: [],
        intervals: []
    };

    updateScore();
    gameOverScreen.style.display = "none";
    document.querySelectorAll(".enemy, .bullet, .bomb").forEach(e => e.remove());
    startGameLogic();

    backgroundMusic.currentTime = 0;
    backgroundMusic.play();
}

function startGame() {
    startScreen.style.display = "none";
    player.style.display = "block";
    playerLine.style.display = "block";
    scoreDisplay.style.display = "block";
    liveScoreDisplay.parentElement.style.display = "block";
    gameState.running = true;
    gameState.score = 0;
    updateScore();

    backgroundMusic.currentTime = 0;
    backgroundMusic.play();

    startGameLogic();
}

function startGameLogic() {
    const spawnInterval = setInterval(() => {
        if (!gameState.running) {
            clearInterval(spawnInterval);
            return;
        }
        spawnEnemy();
        if (Math.random() < 0.2) { // 20% chance to spawn a bomb
            spawnBomb();
        }
    }, gameState.spawnRate);
    gameState.intervals.push(spawnInterval);

    const speedInterval = setInterval(() => {
        if (!gameState.running) {
            clearInterval(speedInterval);
            return;
        }
        if (gameState.enemySpeed < 10) gameState.enemySpeed += 0.2;
    }, 5000);
    gameState.intervals.push(speedInterval);

    const spawnRateInterval = setInterval(() => {
        if (!gameState.running) {
            clearInterval(spawnRateInterval);
            return;
        }
        if (gameState.spawnRate > 500) gameState.spawnRate -= 100;
    }, 5000);
    gameState.intervals.push(spawnRateInterval);
}