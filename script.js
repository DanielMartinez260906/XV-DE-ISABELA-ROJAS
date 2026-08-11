/* ==========================================================================
   XV de Isabella Rojas Zuluaga - Light Theme & Interactive Button Lanterns
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    initLanternCanvas();
    initAudioPlayer();
    initRSVP();
    initWishes();
    initScrollReveal();
    initButtonLanternEffects();
});

/* ==========================================
   1. Countdown Timer (Fecha: 23 Oct 2026 19:00)
   ========================================== */
function initCountdown() {
    const targetDate = new Date('2026-10-23T19:00:00-05:00').getTime();

    const daysEl = document.getElementById('timerDays');
    const hoursEl = document.getElementById('timerHours');
    const minsEl = document.getElementById('timerMins');
    const secsEl = document.getElementById('timerSecs');

    function updateTimer() {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference <= 0) {
            if (daysEl) daysEl.innerText = "00";
            if (hoursEl) hoursEl.innerText = "00";
            if (minsEl) minsEl.innerText = "00";
            if (secsEl) secsEl.innerText = "00";
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        if (daysEl) daysEl.innerText = days.toString().padStart(2, '0');
        if (hoursEl) hoursEl.innerText = hours.toString().padStart(2, '0');
        if (minsEl) minsEl.innerText = minutes.toString().padStart(2, '0');
        if (secsEl) secsEl.innerText = seconds.toString().padStart(2, '0');
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

/* ==========================================
   2. Sky Lanterns Canvas Particle Burst (On Button Click)
   ========================================== */
let lanternParticles = [];
let canvasCtx = null;
let canvasWidth = 0;
let canvasHeight = 0;

function initLanternCanvas() {
    const canvas = document.getElementById('lanternCanvas');
    if (!canvas) return;

    canvasCtx = canvas.getContext('2d');
    canvasWidth = canvas.width = window.innerWidth;
    canvasHeight = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        canvasWidth = canvas.width = window.innerWidth;
        canvasHeight = canvas.height = window.innerHeight;
    });

    function render() {
        canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

        for (let i = lanternParticles.length - 1; i >= 0; i--) {
            const l = lanternParticles[i];
            l.y -= l.speedY;
            l.x += Math.sin(l.wobble) * l.speedX;
            l.wobble += 0.035;
            l.opacity -= 0.0055;

            if (l.opacity <= 0 || l.y < -60) {
                lanternParticles.splice(i, 1);
                continue;
            }

            canvasCtx.save();
            canvasCtx.translate(l.x, l.y);

            // 1. Soft Ambient Outer Glow (Warm Gold/Amber)
            const outerGlow = canvasCtx.createRadialGradient(0, 0, 0, 0, 0, l.size * 3.5);
            outerGlow.addColorStop(0, `rgba(254, 240, 138, ${l.opacity * 0.95})`);
            outerGlow.addColorStop(0.4, `rgba(245, 158, 11, ${l.opacity * 0.65})`);
            outerGlow.addColorStop(1, 'rgba(217, 119, 6, 0)');

            canvasCtx.fillStyle = outerGlow;
            canvasCtx.beginPath();
            canvasCtx.arc(0, 0, l.size * 3.5, 0, Math.PI * 2);
            canvasCtx.fill();

            // 2. Rapunzel Lantern Paper Body
            canvasCtx.fillStyle = `rgba(254, 243, 199, ${l.opacity * 0.95})`;
            canvasCtx.beginPath();
            if (canvasCtx.roundRect) {
                canvasCtx.roundRect(-l.size * 0.65, -l.size, l.size * 1.3, l.size * 1.6, [l.size * 0.25]);
            } else {
                canvasCtx.rect(-l.size * 0.65, -l.size, l.size * 1.3, l.size * 1.6);
            }
            canvasCtx.fill();

            // 3. Inner Warm Flame Core
            const flameGlow = canvasCtx.createRadialGradient(0, l.size * 0.2, 0, 0, l.size * 0.2, l.size * 0.55);
            flameGlow.addColorStop(0, `rgba(255, 255, 255, ${l.opacity})`);
            flameGlow.addColorStop(0.6, `rgba(251, 191, 36, ${l.opacity * 0.9})`);
            flameGlow.addColorStop(1, `rgba(217, 119, 6, 0)`);

            canvasCtx.fillStyle = flameGlow;
            canvasCtx.beginPath();
            canvasCtx.arc(0, l.size * 0.2, l.size * 0.55, 0, Math.PI * 2);
            canvasCtx.fill();

            canvasCtx.restore();
        }

        requestAnimationFrame(render);
    }

    render();
}

