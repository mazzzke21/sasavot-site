/* ============================================
   MAIN.JS — SAS_ARCHIVE.EXE
   Главный файл инициализации сайта-музея «Дело SAS»
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. TERMINAL TYPING EFFECT (Intro)
    // ==========================================
    function initTerminal() {
        const lines = document.querySelectorAll('.terminal-line');
        
        lines.forEach((line, index) => {
            const delay = parseInt(line.dataset.delay) || 0;
            setTimeout(() => {
                line.classList.add('visible');
                // Play subtle audio tick on each line
                if (AudioEngine.context && index > 0 && index % 2 === 0) {
                    AudioEngine.resume();
                }
            }, delay);
        });

        // Enable scroll to proceed
        const terminal = document.getElementById('terminal');
        const proceedNext = () => {
            document.getElementById('dasha').scrollIntoView({ behavior: 'smooth' });
        };

        // Enter key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && isElementInViewport(document.getElementById('intro'))) {
                proceedNext();
            }
        });
    }

    // Helper: check if element is in viewport
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // ==========================================
    // 2. ESC OVERLAY
    // ==========================================
    function initEscOverlay() {
        const escapeLink = document.getElementById('escapeLink');
        const escOverlay = document.getElementById('escOverlay');
        const countdownEl = document.getElementById('escCountdown');

        if (!escapeLink || !escOverlay) return;

        escapeLink.addEventListener('click', (e) => {
            e.preventDefault();
            escOverlay.classList.add('active');
            AudioEngine.resume();
            AudioEngine.playTapeStop();

            let count = 5;
            const interval = setInterval(() => {
                count--;
                if (countdownEl) countdownEl.textContent = count;
                if (count <= 0) {
                    clearInterval(interval);
                    escOverlay.classList.remove('active');
                    if (countdownEl) countdownEl.textContent = '5';
                    // Trigger glitch then return
                    GlitchEngine.triggerHeavy();
                }
            }, 1000);
        });

        // Global ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !escOverlay.classList.contains('active')) {
                if (isElementInViewport(document.getElementById('intro'))) {
                    escapeLink.click();
                }
            }
            if (e.key === 'Escape' && escOverlay.classList.contains('active')) {
                // Prevent double escape
            }
        });
    }

    // ==========================================
    // 3. SPOILER BLOCKS
    // ==========================================
    function initSpoilers() {
        document.querySelectorAll('.spoiler-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const content = toggle.nextElementSibling;
                if (content && content.classList.contains('spoiler-content')) {
                    const isActive = content.classList.toggle('active');
                    toggle.textContent = isActive 
                        ? toggle.textContent.replace('[РАСКРЫТЬ', '[СКРЫТЬ')
                        : toggle.textContent.replace('[СКРЫТЬ', '[РАСКРЫТЬ');
                    
                    // Trigger glitch on open
                    if (isActive) {
                        GlitchEngine.trigger();
                        AudioEngine.resume();
                        AudioEngine.playGlitch();
                    }
                }
            });
        });
    }

    // ==========================================
    // 4. CCTV CAMERAS (Morphe section)
    // ==========================================
    function initCCTV() {
        const canvases = document.querySelectorAll('.cctv-canvas');
        
        canvases.forEach(canvas => {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            let isAnimating = true;

            function drawCCTVFrame() {
                if (!isAnimating) return;

                const w = canvas.width = canvas.clientWidth;
                const h = canvas.height = canvas.clientHeight;

                const imageData = ctx.createImageData(w, h);
                const data = imageData.data;

                for (let i = 0; i < data.length; i += 4) {
                    // CCTV gray noise
                    const noise = Math.random() * 60;
                    const val = 20 + noise;
                    data[i] = val;     // R
                    data[i+1] = val;   // G
                    data[i+2] = val;   // B
                    data[i+3] = 255;
                }

                ctx.putImageData(imageData, 0, 0);

                // Add timestamp overlay
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(0, h - 16, w, 16);
                ctx.fillStyle = '#00cc44';
                ctx.font = '9px monospace';
                const now = new Date();
                const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
                ctx.fillText(timeStr, 4, h - 5);

                // VHS glitch occasionally
                if (Math.random() < 0.01) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                    ctx.fillRect(0, Math.random() * h, w, 2 + Math.random() * 4);
                }

                if (isAnimating) {
                    requestAnimationFrame(drawCCTVFrame);
                }
            }

            drawCCTVFrame();

            // Store cleanup
            canvas._cctvCleanup = () => { isAnimating = false; };
        });
    }

    // ==========================================
    // 5. AUDIO BUTTONS
    // ==========================================
    function initAudioButtons() {
        // Cutierover scream button
        const cutieBtn = document.getElementById('cutieAudioBtn');
        if (cutieBtn) {
            cutieBtn.addEventListener('click', () => {
                VHSPlayer.playAudio('cutie-scream');
                GlitchEngine.trigger();
            });
        }

        // Criswave call button
        const crisBtn = document.getElementById('crisAudioPlay');
        if (crisBtn) {
            crisBtn.addEventListener('click', () => {
                VHSPlayer.playAudio('cris-call');
                // Visual waveform animation
                const canvas = document.getElementById('audioWaveform');
                if (canvas) {
                    animateWaveform(canvas);
                }
            });
        }
    }

    // Audio waveform animation
    function animateWaveform(canvas) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width = canvas.clientWidth;
        const h = canvas.height = canvas.clientHeight;
        let time = 0;
        let isAnimating = true;

        function draw() {
            if (!isAnimating) return;
            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, w, h);

            time += 0.05;

            ctx.strokeStyle = '#00cc44';
            ctx.lineWidth = 1;
            ctx.beginPath();

            for (let x = 0; x < w; x++) {
                const y = h/2 + Math.sin(x * 0.05 + time) * 10 
                         + Math.sin(x * 0.1 + time * 2) * 5 
                         + Math.sin(x * 0.02 + time * 0.5) * 15
                         + (Math.random() - 0.5) * 5;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.stroke();

            requestAnimationFrame(draw);
        }

        draw();
        
        // Stop after 4 seconds
        setTimeout(() => { isAnimating = false; }, 4000);
    }

    // ==========================================
    // 6. MAP INTERACTIONS
    // ==========================================
    function initMap() {
        const markers = document.querySelectorAll('.map-marker');
        const modal = document.getElementById('mapModal');
        const modalTitle = document.getElementById('mapModalTitle');
        const modalText = document.getElementById('mapModalText');
        const modalClose = document.getElementById('mapModalClose');
        const modalImage = document.getElementById('mapModalImage');

        const victimData = {
            dasha: {
                title: 'dasha228play',
                text: 'Место последней трансляции. Квартира в ЮАО, Москва. 12.04.2021. Тело не найдено. На месте обнаружены: разбитый монитор, вырванная веб-камера, надпись на стене.',
                img: '🗃'
            },
            morphe: {
                title: 'morphe_ya',
                text: 'Улица рядом с домом. Камеры наблюдения зафиксировали мужской силуэт, следующий за жертвой. 03.09.2022. Квартира пуста, на стене надпись: «ТЫ НЕ ДАЛА. Я ЗАБРАЛ САМ. sasavot»',
                img: '📹'
            },
            cutie: {
                title: 'cutierover',
                text: 'Дом в ЮАО, Москва. 17.01.2023. Жертва вычислила IP-адрес sasavot. Проникновение в квартиру во время голосового чата в Discord. Тело не найдено.',
                img: '💻'
            },
            cris: {
                title: 'chr1swave',
                text: 'Подвальное помещение дома в ЮАО. 08.06.2023. Последний звонок в 112. На стене: «sasavot WAS HERE. sasavot IS FOREVER. sasavot IS GOD.» Полное отсутствие улик.',
                img: '📞'
            },
            korya: {
                title: 'korya_mc — ВЫЖИЛА',
                text: 'Квартира в ЮАО, Москва. 14.11.2023. sasavot проник в квартиру, но не тронул жертву. Единственная выжившая. Находится под программой защиты свидетелей.',
                img: '💙'
            },
            sas: {
                title: 'sasavot — последняя активность',
                text: 'Последнее известное местоположение. Квартира в ЮАО, Москва. 31.12.2024 — финальный стрим. После — квартира пуста. Подозреваемый в федеральном розыске.',
                img: '❓'
            }
        };

        markers.forEach(marker => {
            marker.addEventListener('click', () => {
                const victim = marker.dataset.victim;
                const data = victimData[victim];
                if (!data) return;

                modalTitle.textContent = data.title;
                modalImage.textContent = data.img;
                modalImage.style.fontSize = '60px';
                modalText.textContent = data.text;
                modal.classList.add('active');

                // Play SAS voice on his marker
                if (victim === 'sas') {
                    VHSPlayer.playAudio('sas-voice');
                }

                AudioEngine.resume();
            });
        });

        if (modalClose) {
            modalClose.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    // ==========================================
    // 7. GUESTBOOK SAS MESSAGE GLITCH
    // ==========================================
    function initGuestbook() {
        const sasMsg = document.getElementById('sasMessage');
        if (!sasMsg) return;

        // Periodic glitch on SAS guestbook message
        setInterval(() => {
            sasMsg.style.opacity = '0';
            sasMsg.style.transform = 'translateX(5px)';
            
            setTimeout(() => {
                sasMsg.style.opacity = '1';
                sasMsg.style.transform = 'translateX(0)';
            }, 200);
            
            setTimeout(() => {
                sasMsg.style.opacity = '0';
                sasMsg.style.transform = 'translateX(-3px)';
            }, 400);
            
            setTimeout(() => {
                sasMsg.style.opacity = '1';
                sasMsg.style.transform = 'translateX(0)';
            }, 600);
        }, 7000);
    }

    // ==========================================
    // 8. NAVIGATION HIGHLIGHT
    // ==========================================
    function initNavigation() {
        const sections = document.querySelectorAll('.exhibit');
        const navLinks = document.querySelectorAll('.nav-link');

        window.addEventListener('scroll', () => {
            let current = '';
            
            sections.forEach(section => {
                const top = section.offsetTop - 100;
                const bottom = top + section.offsetHeight;
                
                if (window.scrollY >= top && window.scrollY < bottom) {
                    current = section.id;
                }
            });

            navLinks.forEach(link => {
                link.classList.toggle('active', link.dataset.section === current);
            });
        });
    }

    // ==========================================
    // 9. FINAL SECTION HEAVY GLITCH
    // ==========================================
    function initFinalSection() {
        const finalSection = document.getElementById('final');
        
        if (!finalSection) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Trigger heavy glitch when final section enters viewport
                    setTimeout(() => {
                        GlitchEngine.triggerHeavy();
                        AudioEngine.resume();
                        AudioEngine.playSiren();
                    }, 500);
                    
                    // Once done, disconnect
                    observer.disconnect();
                }
            });
        }, { threshold: 0.3 });

        observer.observe(finalSection);
    }

    // ==========================================
    // 10. MOUSE TRAIL (subtle)
    // ==========================================
    function initMouseTrail() {
        document.addEventListener('mousemove', (e) => {
            if (CursorFX && CursorFX.createTrail) {
                CursorFX.createTrail(e);
            }
        });
    }

    // ==========================================
    // 11. NAVIGATION CLICK SMOOTH SCROLL
    // ==========================================
    function initNavScroll() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    // Play tape rewind sound
                    AudioEngine.resume();
                    AudioEngine.playTapeRewind();
                }
            });
        });
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    // Audio engine needs user interaction to start
    let audioStarted = false;
    const startAudio = () => {
        if (audioStarted) return;
        audioStarted = true;
        
        AudioEngine.init().then(() => {
            console.log('Audio engine initialized');
        }).catch(err => {
            console.warn('Audio init warning:', err);
        });
    };

    // Start audio on first user interaction
    document.addEventListener('click', startAudio, { once: true });
    document.addEventListener('keydown', startAudio, { once: true });
    document.addEventListener('scroll', startAudio, { once: true });

    // Initialize all modules
    try {
        initTerminal();
        initEscOverlay();
        initSpoilers();
        initCCTV();
        initAudioButtons();
        initMap();
        initGuestbook();
        initNavigation();
        initFinalSection();
        initMouseTrail();
        initNavScroll();

        // Initialize engines
        GlitchEngine.init();
        VHSPlayer.init();
        CursorFX.init();

        console.log('SAS_ARCHIVE v1.04.2025 initialized successfully');
        console.log('ДЕЛО №SAS-2024-88 — Цифровой архив расследования');
    } catch (err) {
        console.error('Initialization error:', err);
    }
});