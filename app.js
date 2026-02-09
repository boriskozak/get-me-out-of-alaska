/* =============================================
   GET ME OUT OF ALASKA — Main Application
   Flight Finder + Moose Escape Game
   ============================================= */

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    createSnowfall();
    setDefaultDate();
});

function createSnowfall() {
    const container = document.getElementById('snowfall');
    const flakes = ['❄', '❅', '❆', '•'];
    for (let i = 0; i < 40; i++) {
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        flake.textContent = flakes[Math.floor(Math.random() * flakes.length)];
        flake.style.left = Math.random() * 100 + '%';
        flake.style.fontSize = (Math.random() * 12 + 8) + 'px';
        flake.style.animationDuration = (Math.random() * 8 + 6) + 's';
        flake.style.animationDelay = (Math.random() * 10) + 's';
        container.appendChild(flake);
    }
}

function setDefaultDate() {
    const dateInput = document.getElementById('date');
    const today = new Date();
    dateInput.value = today.toISOString().split('T')[0];
}

// ========== NAVIGATION ==========
function switchTab(tab) {
    const hero = document.getElementById('hero');
    const nav = document.getElementById('tab-nav');
    const flightsSection = document.getElementById('flights-section');
    const gameSection = document.getElementById('game-section');

    hero.classList.add('hidden');
    nav.classList.remove('hidden');

    flightsSection.classList.toggle('hidden', tab !== 'flights');
    gameSection.classList.toggle('hidden', tab !== 'game');

    document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    if (tab === 'game') {
        initGame();
    }
}

function goHome() {
    document.getElementById('hero').classList.remove('hidden');
    document.getElementById('tab-nav').classList.add('hidden');
    document.getElementById('flights-section').classList.add('hidden');
    document.getElementById('game-section').classList.add('hidden');
    // Stop game if running
    if (gameState.running) {
        gameState.running = false;
    }
}

// ========== FLIGHT FINDER ==========
const airlines = [
    { name: 'Alaska Airlines', code: 'AS', color: '#00467f', emoji: '🔵' },
    { name: 'Delta Air Lines', code: 'DL', color: '#c01933', emoji: '🔺' },
    { name: 'United Airlines', code: 'UA', color: '#002244', emoji: '🔷' },
    { name: 'American Airlines', code: 'AA', color: '#0078d2', emoji: '🦅' },
    { name: 'Sun Country', code: 'SY', color: '#f7941d', emoji: '☀️' },
    { name: 'JetBlue', code: 'B6', color: '#003da5', emoji: '🟦' },
];

const airports = {
    ANC: 'Anchorage',
    FAI: 'Fairbanks',
    JNU: 'Juneau',
    SIT: 'Sitka',
    KTN: 'Ketchikan',
    SEA: 'Seattle',
    PDX: 'Portland',
    SFO: 'San Francisco',
    LAX: 'Los Angeles',
    DEN: 'Denver',
    MSP: 'Minneapolis',
    ORD: 'Chicago',
    DFW: 'Dallas',
};

const layoverCities = ['SEA', 'PDX', 'SFO', 'MSP', 'DEN', 'ORD'];