/* Trigger Sky Lantern Burst with Short Navigation Delay on Button Clicks */
function initButtonLanternEffects() {
    document.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('button, .btn, a.btn, a[href], input[type="button"]');
        if (!targetBtn) return;

        const rect = targetBtn.getBoundingClientRect();
        const x = e.clientX || rect.left + rect.width / 2;
        const y = e.clientY || rect.top + rect.height / 2;

        // Button Visual Glow Pulse
        targetBtn.classList.remove('lantern-click-pulse');
        void targetBtn.offsetWidth;
        targetBtn.classList.add('lantern-click-pulse');

        // Spawn Lantern Burst
        spawnLanternBurst(x, y, 22);

        // If clicking an external <a> link (Google Maps, Waze, etc.), delay navigation so lanterns float up!
        const href = targetBtn.getAttribute('href');
        if (targetBtn.tagName.toLowerCase() === 'a' && href && !href.startsWith('#') && !href.startsWith('javascript:')) {
            if (!targetBtn.dataset.lanternNavigating) {
                e.preventDefault();
                e.stopPropagation();
                targetBtn.dataset.lanternNavigating = "true";

                const target = targetBtn.getAttribute('target') || '_self';

                setTimeout(() => {
                    delete targetBtn.dataset.lanternNavigating;
                    if (target === '_blank') {
                        window.open(href, '_blank');
                    } else {
                        window.location.href = href;
                    }
                }, 750); // 750ms delay to enjoy sky lanterns floating into the sky!
            }
        }
    }, true);
}

function spawnLanternBurst(startX, startY, customCount = 20) {
    const burstCount = customCount;
    for (let i = 0; i < burstCount; i++) {
        lanternParticles.push({
            x: startX + (Math.random() - 0.5) * 160,
            y: startY + (Math.random() - 0.5) * 50,
            size: Math.random() * 13 + 8,
            speedY: Math.random() * 3.6 + 2.2,
            speedX: (Math.random() - 0.5) * 1.8,
            wobble: Math.random() * Math.PI * 2,
            opacity: Math.random() * 0.35 + 0.65
        });
    }
}

/* ==========================================
   3. Background Instrumental Audio Player (cancion.mp3)
   ========================================== */
let bgAudio = null;
let isAudioPlaying = false;

function initAudioPlayer() {
    bgAudio = document.getElementById('bgMusic');
    const audioBtn = document.getElementById('audioToggleBtn');

    if (!bgAudio || !audioBtn) return;

    audioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleAudio();
    });

    // Attempt automatic play on load
    playAudio(true);

    // Global listener for first user interaction (unlocks audio autoplay on iOS & Android)
    const enableAudioOnUserGesture = () => {
        if (bgAudio && bgAudio.paused) {
            playAudio(false);
        }
        document.removeEventListener('click', enableAudioOnUserGesture);
        document.removeEventListener('touchstart', enableAudioOnUserGesture);
    };

    document.addEventListener('click', enableAudioOnUserGesture, { once: true });
    document.addEventListener('touchstart', enableAudioOnUserGesture, { once: true });
}

function toggleAudio() {
    if (!bgAudio) bgAudio = document.getElementById('bgMusic');
    if (bgAudio && !bgAudio.paused) {
        pauseAudio();
    } else {
        playAudio(false);
    }
}

function playAudio(isSilentAutoplayAttempt = false) {
    if (!bgAudio) bgAudio = document.getElementById('bgMusic');
    const audioBtn = document.getElementById('audioToggleBtn');
    const audioIcon = document.getElementById('audioIcon');

    if (bgAudio) {
        const playPromise = bgAudio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isAudioPlaying = true;
                if (audioBtn) audioBtn.classList.add('playing');
                if (audioIcon) audioIcon.className = 'fas fa-compact-disc fa-spin';
                if (!isSilentAutoplayAttempt) {
                    showToast("🎶 Reproduciendo Música Mágica...");
                }
            }).catch(error => {
                console.log("Autoplay restricted until user gesture:", error);
                isAudioPlaying = false;
                if (audioBtn) audioBtn.classList.remove('playing');
                if (audioIcon) audioIcon.className = 'fas fa-music';
            });
        }
    }
}

function pauseAudio() {
    if (!bgAudio) bgAudio = document.getElementById('bgMusic');
    const audioBtn = document.getElementById('audioToggleBtn');
    const audioIcon = document.getElementById('audioIcon');

    if (bgAudio) {
        bgAudio.pause();
        isAudioPlaying = false;
        if (audioBtn) audioBtn.classList.remove('playing');
        if (audioIcon) audioIcon.className = 'fas fa-music';
        showToast("🔇 Música Pausada");
    }
}

/* ==========================================
   4. WhatsApp RSVP Form Submission
   ========================================== */
