/**
 * AS FITNESS — SCROLL WORLD ENGINE
 * -----------------------------------------------------------------------------
 * High-performance scroll-scrubbed camera engine inspired by the scroll-world skill.
 * Features:
 * - Desktop: In-memory Blob playback (100% seekable, avoids HTTP range request freeze)
 * - Desktop: RequestAnimationFrame lerped smoothing & decoder seek-coalescing
 * - Desktop: Synchronized narrative HUD cards and waypoint navigation
 * - Mobile: Smooth ambient background loop & natural document scroll (no black screens or dead swipes)
 */

(function () {
  'use strict';

  const VIDEO_URL = '/99c5ccbc-2608-4a26-8474-3e1148f199d5.mp4';
  const worldSection = document.getElementById('world');
  const worldStage = document.getElementById('worldStage');
  const worldTrack = document.getElementById('worldScrollTrack');
  const video = document.getElementById('worldVideo');
  const poster = document.getElementById('videoPoster');
  const scrubFill = document.getElementById('scrubProgressFill');
  const hudPercentage = document.getElementById('hudPercentage');
  const routeWaypoints = document.querySelectorAll('.route-waypoint');
  const hudCards = [
    document.getElementById('hudCard0'),
    document.getElementById('hudCard1'),
    document.getElementById('hudCard2'),
    document.getElementById('hudCard3')
  ];

  if (!worldSection || !video) return;

  // Preferences & Device Detection
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  const isMobile = () => isTouchDevice || window.innerWidth <= 768;

  // State
  let videoReady = false;
  let videoDuration = 10.0;
  let targetProgress = 0;
  let currentProgress = 0;
  let activeBeatIndex = 0;
  let isTicking = false;
  let userGesturePrimed = false;

  // Beat Thresholds: [start, end, midpoint]
  const BEATS = [
    { start: 0.00, end: 0.22, mid: 0.08 },
    { start: 0.23, end: 0.52, mid: 0.36 },
    { start: 0.53, end: 0.80, mid: 0.66 },
    { start: 0.81, end: 1.00, mid: 0.92 }
  ];

  const clamp = (val, min = 0, max = 1) => Math.min(max, Math.max(min, val));

  /**
   * MOBILE VIDEO PLAYER
   * On mobile, play smooth ambient background loop — avoiding jerky touch seeks
   * and black video decoder frame freeze.
   */
  function initMobileVideo() {
    if (!video) return;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('loop', '');
    video.src = VIDEO_URL;

    function playMobile() {
      const p = video.play();
      if (p !== undefined) {
        p.then(() => {
          if (worldStage) worldStage.classList.add('video-active');
        }).catch(() => {});
      }
    }

    video.addEventListener('canplay', playMobile, { once: true });
    video.addEventListener('loadeddata', playMobile, { once: true });
    window.addEventListener('touchstart', playMobile, { once: true, passive: true });
    window.addEventListener('scroll', playMobile, { once: true, passive: true });
    playMobile();
  }

  /**
   * 1. LOAD VIDEO AS IN-MEMORY BLOB (DESKTOP)
   * Avoids frozen frame 0 issue on static servers that lack HTTP range headers
   */
  function initBlobVideo() {
    if (prefersReducedMotion) return;

    fetch(VIDEO_URL)
      .then(res => {
        if (!res.ok) throw new Error('Video network response was not ok');
        return res.blob();
      })
      .then(blob => {
        const objectUrl = URL.createObjectURL(blob);
        video.src = objectUrl;

        video.addEventListener('loadedmetadata', () => {
          videoDuration = video.duration || 10.0;
          videoReady = true;
          onScrollUpdate();
        });

        // Hide still poster only after real video frame paints
        video.addEventListener('seeked', () => {
          if (worldStage) worldStage.classList.add('video-active');
        }, { once: true });

        // Touch priming callback
        video.addEventListener('loadeddata', () => {
          try { video.pause(); } catch (e) {}
          if (userGesturePrimed) primeVideo(video);
        });
      })
      .catch(err => {
        console.warn('Video blob load fallback to direct URL:', err);
        video.src = VIDEO_URL;
        video.addEventListener('loadedmetadata', () => {
          videoDuration = video.duration || 10.0;
          videoReady = true;
          if (worldStage) worldStage.classList.add('video-active');
        });
      });
  }

  function primeVideo(v) {
    if (!v) return;
    try {
      const p = v.play();
      if (p && p.then) {
        p.then(() => {
          try { v.pause(); } catch (e) {}
        }).catch(() => {});
      }
    } catch (e) {}
  }

  function handleFirstUserGesture() {
    if (userGesturePrimed) return;
    userGesturePrimed = true;
    if (video) primeVideo(video);
  }

  window.addEventListener('touchstart', handleFirstUserGesture, { once: true, passive: true });
  window.addEventListener('pointerdown', handleFirstUserGesture, { once: true, passive: true });

  /**
   * 3. SCROLL METRICS & PROGRESS CALCULATION (DESKTOP)
   */
  function onScrollUpdate() {
    if (isMobile() || !worldTrack) return;

    const scrollY = window.scrollY || window.pageYOffset;
    const trackRect = worldTrack.getBoundingClientRect();
    const trackTop = trackRect.top + scrollY;
    const trackHeight = worldTrack.offsetHeight - window.innerHeight;

    if (trackHeight <= 0) return;

    const raw = (scrollY - trackTop) / trackHeight;
    targetProgress = clamp(raw, 0, 1);

    // Update Top Progress Bar
    if (scrubFill) {
      scrubFill.style.width = (targetProgress * 100).toFixed(1) + '%';
    }

    // Update Telemetry Percentage
    if (hudPercentage) {
      const pct = Math.round(targetProgress * 100);
      hudPercentage.textContent = (pct < 10 ? '0' + pct : pct) + '%';
    }

    // Determine Active Beat
    let currentBeat = 0;
    for (let i = 0; i < BEATS.length; i++) {
      if (targetProgress >= BEATS[i].start && targetProgress <= BEATS[i].end) {
        currentBeat = i;
        break;
      }
    }

    if (currentBeat !== activeBeatIndex) {
      activeBeatIndex = currentBeat;
      updateActiveBeatUI(currentBeat);
    }

    isTicking = false;
  }

  function updateActiveBeatUI(index) {
    // Update HUD Cards
    hudCards.forEach((card, idx) => {
      if (!card) return;
      card.classList.toggle('is-active', idx === index);
    });

    // Update Waypoints
    routeWaypoints.forEach((wp, idx) => {
      wp.classList.toggle('is-active', idx === index);
    });
  }

  /**
   * 4. SMOOTH RAF VIDEO SCRUBBER LOOP (DESKTOP)
   */
  function scrubLoop() {
    if (!isMobile() && videoReady && video && !prefersReducedMotion) {
      if (!video.seeking) {
        const lerpFactor = 0.16;
        currentProgress += (targetProgress - currentProgress) * lerpFactor;

        const targetTime = clamp(currentProgress * videoDuration, 0, videoDuration - 0.05);
        const threshold = 0.012;

        if (Math.abs(video.currentTime - targetTime) > threshold) {
          try {
            video.currentTime = targetTime;
          } catch (e) {}
        }
      }
    }

    requestAnimationFrame(scrubLoop);
  }

  /**
   * 5. WAYPOINT JUMP NAVIGATION (DESKTOP)
   */
  function setupWaypointNavigation() {
    routeWaypoints.forEach(wp => {
      wp.addEventListener('click', () => {
        const index = parseInt(wp.getAttribute('data-index'), 10);
        if (isNaN(index) || !BEATS[index] || !worldTrack) return;

        const beatMid = BEATS[index].mid;
        const scrollY = window.scrollY || window.pageYOffset;
        const trackRect = worldTrack.getBoundingClientRect();
        const trackTop = trackRect.top + scrollY;
        const trackHeight = worldTrack.offsetHeight - window.innerHeight;

        const destScroll = trackTop + beatMid * trackHeight;

        window.scrollTo({
          top: destScroll,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
      });
    });
  }

  // Event Listeners
  window.addEventListener('scroll', () => {
    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(onScrollUpdate);
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (isMobile()) {
      if (video && !video.loop) {
        video.loop = true;
        video.play().catch(() => {});
      }
    } else {
      onScrollUpdate();
    }
  }, { passive: true });

  // Init
  if (isMobile()) {
    initMobileVideo();
  } else {
    initBlobVideo();
    setupWaypointNavigation();
    onScrollUpdate();
    requestAnimationFrame(scrubLoop);
  }

})();
