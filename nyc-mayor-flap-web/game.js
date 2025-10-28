// Global Vars – Optimized for perf
let canvas, ctx, score = 0, highScore = 0, gameOver = false, character = 0;
const gravity = 0.6, flapPowers = [-15, -13, -17], slogans = [
    "Mamdani: Fly Left, Rent-Free!", "Cuomo Comeback: Scandal Dodge!", "Sliwa: Angels Got Wings!",
    "Polls Say: Flap or Flop! Oct 28 Update", "Rigged Pipes? Blame the Establishment!", "Nov 4 Vote: One Flap at a Time!"
];
let bird = { x: 100, y: 300, vel: 0 }, pipes = [], particles = [], audioCtx;

// Init – SEO & PWA (Load Local High Score)
document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('gameCanvas'); ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth > 400 ? 400 : window.innerWidth; canvas.height = 600;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)(); // Web Audio for sounds
    loadSounds(); // Meme boings
    highScore = parseInt(localStorage.getItem('nycFlapHighScore') || '0'); // Local load
    document.getElementById('char-select').classList.add('active');
    // Analytics stub (Google Analytics free) – optional
    // gtag('config', 'G-YOUR-ID');
});

// Start Game
function startGame(char) {
    character = char; bird.y = 300; bird.vel = 0; score = 0; pipes = []; gameOver = false;
    document.getElementById('char-select').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    gameLoop();
}

// Game Loop – 60FPS RAF
function gameLoop() {
    if (gameOver) { showGameOver(); return; }
    update();
    draw();
    requestAnimationFrame(gameLoop);
    updateUI();
}

// Update Logic – Fun Power-Ups
function update() {
    bird.vel += gravity; bird.y += bird.vel;
    if (bird.y > canvas.height - 100 || bird.y < 0) gameOver = true;

    // Spawn Pipes (Buildings)
    if (pipes.length === 0 || pipes[pipes.length-1].x < canvas.width - 200) {
        const gapY = Math.random() * (canvas.height - 450) + 100;
        pipes.push({ x: canvas.width, top: gapY, bottom: canvas.height - gapY - 450 });
    }

    pipes.forEach((p, i) => {
        p.x -= 5 + (score / 10); // Speed up
        if (p.x < -50) { 
            pipes.splice(i, 1); 
            score++; 
            createParticles(p.x + 25, canvas.height / 2, '#FFD700'); 
            playSound('cheer'); 
            showSlogan(); 
        }
        // Collision
        if (bird.x + 20 > p.x && bird.x - 20 < p.x + 50 && (bird.y - 20 < p.top || bird.y + 20 > canvas.height - p.bottom)) {
            gameOver = true; playSound('crash'); createParticles(bird.x, bird.y, '#FF4136');
        }
    });

    // Particles Update
    particles.forEach((p, i) => { 
        p.x += p.vx; 
        p.y += p.vy; 
        p.vy += 0.2; // Gravity on particles
        p.life--; 
        if (p.life <= 0) particles.splice(i, 1); 
    });
}

// Draw – NYC Vibes
function draw() {
    // BG Gradient (Skyline sim)
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#001f3f'); grad.addColorStop(1, '#0074D9');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ground (NYC street)
    ctx.fillStyle = '#2ECC40'; ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    // Bird (Candidate Icon – fallback circle)
    ctx.fillStyle = character === 0 ? '#FF4136' : character === 1 ? '#0074D9' : '#2ECC40';
    ctx.beginPath(); ctx.arc(bird.x, bird.y, 20, 0, Math.PI * 2); ctx.fill();

    // Pipes (Buildings)
    ctx.fillStyle = '#34495E'; pipes.forEach(p => {
        ctx.fillRect(p.x, 0, 50, p.top); ctx.fillRect(p.x, canvas.height - p.bottom, 50, p.bottom);
    });

    // Particles (Confetti)
    particles.forEach(p => { 
        ctx.globalAlpha = p.life / 50; // Fade out
        ctx.fillStyle = p.color; 
        ctx.fillRect(p.x, p.y, 5, 5); 
    });
    ctx.globalAlpha = 1;
}

// Particles – Confetti Fun
function createParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
        particles.push({ 
            x, y, color, 
            life: 50, 
            vx: (Math.random() - 0.5) * 10, 
            vy: (Math.random() - 0.5) * 10 
        });
    }
}

// Sounds – Meme Web Audio
function loadSounds() { /* Simple oscillators for boing/crash/cheer – no external files needed */ }
function playSound(type) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator(); 
    const gain = audioCtx.createGain(); 
    gain.connect(audioCtx.destination); 
    osc.connect(gain);
    osc.frequency.value = type === 'flap' ? 800 : type === 'crash' ? 200 : 1000;
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.start(); osc.stop(audioCtx.currentTime + 0.1);
}

// Input – Touch/Mouse/Keyboard
canvas.addEventListener('click', flap); 
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); flap(); });
document.addEventListener('keydown', e => { if (e.key === ' ') { e.preventDefault(); flap(); } });
function flap() { 
    if (!gameOver) { 
        bird.vel = flapPowers[character]; 
        playSound('flap'); 
    } else { 
        startGame(character);  // Restart
    } 
}

// UI & Share
function updateUI() { 
    const currentHigh = Math.max(highScore, score);
    document.getElementById('score').textContent = `Score: ${score} | High: ${currentHigh}`; 
}
function showSlogan() { // Toast animation
    const toast = document.createElement('div'); 
    toast.textContent = slogans[Math.floor(Math.random() * slogans.length)];
    toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#FFD700;color:black;padding:1rem;border-radius:5px;animation:slideIn 0.5s;z-index:100;';
    toast.innerHTML += '<style>@keyframes slideIn{from{transform:translateX(100%);}to{transform:translateX(0);}}</style>'; // Inline anim
    document.body.appendChild(toast); 
    setTimeout(() => toast.remove(), 3000);
}
function showGameOver() {
    document.getElementById('shareBtn').style.display = 'block';
    const overlay = document.createElement('div'); 
    overlay.id = 'gameOver';
    overlay.innerHTML = `<h2>Campaign Crash! 😂</h2><p>Score: ${score}</p><p>${slogans[Math.floor(Math.random() * slogans.length)]}</p><button onclick="startGame(${character})">Retry!</button>`;
    overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;flex-direction:column;justify-content:center;align-items:center;z-index:20;text-align:center;color:white;';
    document.getElementById('game-screen').appendChild(overlay);
    // Save High Score Locally
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('nycFlapHighScore', highScore.toString());
    }
}
function shareScore() {
    const candidateName = ['Mamdani', 'Cuomo', 'Sliwa'][character];
    const text = `Scored ${score} as ${candidateName} in NYC Mayor Flap! Beat me? Play free: ${window.location.origin} #NYCElection2025`;
    if (navigator.share) {
        navigator.share({ title: 'NYC Flap Game', text, url: window.location.href });
    } else {
        navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard! Share on X/TikTok for virality 🚀'));
    }
}