function initRSVP() {
    const openBtn = document.getElementById('openRsvpBtn');
    const sendBtn = document.getElementById('sendWhatsappBtn');

    if (openBtn) {
        openBtn.addEventListener('click', () => openModal('rsvpModal'));
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', (e) => {
            const name = document.getElementById('guestName').value.trim();
            const passes = document.getElementById('guestPasses').value;
            const note = document.getElementById('guestNote').value.trim();

            if (!name) {
                showToast("⚠️ Por favor ingresa tu nombre completo");
                return;
            }

            const x = e.clientX || window.innerWidth / 2;
            const y = e.clientY || window.innerHeight / 2;
            spawnLanternBurst(x, y, 25);
            showToast("✨ Enviando confirmación por WhatsApp...");

            const message = `¡Hola Isabella! 👑✨%0A Confirmación de Asistencia a mis 15 Años%0A%0A👤 *Nombre:* ${encodeURIComponent(name)}%0A👥 *Asistentes:* ${passes} persona(s)%0A💬 *Mensaje:* ${encodeURIComponent(note || '¡Nos vemos en la fiesta!')}`;
            const whatsappUrl = `https://api.whatsapp.com/send?phone=573235005515&text=${message}`;

            setTimeout(() => {
                window.open(whatsappUrl, '_blank');
                closeModal('rsvpModal');
            }, 750);
        });
    }
}

/* ==========================================
   5. Interactive Wish Lanterns
   ========================================== */
function initWishes() {
    const wishBtn = document.getElementById('sendWishBtn');
    const wishInput = document.getElementById('wishInput');

    if (wishBtn && wishInput) {
        wishBtn.addEventListener('click', () => {
            const text = wishInput.value.trim();
            if (!text) {
                showToast("✨ Escribe un deseo antes de elevar la linterna ✨");
                return;
            }

            spawnLanternBurst(window.innerWidth / 2, window.innerHeight * 0.7);
            wishInput.value = '';
            showToast(`✨ ¡Tu linterna se ha elevado con el deseo: "${text.substring(0, 20)}..."! ✨`);
        });
    }
}

/* ==========================================
   6. Scroll Reveal Observer
   ========================================== */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.floating-text-block, .section-divider-blend');

    if (!('IntersectionObserver' in window)) {
        revealElements.forEach(el => el.classList.add('is-revealed'));
        return;
    }

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
            }
        });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));
}

/* ==========================================
   7. Interactive Entrance Lantern & Modals Handler
   ========================================== */
/* Spawn Full Screen Swarm of Sky Lanterns filling the entire viewport */
function spawnFullScreenLanternSwarm(count = 85) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    for (let i = 0; i < count; i++) {
        lanternParticles.push({
            x: Math.random() * width,
            y: height * (0.3 + Math.random() * 0.9),
            size: Math.random() * 14 + 7,
            speedY: Math.random() * 3.0 + 1.8,
            speedX: (Math.random() - 0.5) * 2.0,
            wobble: Math.random() * Math.PI * 2,
            opacity: Math.random() * 0.4 + 0.6
        });
    }
}

function openInvitationFromLantern(e) {
    // Spawn lantern swarm across the viewport
    spawnFullScreenLanternSwarm(60);
    const clickX = e && e.clientX ? e.clientX : window.innerWidth / 2;
    const clickY = e && e.clientY ? e.clientY : window.innerHeight / 2;
    spawnLanternBurst(clickX, clickY, 30);

    const overlay = document.getElementById('entranceOverlay');
    if (overlay) {
        overlay.classList.add('opened');
    }
    document.body.classList.remove('overlay-active');
    
    // Play background music upon touching lantern
    playAudio(false);
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    spawnLanternBurst(window.innerWidth / 2, window.innerHeight * 0.55, 20);

    // Smooth delay before popping modal up so user sees lanterns fly up!
    setTimeout(() => {
        if (modal) modal.classList.add('active');
    }, 450);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

const SPOTIFY_PLAYLIST_URL = "https://open.spotify.com/playlist/0SKa3j2x4oorvC7YjI1vzW?si=QVipX_AGQ3qvtdgV4Zmxiw&utm_source=whatsapp&pt=0208cfda6507f56d4c25cb467c599fc8&pi=OMtEmCWCQSyAq";

function openSpotifyPlaylist() {
    spawnLanternBurst(window.innerWidth / 2, window.innerHeight * 0.55, 25);
    showToast("🎶 Abriendo la playlist de Spotify...");
    setTimeout(() => {
        window.open(SPOTIFY_PLAYLIST_URL, '_blank');
    }, 700);
}

function submitSongSuggestion() {
    openSpotifyPlaylist();
    closeModal('songModal');
}

function copyEnvelopeInfo() {
    spawnLanternBurst(window.innerWidth / 2, window.innerHeight * 0.65, 22);
    navigator.clipboard.writeText("Lluvia de Sobres - XV de Isabella Rojas Zuluaga");
    showToast("📋 ¡Detalles copiados al portapapeles!");
}

function addToCalendar() {
    const calendarUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=XV+de+Isabella+Rojas+Zuluaga&dates=20261023T190000/20261024T030000&details=Celebración+de+15+Años+al+estilo+Rapunzel&location=Eventos+Prestige+Bello+Antioquia";
    spawnLanternBurst(window.innerWidth / 2, window.innerHeight * 0.55, 25);
    showToast("✨ Agendando fecha en tu calendario...");

    setTimeout(() => {
        window.open(calendarUrl, '_blank');
    }, 700);
}

function showToast(msg) {
    let toast = document.querySelector('.toast-msg');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast-msg';
        document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3200);
}
