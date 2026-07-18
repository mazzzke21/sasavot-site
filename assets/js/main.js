document.addEventListener('DOMContentLoaded', () => {

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

    function initTerminal() {
        const lines = document.querySelectorAll('.terminal-line');

        lines.forEach((line, index) => {
            const delay = parseInt(line.dataset.delay) || 0;
            setTimeout(() => {
                line.classList.add('visible');
            }, delay);
        });

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

    function initCCTV() {
        // Handle CCTV video
        const cctvVideo = document.getElementById('morpheCCTV1');
        if (cctvVideo) {
            console.log('CCTV video element found');
            console.log('Video src:', cctvVideo.querySelector('source')?.src);
            console.log('Video readyState:', cctvVideo.readyState);
            
            cctvVideo.load();
            
            const playPromise = cctvVideo.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('CCTV video playing successfully');
                }).catch(err => {
                    console.warn('CCTV video autoplay failed:', err);
                    document.addEventListener('click', () => {
                        cctvVideo.play();
                        console.log('CCTV video playing after click');
                    }, { once: true });
                });
            }

            cctvVideo.addEventListener('loadeddata', () => {
                console.log('CCTV video data loaded, duration:', cctvVideo.duration);
            });

            cctvVideo.addEventListener('error', (e) => {
                console.error('CCTV video error:', e);
            });
            
            cctvVideo.addEventListener('timeupdate', () => {
                console.log('CCTV video timeupdate:', cctvVideo.currentTime);
            });
        }

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

    function initMap() {
        const viewport = document.querySelector('.map-viewport');
        const inner = document.getElementById('mapInner');
        const modal = document.getElementById('mapModal');
        const modalTitle = document.getElementById('mapModalTitle');
        const modalText = document.getElementById('mapModalText');
        const modalClose = document.getElementById('mapModalClose');
        const modalImage = document.getElementById('mapModalImage');
        const zoomLevelEl = document.getElementById('mapZoomLevel');

        if (!viewport || !inner) return;

        let scale = 1;
        let translateX = 0;
        let translateY = 0;
        let isDragging = false;
        let startX = 0;
        let startY = 0;

        const MIN_SCALE = 0.5;
        const MAX_SCALE = 5;

        function updateTransform() {
            inner.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
            if (zoomLevelEl) {
                zoomLevelEl.textContent = Math.round(scale * 100) + '%';
            }
        }

        function applyZoom(newScale, cx, cy) {
            const oldScale = scale;
            scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScale));
            const vpw = viewport.clientWidth;
            const vph = viewport.clientHeight;
            const scaleRatio = scale / oldScale;
            translateX = cx - (cx - translateX) * scaleRatio;
            translateY = cy - (cy - translateY) * scaleRatio;
            clampPan();
            updateTransform();
        }

        function clampPan() {
            const vpw = viewport.clientWidth;
            const vph = viewport.clientHeight;
            const iw = vpw * scale;
            const ih = vph * scale;
            const maxX = Math.max(0, (iw - vpw) / scale);
            const maxY = Math.max(0, (ih - vph) / scale);
            translateX = Math.min(maxX, Math.max(-maxX, translateX));
            translateY = Math.min(maxY, Math.max(-maxY, translateY));
        }

        function getPointerPos(e) {
            if (e.touches) {
                return { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
            return { x: e.clientX, y: e.clientY };
        }

        // Mouse drag
        viewport.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            if (e.target.closest('.map-marker') || e.target.closest('.map-zoom-btn') || e.target.closest('.map-zoom-level')) return;
            isDragging = true;
            const pos = getPointerPos(e);
            startX = pos.x - translateX;
            startY = pos.y - translateY;
            viewport.style.cursor = 'grabbing';
            e.preventDefault();
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const pos = getPointerPos(e);
            translateX = pos.x - startX;
            translateY = pos.y - startY;
            clampPan();
            updateTransform();
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                viewport.style.cursor = 'grab';
            }
        });

        // Touch drag
        let lastTouchDist = 0;
        let isTouchZooming = false;

        viewport.addEventListener('touchstart', (e) => {
            if (e.target.closest('.map-marker')) return;
            if (e.touches.length === 1) {
                isDragging = true;
                const pos = getPointerPos(e);
                startX = pos.x - translateX;
                startY = pos.y - translateY;
            } else if (e.touches.length === 2) {
                isDragging = false;
                isTouchZooming = true;
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                lastTouchDist = Math.sqrt(dx * dx + dy * dy);
            }
        }, { passive: true });

        viewport.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && isDragging) {
                const pos = getPointerPos(e);
                translateX = pos.x - startX;
                translateY = pos.y - startY;
                clampPan();
                updateTransform();
            } else if (e.touches.length === 2 && isTouchZooming) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (lastTouchDist > 0) {
                    const pinchRatio = dist / lastTouchDist;
                    const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                    const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                    const vpRect = viewport.getBoundingClientRect();
                    applyZoom(scale * pinchRatio, cx - vpRect.left, cy - vpRect.top);
                }
                lastTouchDist = dist;
                e.preventDefault();
            }
        }, { passive: false });

        viewport.addEventListener('touchend', () => {
            isDragging = false;
            isTouchZooming = false;
        });

        // Mouse wheel zoom
        viewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            const vpRect = viewport.getBoundingClientRect();
            applyZoom(scale * delta, e.clientX - vpRect.left, e.clientY - vpRect.top);
        }, { passive: false });

        // Zoom controls
        document.querySelectorAll('.map-zoom-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.zoom;
                const vpRect = viewport.getBoundingClientRect();
                const cx = vpRect.width / 2;
                const cy = vpRect.height / 2;
                if (action === 'in') {
                    applyZoom(scale * 1.3, cx, cy);
                } else if (action === 'out') {
                    applyZoom(scale / 1.3, cx, cy);
                } else if (action === 'reset') {
                    inner.classList.add('no-transition');
                    scale = 1;
                    translateX = 0;
                    translateY = 0;
                    updateTransform();
                    requestAnimationFrame(() => {
                        inner.classList.remove('no-transition');
                    });
                }
            });
        });

        // Marker modal
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

        document.querySelectorAll('.map-marker').forEach(marker => {
            marker.addEventListener('click', (e) => {
                e.stopPropagation();
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

    function initScrollVideo() {
        const video = document.getElementById('bgVideo');
        if (!video) return;

        if (video.readyState >= 1) {
            initScrollVideoLogic(video);
        } else {
            video.addEventListener('loadedmetadata', () => initScrollVideoLogic(video));

            video.addEventListener('error', () => {
                initCanvasFallback();
            });

            setTimeout(() => {
                if (video.readyState < 1) {
                    initCanvasFallback();
                }
            }, 3000);
        }
    }

    function initScrollVideoLogic(video) {
        const duration = video.duration;
        if (!duration || !isFinite(duration)) {
            return;
        }

        video.loop = false;
        video.play().then(() => {
        }).catch(() => {
            document.addEventListener('click', () => {
                video.play();
            }, { once: true });
        });

        video.addEventListener('ended', () => {
        });
    }

    function initCanvasFallback() {
        const video = document.getElementById('bgVideo');
        if (!video) return;

        video.style.display = 'none';

        const canvas = document.createElement('canvas');
        canvas.id = 'bgCanvas';
        canvas.className = 'bg-video';
        canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;opacity:0.15;pointer-events:none;';
        document.body.insertBefore(canvas, document.body.firstChild);

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        let time = 0;

        function drawNoiseFrame() {
            const w = canvas.width;
            const h = canvas.height;

            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollProgress = scrollHeight > 0 ? Math.max(0, Math.min(1, window.scrollY / scrollHeight)) : 0;

            const imageData = ctx.createImageData(w, h);
            const data = imageData.data;

            const noiseIntensity = 30 + Math.sin(time * 0.5) * 10;

            for (let i = 0; i < data.length; i += 4) {
                const x = (i / 4) % w;
                const y = Math.floor((i / 4) / w);

                let noise = Math.random() * noiseIntensity;
                const wave = Math.sin(y * 0.01 + time + scrollProgress * 10) * 20;

                const val = Math.min(255, 20 + noise + wave);

                data[i] = val;
                data[i+1] = val;
                data[i+2] = val;
                data[i+3] = 255;
            }

            ctx.putImageData(imageData, 0, 0);

            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            for (let y = 0; y < h; y += 3) {
                ctx.fillRect(0, y, w, 1);
            }

            if (Math.random() < 0.02) {
                const lineY = Math.random() * h;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.fillRect(0, lineY, w, 2);
            }

            time += 0.016;
            requestAnimationFrame(drawNoiseFrame);
        }

        drawNoiseFrame();
    }

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
    } catch (err) {
        console.error('Initialization error:', err);
    }
});