function generateFlights(from, to, date, passengers) {
    const numFlights = Math.floor(Math.random() * 4) + 4; // 4-7 flights
    const flights = [];

    for (let i = 0; i < numFlights; i++) {
        const airline = airlines[Math.floor(Math.random() * airlines.length)];
        const flightNum = airline.code + (Math.floor(Math.random() * 900) + 100);

        // Random departure between 5am and 10pm
        const depHour = Math.floor(Math.random() * 17) + 5;
        const depMin = [0, 15, 30, 45][Math.floor(Math.random() * 4)];

        // Flight duration 3-9 hours
        const isNonstop = Math.random() > 0.55;
        const baseDuration = isNonstop ? (3 + Math.random() * 3) : (5 + Math.random() * 4);
        const durationHours = Math.floor(baseDuration);
        const durationMins = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
        const totalMinutes = durationHours * 60 + durationMins;

        const arrHour = (depHour + durationHours + Math.floor((depMin + durationMins) / 60)) % 24;
        const arrMin = (depMin + durationMins) % 60;

        // Layover
        let stops = 'Nonstop';
        let layover = null;
        if (!isNonstop) {
            const possibleLayovers = layoverCities.filter(c => c !== from && c !== to);
            layover = possibleLayovers[Math.floor(Math.random() * possibleLayovers.length)];
            stops = `1 stop (${airports[layover] || layover})`;
        }

        // Price
        const basePrice = isNonstop ? (280 + Math.random() * 350) : (180 + Math.random() * 280);
        const price = Math.round(basePrice * passengers);
        const pricePerPerson = Math.round(basePrice);

        flights.push({
            airline,
            flightNum,
            depTime: `${String(depHour).padStart(2, '0')}:${String(depMin).padStart(2, '0')}`,
            arrTime: `${String(arrHour).padStart(2, '0')}:${String(arrMin).padStart(2, '0')}`,
            duration: `${durationHours}h ${durationMins > 0 ? durationMins + 'm' : ''}`,
            stops,
            isNonstop,
            from,
            to,
            price,
            pricePerPerson,
            totalMinutes,
        });
    }

    // Sort by price
    flights.sort((a, b) => a.price - b.price);
    // Mark cheapest as best deal
    if (flights.length > 0) flights[0].bestDeal = true;

    return flights;
}

function searchFlights() {
    const from = document.getElementById('departure').value;
    const to = document.getElementById('destination').value;
    const date = document.getElementById('date').value;
    const passengers = parseInt(document.getElementById('passengers').value);

    const btn = document.getElementById('search-btn');
    btn.textContent = '🔄 Searching...';
    btn.disabled = true;

    // Simulate network delay
    setTimeout(() => {
        const flights = generateFlights(from, to, date, passengers);
        displayFlights(flights, from, to, passengers);
        btn.textContent = '🔍 Search Flights — GET THEM OUT!';
        btn.disabled = false;
    }, 1200);
}

function displayFlights(flights, from, to, passengers) {
    const resultsDiv = document.getElementById('flight-results');
    const listDiv = document.getElementById('flight-list');
    const titleEl = document.getElementById('results-title');
    const countEl = document.getElementById('results-count');

    resultsDiv.classList.remove('hidden');
    titleEl.textContent = `${airports[from]} → ${airports[to]}`;
    countEl.textContent = `${flights.length} flights found`;

    listDiv.innerHTML = flights.map(f => `
        <div class="flight-card ${f.bestDeal ? 'best-deal' : ''}">
            <div class="flight-airline">
                <div class="airline-logo" style="background:${f.airline.color}20; color:${f.airline.color}">
                    ${f.airline.emoji}
                </div>
                <div>
                    <div class="airline-name">${f.airline.name}</div>
                    <div class="airline-flight">${f.flightNum}</div>
                </div>
            </div>
            <div class="flight-times">
                <div class="flight-time">${f.depTime}</div>
                <div class="flight-airport">${from}</div>
            </div>
            <div class="flight-duration">
                <div class="flight-duration-time">${f.duration}</div>
                <div class="flight-duration-line"></div>
                <div class="flight-stops ${f.isNonstop ? 'nonstop' : ''}">${f.stops}</div>
            </div>
            <div class="flight-times">
                <div class="flight-time">${f.arrTime}</div>
                <div class="flight-airport">${to}</div>
            </div>
            <div class="flight-price-section">
                <div class="flight-price">$${f.price}</div>
                <div class="flight-price-per">${passengers > 1 ? `$${f.pricePerPerson}/person` : 'per person'}</div>
                <button class="btn-book" onclick="bookFlight('${f.flightNum}')">BOOK NOW 🚀</button>
            </div>
        </div>
    `).join('');
}

function bookFlight(flightNum) {
    alert(`🎉 BOOKING ${flightNum} FOR CLINT & MIKE!\n\n(This is a mock app — but the escape energy is REAL! 🦌✈️)`);
}

