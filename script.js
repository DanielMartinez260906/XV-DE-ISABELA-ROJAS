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
            l.wobble += 0.03;
            l.opacity -= 0.005;

            if (l.opacity <= 0 || l.y < -50) {
                lanternParticles.splice(i, 1);
                continue;
            }

            canvasCtx.save();
            canvasCtx.translate(l.x, l.y);

            // Glow
            const gradient = canvasCtx.createRadialGradient(0, 0, 0, 0, 0, l.size * 3);
            gradient.addColorStop(0, `rgba(251, 191, 36, ${l.opacity})`);
            gradient.addColorStop(0.5, `rgba(217, 119, 6, ${l.opacity * 0.5})`);
            gradient.addColorStop(1, 'rgba(217, 119, 6, 0)');

            canvasCtx.fillStyle = gradient;
            canvasCtx.beginPath();
            canvasCtx.arc(0, 0, l.size * 3, 0, Math.PI * 2);
            canvasCtx.fill();

            // Body
            canvasCtx.fillStyle = `rgba(254, 240, 138, ${l.opacity * 0.95})`;
            canvasCtx.beginPath();
            canvasCtx.roundRect(-l.size * 0.6, -l.size, l.size * 1.2, l.size * 1.6, [l.size * 0.2]);
            canvasCtx.fill();

            canvasCtx.restore();
        }

        requestAnimationFrame(render);
    }

    render();
}

/* Trigger Lantern Burst on Button Clicks */
function initButtonLanternEffects() {
    document.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('button, .btn, a.btn, input[type="button"]');
        if (targetBtn) {
            spawnLanternBurst(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);
        }
    });
}

function spawnLanternBurst(startX, startY, customCount = 12) {
    const burstCount = customCount;
    for (let i = 0; i < burstCount; i++) {
        lanternParticles.push({
            x: startX + (Math.random() - 0.5) * 140,
            y: startY + (Math.random() - 0.5) * 60,
            size: Math.random() * 12 + 8,
            speedY: Math.random() * 3.5 + 2.0,
            speedX: (Math.random() - 0.5) * 1.5,
            wobble: Math.random() * Math.PI * 2,
            opacity: Math.random() * 0.4 + 0.6
        });
    }
}

/* ==========================================
   3. Background Instrumental Audio Player
   ========================================== */
let audioCtx = null;
let isAudioPlaying = false;

function initAudioPlayer() {
    const audioBtn = document.getElementById('audioToggleBtn');
    if (!audioBtn) return;

    audioBtn.addEventListener('click', () => {
        if (!isAudioPlaying) {
            playRapunzelMelody();
            audioBtn.classList.add('playing');
            isAudioPlaying = true;
            showToast("🎶 Reproduciendo Música Mágica...");
        } else {
            stopRapunzelMelody();
            audioBtn.classList.remove('playing');
            isAudioPlaying = false;
            showToast("🔇 Música Pausada");
        }
    });
}

function playRapunzelMelody() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();

        const notes = [261.63, 329.63, 392.00, 523.25, 440.00, 392.00, 329.63, 293.66];
        let noteIndex = 0;

        function playNextNote() {
            if (!isAudioPlaying || !audioCtx) return;

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(notes[noteIndex], audioCtx.currentTime);

            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.8);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + 1.8);

            noteIndex = (noteIndex + 1) % notes.length;
            setTimeout(playNextNote, 2000);
        }

        playNextNote();
    } catch (e) {
        console.log("Web Audio API Error", e);
    }
}

function stopRapunzelMelody() {
    if (audioCtx) {
        audioCtx.close();
        audioCtx = null;
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
        sendBtn.addEventListener('click', () => {
            const name = document.getElementById('guestName').value.trim();
            const passes = document.getElementById('guestPasses').value;
            const note = document.getElementById('guestNote').value.trim();

            if (!name) {
                showToast("⚠️ Por favor ingresa tu nombre completo");
                return;
            }

            const message = `¡Hola Isabella! 👑✨%0A Confirmación de Asistencia a mis 15 Años%0A%0A👤 *Nombre:* ${encodeURIComponent(name)}%0A👥 *Asistentes:* ${passes} persona(s)%0A💬 *Mensaje:* ${encodeURIComponent(note || '¡Nos vemos en la fiesta!')}`;
            const whatsappUrl = `https://api.whatsapp.com/send?phone=573100000000&text=${message}`;

            window.open(whatsappUrl, '_blank');
            closeModal('rsvpModal');
            showToast("✨ ¡Gracias por confirmar tu asistencia! ✨");
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
function openInvitationFromLantern(e) {
    const overlay = document.getElementById('entranceOverlay');
    
    // Spawn a large fleet of sky lanterns floating up to top of screen!
    if (typeof spawnLanternBurst === 'function') {
        const clickX = e && e.clientX ? e.clientX : window.innerWidth / 2;
        const clickY = e && e.clientY ? e.clientY : window.innerHeight * 0.6;
        spawnLanternBurst(clickX, clickY, 35);
    }
    
    // Attempt auto-play music
    const audioBtn = document.getElementById('audioToggleBtn');
    if (audioBtn && !audioBtn.classList.contains('playing')) {
        audioBtn.click();
    }

    // Smoothly fade out overlay after lanterns float up!
    setTimeout(() => {
        if (overlay) {
            overlay.classList.add('opened');
        }
        showToast("✨ ¡Bienvenido a la celebración de Isabella! ✨");
    }, 900);
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

function submitSongSuggestion() {
    const input = document.getElementById('songName');
    if (!input || !input.value.trim()) {
        showToast("⚠️ Por favor escribe el nombre de la canción");
        return;
    }
    const song = input.value.trim();
    showToast(`🎶 ¡Gracias! "${song}" agregada a la lista del DJ`);
    input.value = "";
    closeModal('songModal');
}

function copyEnvelopeInfo() {
    navigator.clipboard.writeText("Lluvia de Sobres - XV de Isabella Rojas Zuluaga");
    showToast("📋 ¡Detalles copiados al portapapeles!");
}

function addToCalendar() {
    const calendarUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=XV+de+Isabella+Rojas+Zuluaga&dates=20261023T190000/20261024T030000&details=Celebración+de+15+Años+al+estilo+Rapunzel&location=Eventos+Prestige+Bello+Antioquia";
    window.open(calendarUrl, '_blank');
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
