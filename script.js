// ===================== DATA =====================
const pokemonStats = [
    {   // Emberbelly
        type: "Fire", hp: 70,
        attacks: [
            { name: "Ember Burst", damage: 30, desc: "A warm belly glow that singes foes." },
            { name: "Lava Cuddle", damage: 50, desc: "A cozy magma hug. Always crits on birthdays." }
        ],
        weakness: "Water", resistance: "Grass"
    },
    {   // Mystitoot
        type: "Psychic", hp: 60,
        attacks: [
            { name: "Arcane Hoot", damage: 20, desc: "A mystical screech that confuses the target." },
            { name: "Spellbook Slam", damage: 60, desc: "Drops ancient knowledge. Super effective on Mondays." }
        ],
        weakness: "Dark", resistance: "Fighting"
    },
    {   // Lochling
        type: "Water", hp: 90,
        attacks: [
            { name: "Tidal Splash", damage: 30, desc: "Summons a playful wave from the loch." },
            { name: "Deep Dive", damage: 70, desc: "Vanishes into the depths, then strikes." }
        ],
        weakness: "Electric", resistance: "Fire"
    },
    {   // Lumistone
        type: "Ghost", hp: 60,
        attacks: [
            { name: "Eerie Glow", damage: 20, desc: "A haunting light that lowers the foe's guard." },
            { name: "Cave Collapse", damage: 80, desc: "Brings the ceiling down. Lumistone floats through it." }
        ],
        weakness: "Ghost", resistance: "Normal"
    },
    {   // Sproutling
        type: "Grass", hp: 50,
        attacks: [
            { name: "Vine Tickle", damage: 10, desc: "Tickles the foe with tiny vines. May cause giggling." },
            { name: "Bloom Burst", damage: 60, desc: "Unleashes a petal explosion. Smells amazing." }
        ],
        weakness: "Fire", resistance: "Water"
    }
];

const masterBallStats = {
    type: "Dragon", hp: 150,
    attacks: [
        { name: "Prismatic Roar", damage: 80, desc: "MEGGAAAA MMMAAGGEEE!!!." },
        { name: "Legendary Barrage", damage: 120, desc: "Channels pure birthday energy. Unstoppable." }
    ],
    weakness: "Ice", resistance: "Fire"
};

const pokemonCardImages = [
    "images/GPST Cards/Emberbelly Card.png",
    "images/GPST Cards/Mystitoot Card.png",
    "images/GPST Cards/Lochling Card.png",
    "images/GPST Cards/Lumistone Card.png",
    "images/GPST Cards/Sproutling Card.png"
];

const masterBallCard = "images/Megaimage Card.png";

// Scroll messages — keyed by ball index (only some balls have scrolls)
const scrollMessages = {
    0: "Bhanu! Thank you for bringing so much warmth to our team. Your passion for people is always evident and truly inspires me time and again. Like the Snaps & Giggles channel - I'd have never thought of that and yet it's become such a staple in helping us get to know one another as people outside of work. Thanks for bringing your heart to all you do. Have a beautiful birthday, may it be memorable in all the best ways. - Phoenix",
    1: "Marshall Runs the Show\n(Bhanu's Birthday Pop)\n\nVerse\nBhanu walks in like it's opening night.\nBig laughs, big vibes-yeah you do it right.\nMarvel on your mind, pop culture on tap.\nAlways down for food and a good group chat.\n\nPre-Chorus\nYou keep it social, you keep it bold,\nMaking work feel fun, never getting old-\nBut we all know who steals the glow:\nThat corgi Marshall runs the show.\n\nChorus\nIt's your birthday-assemble the crew,\nCake on the table and the playlist too.\nYou're the main character, that's the truth,\nBut Marshall runs the show.. and you let him, dude.\nMake a wish, take a bite, let's go-\nHappy Birthday, Bhanu!\n\n- Marna",
    2: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Maecenas faucibus mollis interdum. Nullam quis risus eget urna mollis ornare vel eu leo. Cras mattis consectetur purus sit amet fermentum. - Daniel",
    5: "Bhanu! My fearless tuk tuk riding friend.\nThank you for always finding a way to make our work better, our days brighter, and our wins feel more meaningful! Today we celebrate you!!\nI hope your birthday is as legendary as a shiny Pokémon encounter and as epic as a post-credits Marvel scene. You deserve nothing less.\nHere's to you, Bhanu — thank you for being such a wonderful teammate and a true friend. Happy Birthday! 🎂✨ - Lacy"
};