// ========== MOOSE ESCAPE GAME ==========
const canvas = document.getElementById('game-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

const gameState = {
    running: false,
    score: 0,
    highScore: parseInt(localStorage.getItem('mooseEscapeHighScore') || '0'),
    speed: 5,
    frameCount: 0,
    groundY: 320,
    gravity: 0.7,
    jumpForce: -14,
    initialized: false,
};

const player = {
    x: 80,
    y: 320,
    width: 40,
    height: 60,
    vy: 0,
    jumping: false,
    ducking: false,
    duckHeight: 30,
    runFrame: 0,
    grounded: true,
};

let obstacles = [];
let particles = [];
let terrain = { mountains: [], trees: [], ground: 0 };

const gameOverMessages = [
    "The moose got you! Still stuck in Alaska... 🦌",
    "Clint tripped on a snowbank! Mike's still running! 🏔️",
    "A grizzly appeared! Wrong game, same problem! 🐻",
    "The pilot is STILL timing out... try again! ⏰",
    "Alaska: 1, Clint & Mike: 0. Run faster! 💨",
    "That moose was MASSIVE! Not your fault! 🦌💀",
    "Mike tried to pet the moose. Bad idea. 🤦",
    "Clint says: 'I should have taken the ferry!' ⛴️",
];

function initGame() {
    if (!ctx) return;
    if (gameState.initialized) return;
    gameState.initialized = true;

    // Generate terrain once
    generateTerrain();

    // Update high score display
    document.getElementById('high-score').textContent = gameState.highScore;

    // Draw the initial frame
    drawGame();

    // Controls
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Touch/click for mobile
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!gameState.running) {
            startGame();
        } else {
            playerJump();
        }
    });
}

function generateTerrain() {
    terrain.mountains = [];
    for (let i = 0; i < 8; i++) {
        terrain.mountains.push({
            x: i * 160,
            height: 80 + Math.random() * 100,
            width: 120 + Math.random() * 80,
        });
    }
    terrain.trees = [];
    for (let i = 0; i < 15; i++) {
        terrain.trees.push({
            x: i * 80 + Math.random() * 40,
            height: 30 + Math.random() * 50,
            type: Math.random() > 0.5 ? 'pine' : 'spruce',
        });
    }
}

function handleKeyDown(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!gameState.running) {
            startGame();
        } else {
            playerJump();
        }
    }
    if (e.code === 'ArrowDown' && gameState.running) {
        e.preventDefault();
        player.ducking = true;
    }
}

function handleKeyUp(e) {
    if (e.code === 'ArrowDown') {
        player.ducking = false;
    }
}

function playerJump() {
    if (player.grounded) {
        player.vy = gameState.jumpForce;
        player.jumping = true;
        player.grounded = false;
        // Jump particles
        for (let i = 0; i < 6; i++) {
            particles.push({
                x: player.x + player.width / 2,
                y: gameState.groundY + player.height,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 3,
                life: 20 + Math.random() * 15,
                maxLife: 35,
                size: 3 + Math.random() * 3,
                color: '#aabbdd',
            });
        }
    }
}

function startGame() {
    gameState.running = true;
    gameState.score = 0;
    gameState.speed = 5;
    gameState.frameCount = 0;
    player.y = gameState.groundY;
    player.vy = 0;
    player.jumping = false;
    player.ducking = false;
    player.grounded = true;
    obstacles = [];
    particles = [];

    document.getElementById('game-overlay').classList.add('hidden');
    document.getElementById('game-over-overlay').classList.add('hidden');
    document.getElementById('score').textContent = '0';
    document.getElementById('speed').textContent = '0';

    requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
    if (!gameState.running) return;

    updateGame();
    drawGame();

    requestAnimationFrame(gameLoop);
}

