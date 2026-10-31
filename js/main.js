/**
 * POWER FITNESS GYM — MAIN APPLICATION SCRIPT
 * -----------------------------------------------------------------------------
 * Interactivity, calculations, modal management, metric animations,
 * and ambient Web Audio synthesizer.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================================
     1. CUSTOM CURSOR
     ========================================================================== */
  const cursor = document.getElementById('customCursor');
  if (cursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const dot = cursor.querySelector('.cursor-dot');
    const ring = cursor.querySelector('.cursor-ring');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.classList.add('is-active');
      if (dot) dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-active');
    });

    function renderCursor() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      if (ring) ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Hover expansions on interactive targets
    const interactives = document.querySelectorAll('a, button, input, select, .feature-card, .video-play-badge');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (ring) {
          ring.style.width = '48px';
          ring.style.height = '48px';
          ring.style.borderColor = 'var(--accent-red)';
          ring.style.backgroundColor = 'rgba(255, 42, 63, 0.08)';
        }
      });
      el.addEventListener('mouseleave', () => {
        if (ring) {
          ring.style.width = '32px';
          ring.style.height = '32px';
          ring.style.borderColor = 'rgba(255, 42, 63, 0.4)';
          ring.style.backgroundColor = 'transparent';
        }
      });
    });
  }

  /* ==========================================================================
     2. HEADER SCROLL STATE & ACTIVE NAV SYNC
     ========================================================================== */
  const header = document.getElementById('siteHeader');
  const sections = document.querySelectorAll('main > section[id]');
  const navLinks = document.querySelectorAll('.desktop-nav .nav-link');

  function updateHeader() {
    const scrollY = window.scrollY || window.pageYOffset;
    if (header) {
      header.classList.toggle('is-scrolled', scrollY > 50);
    }

    // Active Section Spy
    let currentId = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 180;
      const height = sec.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    if (currentId) {
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', href === `#${currentId}`);
      });
    }
  }
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  /* ==========================================================================
     LIVE GYM OPERATING STATUS (Mon-Sat: 6 AM - 12 AM, Sun: Closed)
     ========================================================================== */
  function updateGymLiveStatus() {
    const statusPill = document.querySelector('.live-status-pill');
    if (!statusPill) return;

    const indicator = statusPill.querySelector('.status-indicator');
    const textEl = statusPill.querySelector('.status-text');
    if (!indicator || !textEl) return;

    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    // Indian Standard Time (UTC+5:30)
    const istTime = new Date(utc + (3600000 * 5.5));
    const day = istTime.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
    const hour = istTime.getHours();

    if (day === 0) {
      indicator.classList.add('is-closed');
      textEl.innerHTML = 'CLOSED TODAY <span class="dim">· OPENS MON 6 AM</span>';
    } else if (hour >= 6 && hour < 24) {
      indicator.classList.remove('is-closed');
      textEl.innerHTML = 'OPEN NOW <span class="dim">· 6 AM - 12 AM</span>';
    } else {
      indicator.classList.add('is-closed');
      textEl.innerHTML = 'OPENS AT 6:00 AM <span class="dim">· MON - SAT</span>';
    }
  }
  updateGymLiveStatus();
  setInterval(updateGymLiveStatus, 60000);

  /* ==========================================================================
     3. MOBILE DRAWER NAVIGATION
     ========================================================================== */
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerClose = document.getElementById('drawerClose');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  function openDrawer() {
    if (mobileDrawer) {
      mobileDrawer.classList.add('is-open');
      mobileDrawer.setAttribute('aria-hidden', 'false');
      if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDrawer() {
    if (mobileDrawer) {
      mobileDrawer.classList.remove('is-open');
      mobileDrawer.setAttribute('aria-hidden', 'true');
      if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);
  drawerLinks.forEach(link => link.addEventListener('click', closeDrawer));

  /* ==========================================================================
     4. AMBIENT ATMOSPHERE SYNTHESIZER (Web Audio API)
     ========================================================================== */
  const soundToggle = document.getElementById('soundToggle');
  const soundOffIcon = soundToggle ? soundToggle.querySelector('.sound-off-icon') : null;
  const soundOnIcon = soundToggle ? soundToggle.querySelector('.sound-on-icon') : null;
  let audioCtx = null;
  let masterGain = null;
  let isSoundPlaying = false;

  function initAmbientSynth() {
    if (audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);

    // Deep sub-bass warmth (55 Hz - A1)
    const osc1 = audioCtx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(55, audioCtx.currentTime);

    // Warm sub overtone (110 Hz - A2)
    const osc2 = audioCtx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(110, audioCtx.currentTime);

    // Low pass filter to keep it deep & non-intrusive
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(160, audioCtx.currentTime);

    // Subtle LFO pulse (0.2 Hz) for organic breath
    const lfo = audioCtx.createOscillator();
    lfo.frequency.setValueAtTime(0.2, audioCtx.currentTime);
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    lfo.connect(lfoGain.gain);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(lfoGain);
    lfoGain.connect(masterGain);

    osc1.start();
    osc2.start();
    lfo.start();
  }

  function toggleSound() {
    if (!audioCtx) initAmbientSynth();
    if (!audioCtx || !masterGain) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (!isSoundPlaying) {
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 1.2);
      isSoundPlaying = true;
      if (soundToggle) soundToggle.classList.add('is-active');
      if (soundOffIcon) soundOffIcon.style.display = 'none';
      if (soundOnIcon) soundOnIcon.style.display = 'block';
    } else {
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.6);
      isSoundPlaying = false;
      if (soundToggle) soundToggle.classList.remove('is-active');
      if (soundOffIcon) soundOffIcon.style.display = 'block';
      if (soundOnIcon) soundOnIcon.style.display = 'none';
    }
  }

  if (soundToggle) {
    soundToggle.addEventListener('click', toggleSound);
  }

  /* ==========================================================================
     5. VERIFIED METRICS COUNT-UP ANIMATION
     ========================================================================== */
  const counters = document.querySelectorAll('.counter');
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    counters.forEach(counter => {
      const rawTarget = counter.getAttribute('data-target');
      const isFloat = rawTarget && rawTarget.includes('.');
      const target = isFloat ? parseFloat(rawTarget) : parseInt(rawTarget, 10);
      if (isNaN(target)) return;

      const duration = 2000;
      const startTime = performance.now();

      function updateNumber(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out expo
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = isFloat ? (ease * target).toFixed(1) : Math.floor(ease * target).toLocaleString('en-US');

        counter.textContent = current;

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          counter.textContent = isFloat ? target.toFixed(1) : target.toLocaleString('en-US');
        }
      }

      requestAnimationFrame(updateNumber);
    });
  }

  const metricsSection = document.getElementById('stats');
  if (metricsSection) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    observer.observe(metricsSection);
  }

  /* ==========================================================================
     6. FACILITY ZONE TABS
     ========================================================================== */
  const zoneTabs = document.querySelectorAll('.zone-tab-btn');
  const zonePanels = document.querySelectorAll('.zone-panel');

  zoneTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const zoneId = tab.getAttribute('data-zone');

      zoneTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      zonePanels.forEach(panel => {
        panel.classList.toggle('active', panel.id === `zone-${zoneId}`);
      });
    });
  });

  /* ==========================================================================
     7. BIOMETRIC ENERGY & SPLIT CALCULATOR
     ========================================================================== */
  const calcForm = document.getElementById('biometricForm');
  const calcGender = document.getElementById('calcGender');
  const calcAge = document.getElementById('calcAge');
  const calcWeight = document.getElementById('calcWeight');
  const calcHeight = document.getElementById('calcHeight');
  const calcActivity = document.getElementById('calcActivity');
  const goalPills = document.querySelectorAll('.goal-pill');

  const resCalories = document.getElementById('resCalories');
  const resSplitDesc = document.getElementById('resSplitDesc');
  const resProtein = document.getElementById('resProtein');
  const resCarbs = document.getElementById('resCarbs');
  const resFats = document.getElementById('resFats');
  const resProtocol = document.getElementById('resProtocol');

  function recalculateBiometrics() {
    if (!calcWeight || !calcHeight || !calcAge) return;

    const gender = calcGender ? calcGender.value : 'male';
    const age = parseFloat(calcAge.value) || 28;
    const weight = parseFloat(calcWeight.value) || 80;
    const height = parseFloat(calcHeight.value) || 180;
    const activity = parseFloat(calcActivity ? calcActivity.value : 1.55) || 1.55;

    let selectedGoal = 'maintain';
    goalPills.forEach(pill => {
      const radio = pill.querySelector('input');
      if (radio && radio.checked) selectedGoal = radio.value;
    });

    // Mifflin-St Jeor Equation for BMR
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr += (gender === 'male') ? 5 : -161;

    let tdee = Math.round(bmr * activity);
    let targetCalories = tdee;
    let desc = '';
    let protocol = '';

    if (selectedGoal === 'cut') {
      targetCalories = Math.round(tdee - 500);
      desc = 'Caloric deficit (-500 kcal) calibrated for rapid adipose loss while sparing lean myofibrillar muscle.';
      protocol = '<strong>High-Intensity Strength Split (4 Days)</strong> with 20 min post-session incline treadmill walk and Zone 04 contrast recovery.';
    } else if (selectedGoal === 'bulk') {
      targetCalories = Math.round(tdee + 350);
      desc = 'Controlled hypercaloric surplus (+350 kcal) to fuel maximal muscular hypertrophy without excess fat spillover.';
      protocol = '<strong>5-Day Push / Pull / Legs Hypertrophy Cadence</strong> prioritizing heavy Zone 01 dumbbell rows and calibrated barbell squats.';
    } else {
      desc = 'Energy parity maintenance intake for steady body recomposition, muscular density, and neurological strength adaptation.';
      protocol = '<strong>4-Day Upper / Lower Strength Hypertrophy Split</strong> with Zone 02 cable isolation and 2x weekly recovery sauna immersion.';
    }

    // Macro Calculation
    // Protein: 2.2g per kg bodyweight
    const proteinGrams = Math.round(weight * 2.2);
    const proteinCals = proteinGrams * 4;

    // Fats: 25% of total intake
    const fatCals = Math.round(targetCalories * 0.25);
    const fatGrams = Math.round(fatCals / 9);

    // Carbs: Remaining calories
    const carbCals = Math.max(0, targetCalories - proteinCals - fatCals);
    const carbGrams = Math.round(carbCals / 4);

    if (resCalories) resCalories.textContent = targetCalories.toLocaleString('en-US');
    if (resSplitDesc) resSplitDesc.textContent = desc;
    if (resProtein) resProtein.textContent = `${proteinGrams}g`;
    if (resCarbs) resCarbs.textContent = `${carbGrams}g`;
    if (resFats) resFats.textContent = `${fatGrams}g`;
    if (resProtocol) resProtocol.innerHTML = protocol;
  }

  // Bind calculator inputs
  if (calcForm) {
    calcForm.addEventListener('input', recalculateBiometrics);
  }
  goalPills.forEach(pill => {
    pill.addEventListener('click', () => {
      goalPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const radio = pill.querySelector('input');
      if (radio) radio.checked = true;
      recalculateBiometrics();
    });
  });
  recalculateBiometrics();

  /* ==========================================================================
     8. MEMBERSHIP BILLING SWITCHER (Monthly vs Annual)
     ========================================================================== */
  const billMonthlyBtn = document.getElementById('billMonthlyBtn');
  const billAnnualBtn = document.getElementById('billAnnualBtn');
  const priceIron = document.getElementById('priceIron');
  const periodIron = document.getElementById('periodIron');
  const priceTitan = document.getElementById('priceTitan');
  const periodTitan = document.getElementById('periodTitan');

  function setBillingPeriod(annual) {
    if (annual) {
      if (billAnnualBtn) billAnnualBtn.classList.add('active');
      if (billMonthlyBtn) billMonthlyBtn.classList.remove('active');
      if (priceIron) priceIron.textContent = '1,199';
      if (periodIron) periodIron.textContent = '/ mo (billed ₹14,388/yr)';
      if (priceTitan) priceTitan.textContent = '2,399';
      if (periodTitan) periodTitan.textContent = '/ mo (billed ₹28,788/yr)';
    } else {
      if (billMonthlyBtn) billMonthlyBtn.classList.add('active');
      if (billAnnualBtn) billAnnualBtn.classList.remove('active');
      if (priceIron) priceIron.textContent = '1,499';
      if (periodIron) periodIron.textContent = '/ month';
      if (priceTitan) priceTitan.textContent = '2,999';
      if (periodTitan) periodTitan.textContent = '/ month';
    }
  }

  if (billMonthlyBtn) billMonthlyBtn.addEventListener('click', () => setBillingPeriod(false));
  if (billAnnualBtn) billAnnualBtn.addEventListener('click', () => setBillingPeriod(true));

  /* ==========================================================================
     9. VIP PASS GENERATOR & CONFIRMATION MODAL
     ========================================================================== */
  const vipPassForm = document.getElementById('vipPassForm');
  const passModal = document.getElementById('passModal');
  const modalClose = document.getElementById('modalClose');
  const modalDoneBtn = document.getElementById('modalDoneBtn');
  const modalAthleteName = document.getElementById('modalAthleteName');
  const modalPassCode = document.getElementById('modalPassCode');

  if (vipPassForm) {
    vipPassForm.addEventListener('submit', e => {
      e.preventDefault();
      const nameInput = document.getElementById('vipName');
      const athleteName = nameInput ? nameInput.value.trim().toUpperCase() : 'ATHLETE';

      // Generate random VIP serial number
      const randomSerial = Math.floor(1000 + Math.random() * 9000);
      const code = `PFG-2026-${randomSerial}-VIP`;

      if (modalAthleteName) modalAthleteName.textContent = athleteName || 'REGISTERED ATHLETE';
      if (modalPassCode) modalPassCode.textContent = code;

      if (passModal) {
        passModal.classList.add('is-active');
        passModal.setAttribute('aria-hidden', 'false');
      }
    });
  }

  function closePassModal() {
    if (passModal) {
      passModal.classList.remove('is-active');
      passModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (modalClose) modalClose.addEventListener('click', closePassModal);
  if (modalDoneBtn) modalDoneBtn.addEventListener('click', closePassModal);

  /* ==========================================================================
     10. VIDEO TOUR MODAL
     ========================================================================== */
  const storyVideoBtn = document.getElementById('storyVideoBtn');
  const videoModal = document.getElementById('videoModal');
  const videoModalClose = document.getElementById('videoModalClose');
  const tourVideo = document.getElementById('tourVideo');

  if (storyVideoBtn && videoModal && tourVideo) {
    storyVideoBtn.addEventListener('click', () => {
      tourVideo.src = '99c5ccbc-2608-4a26-8474-3e1148f199d5.mp4';
      videoModal.classList.add('is-active');
      videoModal.setAttribute('aria-hidden', 'false');
      tourVideo.play().catch(() => {});
    });
  }

  function closeVideoModal() {
    if (videoModal && tourVideo) {
      videoModal.classList.remove('is-active');
      videoModal.setAttribute('aria-hidden', 'true');
      tourVideo.pause();
    }
  }

  if (videoModalClose) videoModalClose.addEventListener('click', closeVideoModal);

  // Close modals on ESC key or clicking backdrop
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closePassModal();
      closeVideoModal();
      closeDrawer();
    }
  });

  [passModal, videoModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', e => {
        if (e.target === modal) {
          closePassModal();
          closeVideoModal();
        }
      });
    }
  });

  // Coach booking quick fill
  const bookCoachBtns = document.querySelectorAll('.book-coach-btn');
  bookCoachBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const coachName = btn.getAttribute('data-coach');
      const interestSelect = document.getElementById('vipInterest');
      if (interestSelect) interestSelect.value = 'coaching';
      const vipSection = document.getElementById('vip-pass');
      if (vipSection) {
        vipSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

});