// ===================== STATE =====================
let openedCount = 0;
const totalRegularBalls = 5;
const openedStatus = [false, false, false, false, false];
let masterBallShown = false;
let masterBallOpened = false;
let isAnimating = false;
let viewingFromPokedex = false;
let currentCardIndex = -1;
let statsRevealing = false;
let statsRevealTimers = [];
let masterBallAttempts = 0;
let pendingScrollIndex = -1;
let currentScrollIndex = -1;
const scrollShownStatus = {};
let scrollAnimating = false;
let bgmPlaying = false;
let bgmTimer = null;

// ===================== AUDIO =====================
let audioCtx = null;
let bgmGainNode = null;

function getAudioCtx() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

function getBGMGain() {
    if (!bgmGainNode) {
        bgmGainNode = getAudioCtx().createGain();
        bgmGainNode.connect(getAudioCtx().destination);
    }
    return bgmGainNode;
}

// Game Boy note helper
function gbNote(freq, startTime, duration, volume, type, dest) {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest || ctx.destination);
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.setValueAtTime(volume, startTime + duration * 0.7);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
}

function gbSweep(startFreq, endFreq, startTime, duration, volume) {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(startFreq, startTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
}

function gbNoise(startTime, duration, volume) {
    const ctx = getAudioCtx();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    const gain = ctx.createGain();
    noise.buffer = buffer;
    noise.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    noise.start(startTime);
    noise.stop(startTime + duration + 0.01);
}

// ===================== SOUND EFFECTS =====================

function playWobbleSound() {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    gbNote(600, now, 0.07, 0.06, 'square');
    gbNote(400, now + 0.035, 0.07, 0.04, 'square');
}

function playOpenSound() {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const vol = 0.1;
    gbNoise(now, 0.04, vol * 1.5);
    gbSweep(250, 1400, now + 0.03, 0.12, vol);
    gbNote(1400, now + 0.14, 0.06, vol * 0.6, 'square');
}

function playCardSound() {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const vol = 0.08;
    const t = 0.1;
    gbNote(659, now, t, vol, 'square');
    gbNote(659, now + t, t, vol, 'square');
    gbNote(659, now + t * 2, t, vol, 'square');
    gbNote(880, now + t * 3, t * 3, vol, 'square');
    gbNote(440, now + t * 3, t * 3, vol * 0.6, 'triangle');
}

function playBlip() {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const pitch = 1200 + Math.random() * 400;
    gbNote(pitch, now, 0.02, 0.03, 'square');
}

function playCatchFail() {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const vol = 0.08;
    // Descending "broke free" sound
    gbSweep(800, 200, now, 0.25, vol);
    gbNote(150, now + 0.2, 0.15, vol * 0.5, 'triangle');
    gbNoise(now + 0.1, 0.08, vol * 0.6);
}

function playMasterBallAppear() {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const vol = 0.08;
    gbNote(131, now, 0.8, vol, 'triangle');
    gbSweep(200, 900, now + 0.3, 0.5, vol * 0.7);
    gbNote(1047, now + 0.8, 0.5, vol * 0.5, 'square');
}

function playScrollAppearSound() {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    gbNoise(now, 0.05, 0.06);
    gbNote(350, now, 0.08, 0.05, 'triangle');
    gbSweep(350, 600, now + 0.05, 0.1, 0.04);
}

function playScrollUnrollSound() {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const vol = 0.07;
    gbNoise(now, 0.3, vol * 0.8);
    gbSweep(200, 800, now + 0.05, 0.35, vol * 0.5);
    gbNote(1047, now + 0.35, 0.15, vol * 0.4, 'triangle');
    gbNote(1319, now + 0.4, 0.2, vol * 0.3, 'triangle');
}

function playFanfare() {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const vol = 0.09;
    const t = 0.12;
    gbNote(523, now, t, vol, 'square');
    gbNote(659, now + t, t, vol, 'square');
    gbNote(784, now + t * 2, t, vol, 'square');
    gbNote(1047, now + t * 3, t, vol, 'square');
    gbNote(1319, now + t * 4.5, t * 4, vol, 'square');
    gbNote(1047, now + t * 4.5, t * 4, vol * 0.7, 'square');
    gbNote(784, now + t * 4.5, t * 4, vol * 0.5, 'triangle');
    gbSweep(2000, 4000, now + t * 8.5, 0.08, vol * 0.4);
    gbNoise(now + t * 8.5, 0.06, vol * 0.3);
}

// ===================== BACKGROUND MUSIC =====================

function playBGMLoop() {
    if (!bgmPlaying) return;
    const ctx = getAudioCtx();
    const dest = getBGMGain();
    const now = ctx.currentTime;
    const B = 0.3; // eighth note ~100 BPM
    const vol = 0.03;

    // Melody — gentle arpeggio pattern
    const melody = [
        [523, 0], [659, 1], [784, 2], [1047, 3],
        [784, 4], [659, 5], [523, 6],
        [698, 8], [880, 9], [1047, 10], [880, 11],
        [784, 12], [988, 13], [784, 14], [523, 15],
    ];
    melody.forEach(([freq, beat]) => {
        gbNote(freq, now + beat * B, B * 0.85, vol, 'square', dest);
    });

    // Bass — root notes
    const bass = [
        [131, 0, 4], [131, 4, 4],
        [175, 8, 4], [196, 12, 2], [131, 14, 2],
    ];
    bass.forEach(([freq, beat, dur]) => {
        gbNote(freq, now + beat * B, dur * B * 0.9, vol * 0.8, 'triangle', dest);
    });

    // Play once (intro style) — stop after melody finishes
    bgmTimer = setTimeout(() => { bgmPlaying = false; bgmTimer = null; }, 16 * B * 1000);
}

function startBGM() {
    bgmPlaying = true;
    getBGMGain().gain.setValueAtTime(1, getAudioCtx().currentTime);
    playBGMLoop();
}

function stopBGM() {
    bgmPlaying = false;
    if (bgmTimer) { clearTimeout(bgmTimer); bgmTimer = null; }
}


// ===================== PARTICLES =====================

function createParticles() {
    const container = document.getElementById('particles-container');
    for (let i = 0; i < 18; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = 3 + Math.random() * 5;
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        p.style.left = Math.random() * 100 + '%';
        p.style.setProperty('--dur', (8 + Math.random() * 12) + 's');
        p.style.setProperty('--delay', (Math.random() * 10) + 's');
        p.style.setProperty('--opacity', (0.2 + Math.random() * 0.4).toFixed(2));
        p.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
        container.appendChild(p);
    }
}

// ===================== SCREEN TRANSITIONS =====================

function screenTransition(callback) {
    const overlay = document.getElementById('screen-transition');
    overlay.style.opacity = '1';
    setTimeout(() => {
        callback();
        setTimeout(() => { overlay.style.opacity = '0'; }, 50);
    }, 500);
}

// ===================== INTRO / START =====================

function startGame() {
    screenTransition(() => {
        document.getElementById('intro-screen').style.display = 'none';
        document.getElementById('main-view').style.display = 'flex';

        // Trigger pokeball entrance
        setTimeout(() => {
            document.getElementById('pokeball-container').classList.add('entered');
        }, 100);

        // Start BGM (plays once as intro)
        startBGM();
    });
}

// ===================== STATS RENDERING =====================

function getStatsForIndex(index) {
    if (index === 5) return masterBallStats;
    return pokemonStats[index];
}

function buildStatsHTML(stats) {
    const typeLower = stats.type.toLowerCase();
    let html = '';
    html += '<div class="stats-block">';
    html += '<div class="stats-header">';
    html += `<span class="type-badge type-${typeLower}">${stats.type}</span>`;
    html += `<span class="stats-hp">HP ${stats.hp}</span>`;
    html += '</div>';
    html += '<div class="stats-divider"></div>';

    stats.attacks.forEach(atk => {
        html += '<div class="stats-attack">';
        html += '<div class="attack-row">';
        html += `<span class="attack-name">${atk.name}</span>`;
        html += `<span class="attack-dmg">${atk.damage}</span>`;
        html += '</div>';
        html += `<div class="attack-desc">${atk.desc}</div>`;
        html += '</div>';
    });

    html += '<div class="stats-divider"></div>';
    const weakLower = stats.weakness.toLowerCase();
    const resistLower = stats.resistance.toLowerCase();
    html += '<div class="stats-footer">';
    html += `<span>Weak: <span class="footer-badge type-${weakLower}">${stats.weakness}</span></span>`;
    html += `<span>Resist: <span class="footer-badge type-${resistLower}">${stats.resistance}</span></span>`;
    html += '</div>';
    html += '</div>';
    return html;
}

function renderStats(index, element, animate) {
    const stats = getStatsForIndex(index);
    element.innerHTML = buildStatsHTML(stats);
    document.getElementById('modal-close-btn').style.visibility = 'hidden';

    const block = element.querySelector('.stats-block');
    if (animate) {
        statsRevealing = true;
        // Trigger reveal after a brief paint delay
        requestAnimationFrame(() => {
            block.classList.add('stats-revealed');
        });
        // Play blips at each stagger point
        const childCount = block.children.length;
        for (let i = 0; i < childCount; i++) {
            const timer = setTimeout(() => playBlip(), i * 150);
            statsRevealTimers.push(timer);
        }
        // Show close button after all stats revealed
        const doneTimer = setTimeout(() => {
            statsRevealing = false;
            document.getElementById('modal-close-btn').style.visibility = 'visible';
        }, childCount * 150 + 300);
        statsRevealTimers.push(doneTimer);
    } else {
        block.classList.add('stats-instant');
        document.getElementById('modal-close-btn').style.visibility = 'visible';
    }
}

function skipStatsReveal() {
    if (!statsRevealing) return;
    statsRevealTimers.forEach(t => clearTimeout(t));
    statsRevealTimers = [];
    statsRevealing = false;
    const block = document.querySelector('#message-text .stats-block');
    if (block) {
        block.classList.remove('stats-revealed');
        block.classList.add('stats-instant');
    }
    document.getElementById('modal-close-btn').style.visibility = 'visible';
}

// ===================== OPEN BALL =====================

function showCard(cardSrc, index, skipFlip) {
    currentCardIndex = index;
    document.getElementById('card-image').src = cardSrc;

    const flipper = document.getElementById('card-flipper');
    flipper.classList.remove('flipped');

    // Show overlay with fade
    const overlay = document.getElementById('modal-overlay');
    overlay.style.display = 'block';
    requestAnimationFrame(() => overlay.classList.add('visible'));

    // Show modal with reveal animation
    const modal = document.getElementById('message-modal');
    modal.style.display = 'block';
    modal.classList.remove('revealing');
    void modal.offsetWidth;
    modal.classList.add('revealing');

    playCardSound();

    const msgEl = document.getElementById('message-text');

    if (skipFlip) {
        // From Pokedex — show front immediately
        flipper.classList.add('flipped');
        setTimeout(() => {
            renderStats(index, msgEl, true);
        }, 500);
    } else {
        // Card back shows first, then flip after a beat
        setTimeout(() => {
            flipper.classList.add('flipped');
            // Stats appear after flip completes (~800ms transition)
            setTimeout(() => {
                renderStats(index, msgEl, true);
            }, 900);
        }, 800);
    }
}

function openBall(index) {
    if (isAnimating) return;
    isAnimating = true;

    const ball = document.getElementById(`ball-${index}`);

    // Step 1: Catch wobble with sounds
    ball.classList.add('catching');
    setTimeout(() => playWobbleSound(), 50);
    setTimeout(() => playWobbleSound(), 400);
    setTimeout(() => playWobbleSound(), 750);

    // Step 2: After wobble, burst
    setTimeout(() => {
        ball.classList.remove('catching');
        playOpenSound();
        ball.classList.add('opening');

        // Step 3: Switch to open, update state
        setTimeout(() => {
            ball.src = 'images/pokeball_open.png';
            ball.classList.remove('opening');

            if (!openedStatus[index]) {
                openedStatus[index] = true;
                openedCount++;
                document.getElementById(`dot-${index}`).classList.add('opened');
            }

            // Show Pokedex button after first card
            document.getElementById('pokedex-btn').style.display = 'block';

            // Step 4: Set pending scroll if this ball has one
            if (scrollMessages[index] !== undefined) {
                pendingScrollIndex = index;
            }

            // Step 5: Show card
            showCard(pokemonCardImages[index], index);
            isAnimating = false;
        }, 400);
    }, 1200);
}

// ===================== CLOSE MODAL =====================

function closeModal() {
    skipStatsReveal();

    const overlay = document.getElementById('modal-overlay');
    const modal = document.getElementById('message-modal');

    overlay.classList.remove('visible');
    modal.classList.remove('revealing');
    modal.style.display = 'none';
    document.getElementById('card-flipper').classList.remove('flipped');
    setTimeout(() => { overlay.style.display = 'none'; }, 400);

    if (viewingFromPokedex) {
        viewingFromPokedex = false;
        return;
    }

    // Show scroll if one is pending for this ball
    if (pendingScrollIndex >= 0) {
        const scrollIndex = pendingScrollIndex;
        pendingScrollIndex = -1;
        setTimeout(() => showScroll(scrollIndex), 600);
        return;
    }

    // No scroll — run post-close logic directly
    handlePostCardClose();
}

function handlePostCardClose() {
    // Check if we should show Master Ball
    if (openedCount === totalRegularBalls && !masterBallShown) {
        masterBallShown = true;
        setTimeout(() => showMasterBall(), 800);
    }

    // Check if Master Ball was just opened — trigger finale
    if (masterBallOpened) {
        document.querySelectorAll('.tracker-dot').forEach(dot => dot.classList.add('all-done'));
        setTimeout(() => triggerFinale(), 1500);
    }
}

// ===================== SCROLL REVEAL =====================

function showScroll(index) {
    const message = scrollMessages[index];
    if (!message) return;

    currentScrollIndex = index;
    const msgEl = document.getElementById('scroll-message-text');
    msgEl.textContent = message;
    msgEl.classList.toggle('two-column', index === 1);

    // Reset scroll state
    const closedContainer = document.getElementById('scroll-closed-container');
    const openContainer = document.getElementById('scroll-open-container');
    const closeBtn = document.getElementById('scroll-close-btn');
    const textArea = document.getElementById('scroll-text-area');

    closedContainer.style.display = 'block';
    closedContainer.classList.remove('unrolling');
    openContainer.style.display = 'none';
    openContainer.classList.remove('revealing');
    textArea.classList.remove('text-revealed');
    closeBtn.classList.remove('visible');
    scrollAnimating = false;

    // Show overlay
    const overlay = document.getElementById('scroll-overlay');
    overlay.style.display = 'block';
    requestAnimationFrame(() => overlay.classList.add('visible'));

    // Show scroll modal with entrance animation
    const modal = document.getElementById('scroll-modal');
    modal.style.display = 'block';
    modal.classList.remove('scroll-entering');
    void modal.offsetWidth;
    modal.classList.add('scroll-entering');

    playScrollAppearSound();
}

function unrollScroll() {
    if (scrollAnimating) return;
    scrollAnimating = true;

    const closedContainer = document.getElementById('scroll-closed-container');
    const openContainer = document.getElementById('scroll-open-container');
    const textArea = document.getElementById('scroll-text-area');
    const closeBtn = document.getElementById('scroll-close-btn');

    // Mark this scroll as seen
    scrollShownStatus[currentScrollIndex] = true;

    // Phase 1: Glow and shrink the closed scroll
    closedContainer.classList.add('unrolling');
    playScrollUnrollSound();

    // Phase 2: After closed scroll fades, show open scroll
    setTimeout(() => {
        closedContainer.style.display = 'none';
        openContainer.style.display = '';  // Clear inline style so CSS class can take effect
        openContainer.classList.add('revealing');

        // Phase 3: Reveal text after scroll finishes opening
        setTimeout(() => {
            textArea.classList.add('text-revealed');

            // Show close button after text reveals
            setTimeout(() => {
                closeBtn.classList.add('visible');
            }, 800);
        }, 600);
    }, 500);
}

function closeScroll() {
    const overlay = document.getElementById('scroll-overlay');
    const modal = document.getElementById('scroll-modal');

    overlay.classList.remove('visible');
    modal.classList.remove('scroll-entering');
    modal.style.display = 'none';
    scrollAnimating = false;

    setTimeout(() => { overlay.style.display = 'none'; }, 400);

    // If viewing from Pokedex, just close
    if (viewingFromPokedex) {
        viewingFromPokedex = false;
        return;
    }

    // Resume post-card-close logic
    handlePostCardClose();
}

// ===================== MASTER BALL =====================

function showMasterBall() {
    // Pulse tracker dots
    document.querySelectorAll('.tracker-dot').forEach(dot => dot.classList.add('all-done'));

    screenTransition(() => {
        document.getElementById('main-view').style.display = 'none';
        document.getElementById('pokedex-btn').style.display = 'none';
        document.getElementById('master-ball-view').style.display = 'flex';
        playMasterBallAppear();
    });
}

function openMasterBall() {
    if (isAnimating) return;
    isAnimating = true;
    masterBallAttempts++;

    const ball = document.getElementById('ball-master');
    const heading = document.querySelector('#master-ball-view h1');

    // Wobble animation
    ball.classList.add('catching');
    ball.style.animation = 'catchWobble 1.2s ease-in-out forwards';
    setTimeout(() => playWobbleSound(), 50);
    setTimeout(() => playWobbleSound(), 400);
    setTimeout(() => playWobbleSound(), 750);

    if (masterBallAttempts < 3) {
        // Failed catch — ball breaks free
        setTimeout(() => {
            ball.style.animation = '';
            ball.classList.remove('catching');
            playCatchFail();

            // Shake the ball away briefly then reset
            ball.style.animation = 'burst 0.4s ease-out forwards';
            setTimeout(() => {
                ball.style.animation = '';
                ball.style.animation = 'legendaryPulse 2s ease-in-out infinite';
                isAnimating = false;

                if (masterBallAttempts === 1) {
                    heading.textContent = 'It is trying to break free! Try again!';
                } else {
                    heading.textContent = 'Almost had it! One more time!';
                }
            }, 400);
        }, 1200);
    } else {
        // Third attempt — successful catch!
        setTimeout(() => {
            ball.style.animation = '';
            ball.classList.remove('catching');
            playOpenSound();
            ball.classList.add('opening');
            ball.style.animation = 'burst 0.4s ease-out forwards';

            setTimeout(() => {
                ball.src = 'images/Legendary Ball Open.png';
                ball.style.animation = '';
                ball.classList.remove('opening');
                masterBallOpened = true;
                document.getElementById('dot-5').classList.add('opened');

                // Lacy's master ball has a scroll
                if (scrollMessages[5] !== undefined) {
                    pendingScrollIndex = 5;
                }

                showCard(masterBallCard, 5);
                isAnimating = false;
            }, 400);
        }, 1200);
    }
}

// ===================== FINALE =====================

function triggerFinale() {
    stopBGM();
    screenTransition(() => {
        document.getElementById('master-ball-view').style.display = 'none';
        document.getElementById('main-view').style.display = 'none';
        document.getElementById('pokedex-btn').style.display = 'none';
        document.getElementById('final-screen').style.display = 'flex';
        playFanfare();
    });
}

// ===================== POKEDEX =====================

function openPokedex() {
    const grid = document.getElementById('pokedex-grid');
    grid.innerHTML = '';

    const allCards = [...pokemonCardImages, masterBallCard];
    const allStatus = [...openedStatus, masterBallOpened];

    allCards.forEach((card, i) => {
        const entry = document.createElement('div');
        entry.className = 'pokedex-entry' + (allStatus[i] ? '' : ' locked');

        if (allStatus[i]) {
            const wrap = document.createElement('div');
            wrap.className = 'pokedex-card-wrap';

            const img = document.createElement('img');
            img.src = card;
            wrap.appendChild(img);

            const msgBox = document.createElement('div');
            msgBox.className = 'pokedex-message';
            const statsIndex = (i < 5) ? i : 5;
            msgBox.innerHTML = buildStatsHTML(getStatsForIndex(statsIndex));
            wrap.appendChild(msgBox);

            entry.appendChild(wrap);

            // Add "View Scroll" button if this ball's scroll has been seen
            const scrollIdx = (i < 5) ? i : 5;
            if (scrollShownStatus[scrollIdx]) {
                const scrollBtn = document.createElement('button');
                scrollBtn.className = 'close-btn';
                scrollBtn.style.fontSize = '0.75rem';
                scrollBtn.style.marginTop = '8px';
                scrollBtn.style.padding = '5px 12px';
                scrollBtn.textContent = 'View Scroll';
                scrollBtn.onclick = function(e) {
                    e.stopPropagation();
                    closePokedex();
                    viewingFromPokedex = true;
                    showScroll(scrollIdx);
                };
                entry.appendChild(scrollBtn);
            }
        } else {
            entry.innerHTML = '<span class="locked-text">?</span>';
        }

        grid.appendChild(entry);
    });

    document.getElementById('pokedex-overlay').style.display = 'flex';
}

function closePokedex() {
    document.getElementById('pokedex-overlay').style.display = 'none';
}

function viewPokedexCard(index) {
    closePokedex();
    viewingFromPokedex = true;

    const allCards = [...pokemonCardImages, masterBallCard];
    // index 0-4 map to pokemonStats, index 5 maps to masterBallStats
    const statsIndex = (index < 5) ? index : 5;

    showCard(allCards[index], statsIndex, true);
}

// ===================== FINALE POKEDEX / DOWNLOAD =====================

function openPokedexFromFinale() {
    openPokedex();
}

// ===================== REPLAY =====================

function replay() {
    openedCount = 0;
    isAnimating = false;
    masterBallShown = false;
    masterBallOpened = false;
    masterBallAttempts = 0;
    viewingFromPokedex = false;
    currentCardIndex = -1;
    statsRevealing = false;
    statsRevealTimers.forEach(t => clearTimeout(t));
    statsRevealTimers = [];
    pendingScrollIndex = -1;
    currentScrollIndex = -1;
    Object.keys(scrollShownStatus).forEach(k => delete scrollShownStatus[k]);
    scrollAnimating = false;

    for (let i = 0; i < totalRegularBalls; i++) {
        openedStatus[i] = false;
        document.getElementById(`ball-${i}`).src = 'images/pokeball.png';
        document.getElementById(`dot-${i}`).classList.remove('opened', 'all-done');
    }
    document.getElementById('dot-5').classList.remove('opened', 'all-done');
    document.getElementById('ball-master').src = 'images/Legendary Ball.png';
    document.getElementById('ball-master').style.animation = '';
    document.querySelector('#master-ball-view h1').textContent = 'A Legendary Poke Ball Appears!';
    document.getElementById('pokeball-container').classList.remove('entered');
    document.getElementById('pokedex-btn').style.display = 'none';
    stopBGM();

    screenTransition(() => {
        document.getElementById('final-screen').style.display = 'none';
        document.getElementById('master-ball-view').style.display = 'none';
        document.getElementById('main-view').style.display = 'none';
        document.getElementById('intro-screen').style.display = 'flex';
    });
}

// ===================== INIT =====================
createParticles();