function updateGame() {
    gameState.frameCount++;

    // Increase speed over time
    gameState.speed = 5 + Math.floor(gameState.frameCount / 200) * 0.5;
    if (gameState.speed > 18) gameState.speed = 18;

    // Score
    gameState.score = Math.floor(gameState.frameCount / 3);
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('speed').textContent = Math.floor(gameState.speed * 3);

    // Player physics
    if (!player.grounded) {
        player.vy += gameState.gravity;
        player.y += player.vy;
        if (player.y >= gameState.groundY) {
            player.y = gameState.groundY;
            player.vy = 0;
            player.grounded = true;
            player.jumping = false;
        }
    }

    // Run animation
    if (gameState.frameCount % 6 === 0) {
        player.runFrame = (player.runFrame + 1) % 4;
    }

    // Spawn obstacles
    const spawnRate = Math.max(50, 100 - gameState.speed * 3);
    if (gameState.frameCount % Math.floor(spawnRate) === 0 || (obstacles.length === 0 && gameState.frameCount > 30)) {
        spawnObstacle();
    }

    // Move obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= gameState.speed;
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
        }
    }

    // Move terrain
    terrain.mountains.forEach(m => {
        m.x -= gameState.speed * 0.15;
        if (m.x + m.width < 0) m.x = 800 + Math.random() * 100;
    });
    terrain.trees.forEach(t => {
        t.x -= gameState.speed * 0.4;
        if (t.x < -30) t.x = 800 + Math.random() * 100;
    });

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].x += particles[i].vx;
        particles[i].y += particles[i].vy;
        particles[i].vy += 0.1;
        particles[i].life--;
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }

    // Collision detection
    const ph = player.ducking ? player.duckHeight : player.height;
    const py = player.ducking ? gameState.groundY + (player.height - player.duckHeight) : player.y;
    const playerBox = {
        x: player.x + 8,
        y: py,
        width: player.width - 16,
        height: ph,
    };

    for (const obs of obstacles) {
        const obsBox = {
            x: obs.x + 5,
            y: obs.y + 5,
            width: obs.width - 10,
            height: obs.height - 10,
        };
        if (
            playerBox.x < obsBox.x + obsBox.width &&
            playerBox.x + playerBox.width > obsBox.x &&
            playerBox.y < obsBox.y + obsBox.height &&
            playerBox.y + playerBox.height > obsBox.y
        ) {
            endGame();
            return;
        }
    }
}

function spawnObstacle() {
    const types = ['moose', 'moose', 'moose', 'rock', 'stump', 'eagle'];
    const type = types[Math.floor(Math.random() * types.length)];
    let obs;

    switch (type) {
        case 'moose':
            obs = {
                type: 'moose',
                x: 820,
                y: gameState.groundY - 10,
                width: 65,
                height: 70,
            };
            break;
        case 'rock':
            obs = {
                type: 'rock',
                x: 820,
                y: gameState.groundY + 30,
                width: 35,
                height: 30,
            };
            break;
        case 'stump':
            obs = {
                type: 'stump',
                x: 820,
                y: gameState.groundY + 20,
                width: 30,
                height: 40,
            };
            break;
        case 'eagle':
            obs = {
                type: 'eagle',
                x: 820,
                y: gameState.groundY - 40 - Math.random() * 30,
                width: 50,
                height: 30,
            };
            break;
    }

    // Check minimum distance from last obstacle
    if (obstacles.length > 0) {
        const last = obstacles[obstacles.length - 1];
        if (obs.x - last.x < 200) {
            obs.x = last.x + 200 + Math.random() * 100;
        }
    }

    obstacles.push(obs);
}

