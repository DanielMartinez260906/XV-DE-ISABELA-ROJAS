/* ==========================================================================
   XV de Isabella Rojas Zuluaga - Rapunzel Interactive Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    initLanternCanvas();
    initAudioPlayer();
    initRSVP();
    initWishes();
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
   2. Floating Sky Lanterns Canvas Animation
   ========================================== */
let lanternParticles = [];

function initLanternCanvas() {
    const canvas = document.getElementById('lanternCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // Create initial lanterns
    const lanternCount = 25;
    for (let i = 0; i < lanternCount; i++) {
        lanternParticles.push(createLantern(width, height, true));
    }

    // Touch / Click to release a new lantern with a wish!
    window.addEventListener('click', (e) => {
        // Don't trigger if clicking interactive buttons or inputs
        if (e.target.closest('button, input, a, .modal-card')) return;
        spawnUserLantern(e.clientX, e.clientY);
    });

    function render() {
        ctx.clearRect(0, 0, width, height);

        lanternParticles.forEach((l, index) => {
            l.y -= l.speedY;
            l.x += Math.sin(l.wobble) * l.speedX;
            l.wobble += 0.02;

            // Draw floating glowing lantern
            ctx.save();
            ctx.translate(l.x, l.y);

            // Outer glow
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, l.size * 2.5);
            gradient.addColorStop(0, `rgba(255, 215, 0, ${l.opacity * 0.8})`);
            gradient.addColorStop(0.5, `rgba(255, 140, 0, ${l.opacity * 0.4})`);
            gradient.addColorStop(1, 'rgba(255, 140, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, l.size * 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Lantern Body (Soft rounded rect)
            ctx.fillStyle = `rgba(255, 235, 170, ${l.opacity})`;
            ctx.strokeStyle = `rgba(255, 160, 0, ${l.opacity})`;
            ctx.lineWidth = 1;

            const w = l.size * 1.2;
            const h = l.size * 1.6;
            ctx.beginPath();
            ctx.roundRect(-w / 2, -h / 2, w, h, [4, 4, 2, 2]);
            ctx.fill();
            ctx.stroke();

            // Inner flame core
            ctx.fillStyle = `rgba(255, 255, 255, ${l.opacity * 0.9})`;
            ctx.beginPath();
            ctx.arc(0, h / 4, l.size * 0.3, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

            // Reset lantern when it floats off top
            if (l.y < -50) {
                lanternParticles[index] = createLantern(width, height, false);
            }
        });

        requestAnimationFrame(render);
    }

    render();
}

function createLantern(width, height, randomY = false) {
    return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : height + Math.random() * 100,
        size: Math.random() * 10 + 8,
        speedY: Math.random() * 0.8 + 0.4,
        speedX: Math.random() * 0.5 + 0.2,
        wobble: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.5 + 0.5
    };
}

function spawnUserLantern(x, y) {
    for (let i = 0; i < 3; i++) {
        lanternParticles.push({
            x: x + (Math.random() * 30 - 15),
            y: y + (Math.random() * 30 - 15),
            size: Math.random() * 14 + 10,
            speedY: Math.random() * 1.2 + 0.8,
            speedX: Math.random() * 0.6 + 0.2,
            wobble: Math.random() * Math.PI * 2,
            opacity: 1
        });
    }
    showToast("✨ ¡Has elevado una linterna mágica al cielo!");
}

/* ==========================================
   3. RSVP Modal & WhatsApp Integration
   ========================================== */
function initRSVP() {
    const modal = document.getElementById('rsvpModal');
    const openBtn = document.getElementById('openRsvpBtn');
    const closeBtn = document.getElementById('closeRsvpBtn');
    const sendBtn = document.getElementById('sendWhatsappBtn');

    if (openBtn && modal) {
        openBtn.addEventListener('click', () => modal.classList.add('active'));
    }
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            const guestName = document.getElementById('guestName').value.trim();
            const guestPasses = document.getElementById('guestPasses').value;
            const guestNote = document.getElementById('guestNote').value.trim();

            if (!guestName) {
                showToast("⚠️ Por favor ingresa tu nombre completo.");
                return;
            }

            let msg = `✨ *CONFIRMACIÓN DE ASISTENCIA - 15 AÑOS DE ISABELLA* ✨\n\n`;
            msg += `👑 *Nombre:* ${guestName}\n`;
            msg += `👥 *Asistentes:* ${guestPasses} persona(s)\n`;
            if (guestNote) {
                msg += `💌 *Mensaje:* "${guestNote}"\n`;
            }
            msg += `\n¡Estoy muy feliz de acompañarte en tu noche mágica! 🌸👑`;

            const encodedMsg = encodeURIComponent(msg);
            // Open WhatsApp with formatted text
            const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMsg}`;
            window.open(whatsappUrl, '_blank');

            if (modal) modal.classList.remove('active');
            showToast(" Abriendo WhatsApp...");
        });
    }
}

/* ==========================================
   4. Audio Player (Magic Fairytale Synth Theme)
   ========================================== */
let audioCtx = null;
let isPlayingAudio = false;
let audioTimer = null;

function initAudioPlayer() {
    const btn = document.getElementById('audioToggleBtn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        if (!isPlayingAudio) {
            startMagicMusic();
            btn.classList.add('playing');
            btn.innerHTML = '<i class="fas fa-volume-up"></i>';
            showToast("🎵 Reproduciendo melodía mágica de Rapunzel");
        } else {
            stopMagicMusic();
            btn.classList.remove('playing');
            btn.innerHTML = '<i class="fas fa-music"></i>';
            showToast("🔇 Música pausada");
        }
    });
}

function startMagicMusic() {
    isPlayingAudio = true;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    // Tangled / Royal Waltz Note Frequencies (Melodic fairytale arpeggio)
    const notes = [
        392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99, // G4 to G5
        659.25, 587.33, 523.25, 493.88, 440.00, 392.00
    ];
    let noteIdx = 0;

    function playNextNote() {
        if (!isPlayingAudio) return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        // Warm sine + soft bell oscillator tone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[noteIdx], audioCtx.currentTime);

        // Soft envelope
        gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.85);

        noteIdx = (noteIdx + 1) % notes.length;
        audioTimer = setTimeout(playNextNote, 500);
    }

    playNextNote();
}

function stopMagicMusic() {
    isPlayingAudio = false;
    if (audioTimer) clearTimeout(audioTimer);
}

/* ==========================================
   5. Interactive Wish Launcher
   ========================================== */
function initWishes() {
    const wishBtn = document.getElementById('sendWishBtn');
    const wishInput = document.getElementById('wishInput');

    if (wishBtn && wishInput) {
        wishBtn.addEventListener('click', () => {
            const text = wishInput.value.trim();
            if (!text) {
                showToast("✨ Escribe tus felicitaciones para elevar una linterna.");
                return;
            }

            // Launch custom sky lantern
            spawnUserLantern(window.innerWidth / 2, window.innerHeight - 100);
            wishInput.value = "";
            showToast(`💖 ¡Tu deseo "${text}" ha sido enviado a las estrellas!`);
        });
    }
}

/* ==========================================
   6. Calendar & Helper Utilities
   ========================================== */
function addToCalendar() {
    const title = encodeURIComponent("15 Años de Isabella Rojas Zuluaga 👑");
    const details = encodeURIComponent("Celebración de los 15 Años de Isabella en Eventos Prestige. Vestimenta: Semiformal de Negro.");
    const location = encodeURIComponent("Eventos Prestige, Calle 52 #46-47, Bello, Antioquia");
    const startDate = "20261023T190000";
    const endDate = "20261024T030000";

    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
    window.open(googleCalUrl, '_blank');
}

function copyEnvelopeInfo() {
    const textToCopy = "Lluvia de Sobres - 15 Años Isabella Rojas Zuluaga. Eventos Prestige, Calle 52 #46-47, Bello Antioquia.";
    navigator.clipboard.writeText(textToCopy).then(() => {
        showToast("📋 ¡Información copiada al portapapeles!");
    }).catch(() => {
        showToast("💌 Lluvia de sobres en sobre cerrado el día del evento.");
    });
}

function showToast(msg) {
    let toast = document.getElementById('toastMsg');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastMsg';
        toast.className = 'toast-msg';
        document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3200);
}
