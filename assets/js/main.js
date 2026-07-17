/* ============================================
    MAIN.JS — SAS_ARCHIVE.EXE
    ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 0. WARNING OVERLAY
    // ==========================================
    function initWarningOverlay() {
        const warningOverlay = document.getElementById('warningOverlay');
        const warningOkBtn = document.getElementById('warningOkBtn');
        
        if (!warningOverlay || !warningOkBtn) return;
        
        warningOverlay.classList.remove('hidden');
        
        warningOkBtn.addEventListener('click', () => {
            warningOverlay.classList.add('hidden');
            setTimeout(() => {
                initTerminal();
            }, 300);
        });
    }

    // ==========================================
    // 1. TERMINAL TYPING EFFECT (Intro)
    // ==========================================
    function initTerminal() {
        const lines = document.querySelectorAll('.terminal-line');
        
        lines.forEach((line, index) => {
            const delay = parseInt(line.dataset.delay) || 0;
            setTimeout(() => {
                line.classList.add('visible');
            }, delay);
        });

        // Enter key to proceed
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && isElementInViewport(document.getElementById('intro'))) {
                document.getElementById('dasha').scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

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

        if (!escapeLink || !escOverlay) return;

        escapeLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'game.html';
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !escOverlay.classList.contains('active')) {
                if (isElementInViewport(document.getElementById('intro'))) {
                    escapeLink.click();
                }
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
                    const noise = Math.random() * 60;
                    const val = 20 + noise;
                    data[i] = val;
                    data[i+1] = val;
                    data[i+2] = val;
                    data[i+3] = 255;
                }

                ctx.putImageData(imageData, 0, 0);

                // Timestamp overlay
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(0, h - 16, w, 16);
                ctx.fillStyle = '#00cc44';
                ctx.font = '9px monospace';
                const now = new Date();
                const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
                ctx.fillText(timeStr, 4, h - 5);

                if (isAnimating) {
                    requestAnimationFrame(drawCCTVFrame);
                }
            }

            drawCCTVFrame();
            canvas._cctvCleanup = () => { isAnimating = false; };
        });
    }

    // ==========================================
    // 5. MAP INTERACTIONS
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
                text: 'Место последней трансляции. Квартира в ЮАО, Москва. 12.04.2021. Тело не найдено.',
                img: '🗃'
            },
            morphe: {
                title: 'morphe_ya',
                text: 'Улица рядом с домом. Камеры наблюдения зафиксировали мужской силуэт. 03.09.2022.',
                img: '📹'
            },
            cutie: {
                title: 'cutierover',
                text: 'Дом в ЮАО, Москва. 17.01.2023. Жертва вычислила IP-адрес sasavot.',
                img: '💻'
            },
            cris: {
                title: 'chr1swave',
                text: 'Подвальное помещение дома в ЮАО. 08.06.2023. Последний звонок в 112.',
                img: '📞'
            },
            korya: {
                title: 'korya_mc — ВЫЖИЛА',
                text: 'Квартира в ЮАО, Москва. 14.11.2023. Единственная выжившая.',
                img: '💙'
            },
            sas: {
                title: 'sasavot — последняя активность',
                text: 'Последнее известное местоположение. Квартира в ЮАО, Москва. 31.12.2024.',
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
            });
        });

        if (modalClose) {
            modalClose.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    // ==========================================
    // 6. GUESTBOOK SAS MESSAGE GLITCH
    // ==========================================
    function initGuestbook() {
        const sasMsg = document.getElementById('sasMessage');
        if (!sasMsg) return;

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
    // 7. NAVIGATION HIGHLIGHT
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
    // 8. NAVIGATION CLICK SMOOTH SCROLL
    // ==========================================
    function initNavScroll() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    // ==========================================
    // 9. SCROLLITELLING VIDEO (timecode-based)
    // ==========================================
    function initScrollVideo() {
        const video = document.getElementById('bgVideo');
        if (!video) return;

        // Try to use real video first
        if (video.readyState >= 1) {
            initScrollVideoLogic(video);
        } else {
            video.addEventListener('loadedmetadata', () => initScrollVideoLogic(video));
            
            // If video fails to load, use canvas fallback
            video.addEventListener('error', () => {
                console.log('Video not found, using canvas fallback');
                initCanvasFallback();
            });
            
            // Timeout fallback
            setTimeout(() => {
                if (video.readyState < 1) {
                    console.log('Video load timeout, using canvas fallback');
                    initCanvasFallback();
                }
            }, 3000);
        }
    }

    function initScrollVideoLogic(video) {
        const duration = video.duration;
        if (!duration || !isFinite(duration)) {
            console.warn('Video duration not available');
            return;
        }
        
        console.log('Video loaded successfully:', {
            duration: duration.toFixed(2) + 's',
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            readyState: video.readyState
        });

        // Play video once and freeze on last frame
        video.loop = false;
        video.play().then(() => {
            console.log('Background video playing once');
        }).catch(() => {
            console.log('Video autoplay blocked, waiting for interaction');
            document.addEventListener('click', () => {
                video.play();
            }, { once: true });
        });

        // When video ends, freeze on last frame
        video.addEventListener('ended', () => {
            console.log('Video ended, frozen on last frame');
            // Video stays on last frame automatically
        });

        // Remove scroll-based video control
        // Video plays once and stays on last frame
        console.log(`Video initialized: plays once, ${duration.toFixed(2)}s duration`);
    }

    // Canvas fallback - animated noise/static effect
    function initCanvasFallback() {
        const video = document.getElementById('bgVideo');
        if (!video) return;
        
        // Hide video element
        video.style.display = 'none';
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.id = 'bgCanvas';
        canvas.className = 'bg-video';
        canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;opacity:0.15;pointer-events:none;';
        document.body.insertBefore(canvas, document.body.firstChild);
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Set canvas size
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Animation variables
        let time = 0;
        let lastScrollTop = window.scrollY;
        
        // Draw animated noise frame
        function drawNoiseFrame() {
            const w = canvas.width;
            const h = canvas.height;
            
            // Get scroll progress
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollProgress = scrollHeight > 0 ? Math.max(0, Math.min(1, window.scrollY / scrollHeight)) : 0;
            
            // Create image data
            const imageData = ctx.createImageData(w, h);
            const data = imageData.data;
            
            // Animated noise based on time and scroll
            const noiseIntensity = 30 + Math.sin(time * 0.5) * 10;
            
            for (let i = 0; i < data.length; i += 4) {
                const x = (i / 4) % w;
                const y = Math.floor((i / 4) / w);
                
                // Base noise
                let noise = Math.random() * noiseIntensity;
                
                // Add some structure based on scroll position
                const wave = Math.sin(y * 0.01 + time + scrollProgress * 10) * 20;
                
                const val = Math.min(255, 20 + noise + wave);
                
                data[i] = val;     // R
                data[i+1] = val;   // G
                data[i+2] = val;   // B
                data[i+3] = 255;   // A
            }
            
            ctx.putImageData(imageData, 0, 0);
            
            // Add horizontal scan lines
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            for (let y = 0; y < h; y += 3) {
                ctx.fillRect(0, y, w, 1);
            }
            
            // Add occasional bright line
            if (Math.random() < 0.02) {
                const lineY = Math.random() * h;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.fillRect(0, lineY, w, 2);
            }
            
            time += 0.016;
            requestAnimationFrame(drawNoiseFrame);
        }
        
        // Start animation
        drawNoiseFrame();
        
        console.log('Canvas fallback initialized - animated noise effect');
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    console.log('SAS_ARCHIVE v1.04.2025 — инициализация...');

    try {
        initWarningOverlay();
        initEscOverlay();
        initSpoilers();
        initCCTV();
        initMap();
        initGuestbook();
        initNavigation();
        initNavScroll();
        initScrollVideo();

        VHSPlayer.init();
        CursorFX.init();

        console.log('SAS_ARCHIVE v1.04.2025 initialized successfully');
    } catch (err) {
        console.error('Initialization error:', err);
    }
});