function drawGame() {
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, '#0b1a2e');
    skyGrad.addColorStop(0.4, '#122240');
    skyGrad.addColorStop(0.7, '#1a2d50');
    skyGrad.addColorStop(1, '#243b5c');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // Stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 30; i++) {
        const sx = (i * 137.5 + gameState.frameCount * 0.02) % W;
        const sy = (i * 57.3) % (H * 0.4);
        ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    // Aurora in game
    if (gameState.frameCount) {
        ctx.save();
        ctx.globalAlpha = 0.15;
        const aGrad = ctx.createLinearGradient(0, 0, W, 80);
        aGrad.addColorStop(0, '#00e87e');
        aGrad.addColorStop(0.5, '#00b4ff');
        aGrad.addColorStop(1, '#a855f7');
        ctx.fillStyle = aGrad;
        ctx.beginPath();
        ctx.moveTo(0, 20);
        for (let x = 0; x < W; x += 10) {
            const wave = Math.sin((x + gameState.frameCount * 0.5) * 0.02) * 15 +
                         Math.sin((x + gameState.frameCount * 0.3) * 0.04) * 10;
            ctx.lineTo(x, 30 + wave);
        }
        ctx.lineTo(W, 0);
        ctx.lineTo(0, 0);
        ctx.fill();
        ctx.restore();
    }

    // Mountains (parallax far)
    terrain.mountains.forEach(m => {
        ctx.fillStyle = '#1a2844';
        ctx.beginPath();
        ctx.moveTo(m.x, gameState.groundY + player.height);
        ctx.lineTo(m.x + m.width / 2, gameState.groundY + player.height - m.height);
        ctx.lineTo(m.x + m.width, gameState.groundY + player.height);
        ctx.fill();

        // Snow cap
        ctx.fillStyle = '#3a4a6a';
        ctx.beginPath();
        ctx.moveTo(m.x + m.width / 2 - 15, gameState.groundY + player.height - m.height + 20);
        ctx.lineTo(m.x + m.width / 2, gameState.groundY + player.height - m.height);
        ctx.lineTo(m.x + m.width / 2 + 15, gameState.groundY + player.height - m.height + 20);
        ctx.fill();
    });

    // Trees (parallax mid)
    terrain.trees.forEach(t => {
        // Trunk
        ctx.fillStyle = '#2a1a0e';
        ctx.fillRect(t.x + 4, gameState.groundY + player.height - t.height + 15, 6, t.height - 15);

        // Foliage
        ctx.fillStyle = '#1a3a2a';
        for (let layer = 0; layer < 3; layer++) {
            const w = 20 - layer * 4;
            const yOff = layer * 12;
            ctx.beginPath();
            ctx.moveTo(t.x + 7 - w / 2, gameState.groundY + player.height - t.height + 15 + yOff + 15);
            ctx.lineTo(t.x + 7, gameState.groundY + player.height - t.height + yOff);
            ctx.lineTo(t.x + 7 + w / 2, gameState.groundY + player.height - t.height + 15 + yOff + 15);
            ctx.fill();
        }
    });

    // Ground
    const groundY = gameState.groundY + player.height;
    ctx.fillStyle = '#f0f4f8';
    ctx.fillRect(0, groundY, W, H - groundY);

    // Snow texture on ground
    ctx.fillStyle = '#dde4ec';
    for (let x = 0; x < W; x += 20) {
        const bumpH = Math.sin(x * 0.1 + gameState.frameCount * 0.05) * 3;
        ctx.fillRect(x, groundY, 12, bumpH + 2);
    }

    // Ground line
    ctx.strokeStyle = '#c0cce0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(W, groundY);
    ctx.stroke();

    // Particles
    particles.forEach(p => {
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Obstacles
    obstacles.forEach(obs => drawObstacle(obs));

    // Player
    drawPlayer();
}

function drawPlayer() {
    const x = player.x;
    const baseY = gameState.groundY;
    const py = player.y;
    const isDucking = player.ducking;

    ctx.save();

    if (isDucking) {
        // Ducking pose - crouched figure
        const duckY = baseY + (player.height - player.duckHeight);

        // Body (crouched)
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(x + 8, duckY + 5, 24, 18);

        // Head
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(x + 20, duckY + 2, 9, 0, Math.PI * 2);
        ctx.fill();

        // Helmet
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(x + 20, duckY - 1, 9, Math.PI, Math.PI * 2);
        ctx.fill();

        // Legs (tucked)
        ctx.fillStyle = '#1e40af';
        ctx.fillRect(x + 10, duckY + 22, 10, 6);
        ctx.fillRect(x + 22, duckY + 22, 10, 6);

    } else {
        // Running pose
        const bobble = Math.sin(gameState.frameCount * 0.3) * 2;

        // Body (jacket)
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(x + 10, py + 18 + bobble, 20, 22);

        // Head
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(x + 20, py + 12 + bobble, 10, 0, Math.PI * 2);
        ctx.fill();

        // Helmet
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(x + 20, py + 9 + bobble, 10, Math.PI, Math.PI * 2);
        ctx.fill();

        // Arms
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';

        const armSwing = Math.sin(gameState.frameCount * 0.3) * 12;

        // Left arm
        ctx.beginPath();
        ctx.moveTo(x + 12, py + 24 + bobble);
        ctx.lineTo(x + 4, py + 32 + armSwing + bobble);
        ctx.stroke();

        // Right arm
        ctx.beginPath();
        ctx.moveTo(x + 28, py + 24 + bobble);
        ctx.lineTo(x + 36, py + 32 - armSwing + bobble);
        ctx.stroke();

        // Legs
        ctx.strokeStyle = '#1e40af';
        ctx.lineWidth = 5;

        const legSwing = Math.sin(gameState.frameCount * 0.3) * 10;

        // Left leg
        ctx.beginPath();
        ctx.moveTo(x + 15, py + 38 + bobble);
        ctx.lineTo(x + 10, py + 55 + legSwing);
        ctx.stroke();

        // Right leg
        ctx.beginPath();
        ctx.moveTo(x + 25, py + 38 + bobble);
        ctx.lineTo(x + 30, py + 55 - legSwing);
        ctx.stroke();

        // Boots
        ctx.fillStyle = '#451a03';
        ctx.fillRect(x + 6, py + 53 + legSwing, 10, 6);
        ctx.fillRect(x + 26, py + 53 - legSwing, 10, 6);

        // Breath puff in cold air
        if (gameState.frameCount % 30 < 15) {
            ctx.fillStyle = 'rgba(200, 220, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(x + 34, py + 10 + bobble, 4 + Math.sin(gameState.frameCount * 0.1) * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.restore();
}

function drawObstacle(obs) {
    ctx.save();

    if (obs.type === 'moose') {
        drawMoose(obs.x, obs.y, obs.width, obs.height);
    } else if (obs.type === 'rock') {
        // Snow-covered rock
        ctx.fillStyle = '#5a6a7a';
        ctx.beginPath();
        ctx.ellipse(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width / 2, obs.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e8ecf0';
        ctx.beginPath();
        ctx.ellipse(obs.x + obs.width / 2, obs.y + obs.height / 3, obs.width / 2.5, obs.height / 4, 0, 0, Math.PI);
        ctx.fill();
    } else if (obs.type === 'stump') {
        // Tree stump
        ctx.fillStyle = '#5a3a1e';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.fillStyle = '#7a5a3e';
        ctx.beginPath();
        ctx.ellipse(obs.x + obs.width / 2, obs.y, obs.width / 2, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Rings
        ctx.strokeStyle = '#4a2a0e';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(obs.x + obs.width / 2, obs.y, 6, 3, 0, 0, Math.PI * 2);
        ctx.stroke();
    } else if (obs.type === 'eagle') {
        drawEagle(obs.x, obs.y, obs.width);
    }

    ctx.restore();
}

function drawMoose(x, y, w, h) {
    // Body
    ctx.fillStyle = '#4a3520';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2 + 5, w / 2.2, h / 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.strokeStyle = '#3a2510';
    ctx.lineWidth = 5;
    const legY = y + h / 2 + 15;

    // Back legs
    ctx.beginPath();
    ctx.moveTo(x + 10, legY);
    ctx.lineTo(x + 8, y + h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 18, legY);
    ctx.lineTo(x + 20, y + h);
    ctx.stroke();

    // Front legs
    ctx.beginPath();
    ctx.moveTo(x + w - 18, legY);
    ctx.lineTo(x + w - 20, y + h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w - 10, legY);
    ctx.lineTo(x + w - 8, y + h);
    ctx.stroke();

    // Hooves
    ctx.fillStyle = '#1a0a00';
    ctx.fillRect(x + 4, y + h - 4, 8, 4);
    ctx.fillRect(x + 16, y + h - 4, 8, 4);
    ctx.fillRect(x + w - 24, y + h - 4, 8, 4);
    ctx.fillRect(x + w - 12, y + h - 4, 8, 4);

    // Neck
    ctx.fillStyle = '#4a3520';
    ctx.beginPath();
    ctx.moveTo(x + w - 15, y + h / 2 - 5);
    ctx.lineTo(x + w - 5, y + 5);
    ctx.lineTo(x + w + 5, y + 5);
    ctx.lineTo(x + w - 5, y + h / 2 + 5);
    ctx.fill();

    // Head
    ctx.fillStyle = '#5a4530';
    ctx.beginPath();
    ctx.ellipse(x + w + 5, y + 5, 12, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Antlers
    ctx.strokeStyle = '#8a7a60';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    // Left antler
    ctx.beginPath();
    ctx.moveTo(x + w, y);
    ctx.lineTo(x + w - 8, y - 18);
    ctx.lineTo(x + w - 15, y - 14);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w - 8, y - 18);
    ctx.lineTo(x + w - 4, y - 25);
    ctx.stroke();

    // Right antler
    ctx.beginPath();
    ctx.moveTo(x + w + 5, y - 2);
    ctx.lineTo(x + w + 13, y - 18);
    ctx.lineTo(x + w + 20, y - 14);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w + 13, y - 18);
    ctx.lineTo(x + w + 10, y - 25);
    ctx.stroke();

    // Eye
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(x + w + 10, y + 3, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Nostril
    ctx.fillStyle = '#2a1a0a';
    ctx.beginPath();
    ctx.arc(x + w + 15, y + 7, 1.5, 0, Math.PI * 2);
    ctx.fill();
}

function drawEagle(x, y, w) {
    const wingFlap = Math.sin(gameState.frameCount * 0.15) * 10;

    // Body
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + 15, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    ctx.fillStyle = '#2a1a0a';
    ctx.beginPath();
    ctx.moveTo(x + w / 2 - 5, y + 12);
    ctx.lineTo(x, y + wingFlap);
    ctx.lineTo(x + 10, y + 15);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + w / 2 + 5, y + 12);
    ctx.lineTo(x + w, y + wingFlap);
    ctx.lineTo(x + w - 10, y + 15);
    ctx.fill();

    // Head
    ctx.fillStyle = '#f5f5f0';
    ctx.beginPath();
    ctx.arc(x + w / 2 + 10, y + 12, 6, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#ffa500';
    ctx.beginPath();
    ctx.moveTo(x + w / 2 + 16, y + 11);
    ctx.lineTo(x + w / 2 + 22, y + 13);
    ctx.lineTo(x + w / 2 + 16, y + 15);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x + w / 2 + 12, y + 11, 1.5, 0, Math.PI * 2);
    ctx.fill();
}

function endGame() {
    gameState.running = false;

    // Update high score
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('mooseEscapeHighScore', gameState.highScore.toString());
        document.getElementById('high-score').textContent = gameState.highScore;
    }

    // Show game over
    const msg = gameOverMessages[Math.floor(Math.random() * gameOverMessages.length)];
    document.getElementById('gameover-message').textContent = msg;
    document.getElementById('final-score').textContent = gameState.score;

    if (gameState.score > 500) {
        document.getElementById('gameover-title').textContent = '🏆 IMPRESSIVE RUN!';
    } else if (gameState.score > 200) {
        document.getElementById('gameover-title').textContent = 'NICE TRY! 💪';
    } else {
        document.getElementById('gameover-title').textContent = 'TRAMPLED BY MOOSE! 💀';
    }

    document.getElementById('game-over-overlay').classList.remove('hidden');
}
