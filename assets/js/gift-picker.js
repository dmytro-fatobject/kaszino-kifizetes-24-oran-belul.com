(function () {
  "use strict";

  const LOCALE = (document.documentElement.lang || "hu").slice(0, 2).toLowerCase();
  const STRINGS = {
    hu: {
      title: "Pörgesd meg, és fedezd fel a bónuszod",
      spinBtn: "PÖRGESD MEG A BÓNUSZT",
      spinBtnAria: "Pörgesd meg a bónuszt – nézd meg az ajánlatod",
      spinningBtn: "Pörgetés…",
      spinningAria: "Pörgetés folyamatban, kérjük várjon",
      resultBtn: "Nézd meg a bónuszod",
      resultAria: "Nézd meg a bónuszod – nyisd meg a bónusz ablakot",
      modalClose: "Bónusz ablak bezárása",
      modalBadge: "🎉 Gratulálunk!",
      modalTitle: "A bónuszod készen áll",
      ctaBtn: "Bónusz igénylése",
      newTabHint: "(új lapon nyílik meg)",
      timerLabel: "Ajánlat lejár: ",
      timerExpired: "Lejárt az idő",
      retryBtn: "Próbálj másik bónuszt",
      freeSpinsWord: "ingyenes pörgetés",
    },
    de: {
      title: "Dreh und entdecke deinen Bonus",
      spinBtn: "BONUS JETZT DREHEN",
      spinBtnAria: "Bonus jetzt drehen – sieh dir dein Angebot an",
      spinningBtn: "Dreht…",
      spinningAria: "Drehen läuft, bitte warten",
      resultBtn: "Bonus ansehen",
      resultAria: "Bonus ansehen – Bonusfenster öffnen",
      modalClose: "Bonusfenster schließen",
      modalBadge: "🎉 Glückwunsch!",
      modalTitle: "Dein Bonus ist bereit",
      ctaBtn: "Bonus anfordern",
      newTabHint: "(öffnet in neuem Tab)",
      timerLabel: "Angebot läuft ab: ",
      timerExpired: "Zeit abgelaufen",
      retryBtn: "Anderen Bonus versuchen",
      freeSpinsWord: "Freispiele",
    },
    en: {
      title: "Spin to reveal your bonus",
      spinBtn: "SPIN FOR YOUR BONUS",
      spinBtnAria: "Spin for your bonus – see your offer",
      spinningBtn: "Spinning…",
      spinningAria: "Spinning in progress, please wait",
      resultBtn: "View your bonus",
      resultAria: "View your bonus – open the bonus window",
      modalClose: "Close bonus window",
      modalBadge: "🎉 Congratulations!",
      modalTitle: "Your bonus is ready",
      ctaBtn: "Claim bonus",
      newTabHint: "(opens in a new tab)",
      timerLabel: "Offer expires: ",
      timerExpired: "Time's up",
      retryBtn: "Try another bonus",
      freeSpinsWord: "free spins",
    },
    cs: {
      title: "Zatočte a objevte svůj bonus",
      spinBtn: "ZATOČIT PRO BONUS",
      spinBtnAria: "Zatočit pro bonus – zobrazit vaši nabídku",
      spinningBtn: "Točí se…",
      spinningAria: "Probíhá točení, čekejte prosím",
      resultBtn: "Zobrazit bonus",
      resultAria: "Zobrazit bonus – otevřít okno s bonusem",
      modalClose: "Zavřít okno s bonusem",
      modalBadge: "🎉 Gratulujeme!",
      modalTitle: "Váš bonus je připraven",
      ctaBtn: "Získat bonus",
      newTabHint: "(otevře se v nové kartě)",
      timerLabel: "Nabídka vyprší za: ",
      timerExpired: "Čas vypršel",
      retryBtn: "Zkusit jiný bonus",
      freeSpinsWord: "zatočení zdarma",
    },
    ro: {
      title: "Învârte și descoperă bonusul tău",
      spinBtn: "ÎNVÂRTE PENTRU BONUS",
      spinBtnAria: "Învârte pentru bonus – vezi oferta ta",
      spinningBtn: "Se învârte…",
      spinningAria: "Învârtire în curs, te rugăm așteaptă",
      resultBtn: "Vezi bonusul tău",
      resultAria: "Vezi bonusul tău – deschide fereastra bonusului",
      modalClose: "Închide fereastra bonusului",
      modalBadge: "🎉 Felicitări!",
      modalTitle: "Bonusul tău este gata",
      ctaBtn: "Solicită bonusul",
      newTabHint: "(se deschide într-o filă nouă)",
      timerLabel: "Oferta expiră: ",
      timerExpired: "Timpul a expirat",
      retryBtn: "Încearcă alt bonus",
      freeSpinsWord: "rotiri gratuite",
    },
  };
  const T = STRINGS[LOCALE] || STRINGS.hu;

  const track = (name, detail) => {
    try {
      if (window.dataLayer && typeof window.dataLayer.push === "function") {
        window.dataLayer.push(Object.assign({ event: name }, detail));
      }
      document.dispatchEvent(new CustomEvent(name, { detail }));
    } catch (e) {
      /* tracking must never break the slot */
    }
  };

  const reduceMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  const ICON_TYPES = ["gift", "coin", "fruit"];
  const ICONS_PER_REEL = 14;
  const SPIN_LAPS = [7, 9, 11];
  const SPIN_DURATIONS = [650, 1000, 1400];
  const RESULT_DURATION_MS = 60000;

  const ensureIconDefs = () => {
    if (document.getElementById("bonus-slot-defs")) return;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.id = "bonus-slot-defs";
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    svg.innerHTML =
      '<linearGradient id="bslot-seven-grad" x1="15%" y1="0%" x2="85%" y2="100%">' +
      '<stop offset="0%" stop-color="#FDE68A"/>' +
      '<stop offset="35%" stop-color="#E8630C"/>' +
      '<stop offset="100%" stop-color="#8B4513"/>' +
      "</linearGradient>" +
      '<linearGradient id="bslot-fruit-grad" x1="10%" y1="0%" x2="90%" y2="100%">' +
      '<stop offset="0%" stop-color="#FFF176"/>' +
      '<stop offset="45%" stop-color="#FFC107"/>' +
      '<stop offset="100%" stop-color="#E8630C"/>' +
      "</linearGradient>" +
      '<symbol id="bslot-icon-gift" viewBox="0 0 24 24">' +
      '<ellipse cx="12" cy="20.2" rx="6.4" ry="1.3" fill="rgba(36,18,7,0.2)"/>' +
      '<rect x="4" y="2.3" width="16" height="4.6" rx="1.8" fill="url(#bslot-seven-grad)" stroke="#FFF3D0" stroke-width="1"/>' +
      '<path d="M18 6.9 11.3 21.7 6.7 21.3 12 6.9Z" fill="url(#bslot-seven-grad)" stroke="#FFF3D0" stroke-width="1" stroke-linejoin="round"/>' +
      '<ellipse cx="9" cy="4.3" rx="3.2" ry="1" fill="rgba(255,255,255,0.45)" transform="rotate(-8 9 4.3)"/>' +
      "</symbol>" +
      '<symbol id="bslot-icon-coin" viewBox="0 0 24 24">' +
      '<ellipse cx="12" cy="20.2" rx="6.4" ry="1.3" fill="rgba(36,18,7,0.2)"/>' +
      '<path d="M8.6 11.5c-.5-2.7.7-5.7 3.4-6.8" stroke="#2B6B34" stroke-width="0.8" fill="none" stroke-linecap="round"/>' +
      '<path d="M15.4 11.5c.5-2.7-.7-5.7-3.4-6.8" stroke="#2B6B34" stroke-width="0.8" fill="none" stroke-linecap="round"/>' +
      '<path d="M12 4.7c1.1-1.7 3.1-2.3 4.4-1.6-.6 1.7-2.5 2.4-4.1 2.1-.2 0-.4-.3-.3-.5z" fill="#5FA548"/>' +
      '<circle cx="8.4" cy="16.1" r="5" fill="#E8630C" stroke="#FFF3D0" stroke-width="1"/>' +
      '<circle cx="15.6" cy="16.1" r="5" fill="#F5934D" stroke="#FFF3D0" stroke-width="1"/>' +
      '<circle cx="6.7" cy="14.2" r="1.3" fill="rgba(255,255,255,0.55)"/>' +
      '<circle cx="13.9" cy="14.2" r="1.3" fill="rgba(255,255,255,0.55)"/>' +
      "</symbol>" +
      '<symbol id="bslot-icon-fruit" viewBox="0 0 24 24">' +
      '<ellipse cx="12" cy="20.2" rx="6.4" ry="1.3" fill="rgba(36,18,7,0.2)"/>' +
      '<g transform="rotate(22 12 12)">' +
      '<path d="M9.6 3.6 L12 0.6 L14.4 3.6 Q12 4.6 9.6 3.6 Z" fill="url(#bslot-fruit-grad)"/>' +
      '<ellipse cx="12" cy="12" rx="6.2" ry="9.3" fill="url(#bslot-fruit-grad)" stroke="#FFF3D0" stroke-width="1"/>' +
      '<path d="M9.6 20.4 L12 23.4 L14.4 20.4 Q12 19.4 9.6 20.4 Z" fill="url(#bslot-fruit-grad)"/>' +
      '<path d="M12 2.6c1-1.6 3-2.3 4.4-1.7-.5 1.8-2.4 2.7-4.1 2.4-.2 0-.3-.4-.2-.7z" fill="#5FA548"/>' +
      '<ellipse cx="9.3" cy="7.6" rx="1.6" ry="3" fill="rgba(255,255,255,0.5)" transform="rotate(-16 9.3 7.6)"/>' +
      "</g>" +
      "</symbol>";
    document.body.appendChild(svg);
  };

  const randomIcon = () => ICON_TYPES[Math.floor(Math.random() * ICON_TYPES.length)];

  const shuffledIcons = () => {
    const arr = ICON_TYPES.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  };

  const buildReelHTML = (winIndex, restType) => {
    let html = "";
    for (let i = 0; i < ICONS_PER_REEL; i++) {
      const type = i === winIndex ? "gift" : (i === 0 ? restType : randomIcon());
      html += '<span class="bonus-slot__symbol"><svg class="bonus-slot__symbol-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#bslot-icon-' + type + '"></use></svg></span>';
    }
    return html;
  };

  const formatTime = (ms) => {
    const total = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
  };

  const initBonusSlot = (root) => {
    const fallbackRow = root.querySelector("[data-gift-fallback]");
    if (!fallbackRow) return;

    const items = Array.from(fallbackRow.querySelectorAll(".hero-podium__item"));
    if (items.length < 2) return;

    const brands = items.map((item) => {
      const logoBg = item.querySelector(".hero-podium__logo-bg");
      const img = logoBg ? logoBg.querySelector("img") : null;
      const cta = item.querySelector("[data-cta-name]");
      return {
        name: (item.querySelector(".hero-podium__name") || {}).textContent || "",
        amount: (item.querySelector(".hero-podium__bonus-amount") || {}).textContent || "",
        spins: ((item.querySelector(".hero-podium__bonus-spins") || {}).textContent || "").replace(/\bFS\b/, T.freeSpinsWord),
        logoStyle: logoBg ? logoBg.getAttribute("style") || "" : "",
        logoSrc: img ? img.getAttribute("src") || "" : "",
        logoAlt: img ? img.getAttribute("alt") || "" : "",
        ctaName: cta ? cta.getAttribute("data-cta-name") || "" : "",
      };
    });

    ensureIconDefs();

    const isCasinoStyle = root.dataset.giftStyle === "casino";
    const uid = Math.random().toString(36).slice(2, 8);
    const titleId = "bonus-slot-modal-title-" + uid;

    const slot = document.createElement("div");
    slot.className = "bonus-slot" + (isCasinoStyle ? " bonus-slot--casino" : "");
    slot.dataset.state = "idle";
    slot.innerHTML =
      '<p class="bonus-slot__title">' + T.title + '</p>' +
      '<div class="bonus-slot__reels" aria-hidden="true">' +
      '<div class="bonus-slot__reel"><div class="bonus-slot__track"></div></div>' +
      '<div class="bonus-slot__reel"><div class="bonus-slot__track"></div></div>' +
      '<div class="bonus-slot__reel"><div class="bonus-slot__track"></div></div>' +
      "</div>" +
      '<button type="button" class="btn btn--gold bonus-slot__btn bonus-slot__btn--attract" aria-label="' + T.spinBtnAria + '">' + T.spinBtn + '</button>';

    const modalOverlay = document.createElement("div");
    modalOverlay.className = "bonus-slot-modal-overlay";
    modalOverlay.hidden = true;
    modalOverlay.innerHTML =
      '<div class="bonus-slot-modal' + (isCasinoStyle ? " bonus-slot-modal--casino" : "") + '" role="dialog" aria-modal="true" aria-labelledby="' + titleId + '" tabindex="-1">' +
      '<button type="button" class="bonus-slot-modal__close" aria-label="' + T.modalClose + '">&times;</button>' +
      '<p class="bonus-slot-modal__badge" aria-hidden="true">' + T.modalBadge + '</p>' +
      '<p class="bonus-slot-modal__title" id="' + titleId + '">' + T.modalTitle + '</p>' +
      '<div class="bonus-slot-modal__brand">' +
      '<span class="bonus-slot-modal__logo-bg"><img class="bonus-slot-modal__logo" src="" alt="" width="52" height="36" loading="lazy" decoding="async"></span>' +
      '<span class="bonus-slot-modal__name"></span>' +
      "</div>" +
      '<div class="bonus-slot-modal__card">' +
      '<p class="bonus-slot-modal__amount"></p>' +
      '<p class="bonus-slot-modal__spins"></p>' +
      "</div>" +
      '<button type="button" data-cta-name="" data-cta-section="hero-podium" class="btn btn--gold bonus-slot-modal__cta">' + T.ctaBtn + ' <span class="visually-hidden">' + T.newTabHint + '</span></button>' +
      '<p class="bonus-slot-modal__timer">' + T.timerLabel + '<strong>01:00</strong></p>' +
      '<button type="button" class="bonus-slot-modal__retry">' + T.retryBtn + '</button>' +
      "</div>";

    root.insertBefore(slot, fallbackRow);
    document.body.appendChild(modalOverlay);
    fallbackRow.hidden = true;
    root.classList.add("js-gift-active");

    const btn = slot.querySelector(".bonus-slot__btn");
    const tracks = Array.from(slot.querySelectorAll(".bonus-slot__track"));
    const reels = Array.from(slot.querySelectorAll(".bonus-slot__reel"));

    const modalEl = modalOverlay.querySelector(".bonus-slot-modal");
    const modalCloseBtn = modalOverlay.querySelector(".bonus-slot-modal__close");
    const logoBg = modalOverlay.querySelector(".bonus-slot-modal__logo-bg");
    const logoImg = modalOverlay.querySelector(".bonus-slot-modal__logo");
    const nameEl = modalOverlay.querySelector(".bonus-slot-modal__name");
    const amountEl = modalOverlay.querySelector(".bonus-slot-modal__amount");
    const spinsEl = modalOverlay.querySelector(".bonus-slot-modal__spins");
    const ctaBtn = modalOverlay.querySelector(".bonus-slot-modal__cta");
    const timerEl = modalOverlay.querySelector(".bonus-slot-modal__timer");
    const retryBtn = modalOverlay.querySelector(".bonus-slot-modal__retry");

    let timeEl = timerEl.querySelector("strong");
    let countdownTimer = null;
    let resizeTimer = null;
    let lastBrandIndex = null;
    let lastModalTrigger = null;
    let savedScrollY = 0;
    let cachedItemHeight = 0;

    const restTypes = shuffledIcons();
    tracks.forEach((trackEl, i) => {
      trackEl.innerHTML = buildReelHTML(SPIN_LAPS[i], restTypes[i]);
    });

    const pickBrandIndex = (excludeIndex) => {
      if (brands.length <= 1) return 0;
      let i;
      do { i = Math.floor(Math.random() * brands.length); } while (i === excludeIndex);
      return i;
    };

    const measureItemHeight = () => {
      const icon = tracks[0] && tracks[0].firstElementChild;
      cachedItemHeight = icon ? icon.getBoundingClientRect().height : 0;
    };

    const resetReels = () => {
      tracks.forEach((trackEl) => {
        trackEl.style.transition = "none";
        trackEl.style.transform = "translateY(0)";
      });
      void slot.offsetHeight;
    };

    const spinReels = (onDone) => {
      if (reduceMotion) { onDone(); return; }
      if (!cachedItemHeight) measureItemHeight();
      tracks.forEach((trackEl, i) => {
        const distance = cachedItemHeight * SPIN_LAPS[i];
        trackEl.style.transition = "transform " + SPIN_DURATIONS[i] + "ms cubic-bezier(0.22, 0.61, 0.36, 1)";
        trackEl.style.transform = "translateY(-" + distance + "px)";
      });
      window.setTimeout(onDone, SPIN_DURATIONS[SPIN_DURATIONS.length - 1] + 60);
    };

    const clearCountdown = () => {
      if (countdownTimer) { window.clearInterval(countdownTimer); countdownTimer = null; }
    };

    const setState = (state) => { slot.dataset.state = state; modalEl.dataset.state = state; };

    const setBtnLabel = (text, aria) => {
      btn.textContent = text;
      btn.setAttribute("aria-label", aria);
    };

    const setBtnBusy = (isBusy) => {
      if (isBusy) {
        btn.setAttribute("aria-disabled", "true");
        btn.setAttribute("aria-busy", "true");
      } else {
        btn.removeAttribute("aria-disabled");
        btn.removeAttribute("aria-busy");
      }
    };

    const stopAttract = () => btn.classList.remove("bonus-slot__btn--attract");

    const lockScroll = () => {
      savedScrollY = window.scrollY || window.pageYOffset || 0;
      document.body.style.position = "fixed";
      document.body.style.top = "-" + savedScrollY + "px";
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    };
    const unlockScroll = () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, savedScrollY);
    };

    const getFocusableModalElements = () => {
      const nodes = modalEl.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      return Array.prototype.filter.call(nodes, (el) => el.offsetParent !== null);
    };

    const focusInitialModalTarget = () => {
      const target = ctaBtn.getAttribute("aria-disabled") !== "true" ? ctaBtn : retryBtn;
      if (target && typeof target.focus === "function") target.focus({ preventScroll: true });
    };

    const openModal = (trigger) => {
      lastModalTrigger = trigger || document.activeElement;
      modalOverlay.hidden = false;
      lockScroll();
      focusInitialModalTarget();
    };

    const closeModal = (opts) => {
      if (modalOverlay.hidden) return;
      opts = opts || {};
      modalOverlay.hidden = true;
      unlockScroll();
      if (opts.returnFocus !== false && lastModalTrigger && document.body.contains(lastModalTrigger) && typeof lastModalTrigger.focus === "function") {
        lastModalTrigger.focus({ preventScroll: true });
      }
    };

    const setExpired = () => {
      clearCountdown();
      setState("expired");
      timerEl.innerHTML = T.timerExpired;
      ctaBtn.setAttribute("aria-disabled", "true");
      ctaBtn.setAttribute("tabindex", "-1");
    };

    const startCountdown = (endsAt) => {
      clearCountdown();
      timerEl.innerHTML = T.timerLabel + '<strong></strong>';
      timeEl = timerEl.querySelector("strong");
      const tick = () => {
        const remaining = endsAt - Date.now();
        if (remaining <= 0) { setExpired(); return; }
        timeEl.textContent = formatTime(remaining);
      };
      tick();
      countdownTimer = window.setInterval(tick, 1000);
    };

    const showResult = (index, isRetry) => {
      const brand = brands[index];
      lastBrandIndex = index;

      logoBg.setAttribute("style", brand.logoStyle);
      logoImg.setAttribute("src", brand.logoSrc);
      logoImg.setAttribute("alt", brand.logoAlt);
      nameEl.textContent = brand.name;
      amountEl.textContent = brand.amount;
      spinsEl.textContent = brand.spins;
      amountEl.classList.add("is-glowing");

      ctaBtn.dataset.ctaName = brand.ctaName;
      ctaBtn.removeAttribute("aria-disabled");
      ctaBtn.removeAttribute("tabindex");
      ctaBtn.classList.add("is-pulsing");

      setBtnBusy(false);
      setBtnLabel(T.resultBtn, T.resultAria);

      setState("result");
      startCountdown(Date.now() + RESULT_DURATION_MS);

      track("hero_bonus_reveal", { index: index, brand: brand.ctaName });
    };

    const runSpin = () => {
      if (slot.dataset.state === "spinning") return;

      stopAttract();
      clearCountdown();

      const index = pickBrandIndex(lastBrandIndex);
      track("hero_gift_click", { index: index, brand: brands[index].ctaName });

      setState("spinning");
      slot.classList.add("is-spinning");
      setBtnLabel(T.spinningBtn, T.spinningAria);
      setBtnBusy(true);

      resetReels();
      spinReels(() => {
        slot.classList.remove("is-spinning");
        showResult(index, false);
        openModal(btn);
      });
    };

    const onBtnClick = () => {
      const state = slot.dataset.state;
      if (state === "spinning") return;
      if (state === "result" || state === "expired") { openModal(btn); return; }
      runSpin();
    };

    const onRetryClick = () => {
      closeModal({ returnFocus: false });
      btn.focus({ preventScroll: true });
      runSpin();
    };

    const onCtaClick = () => {
      if (ctaBtn.getAttribute("aria-disabled") === "true") return;
      track("hero_claim_bonus_click", { brand: ctaBtn.dataset.ctaName });
    };

    const onDocumentKeydown = (e) => {
      if (modalOverlay.hidden) return;
      if (e.key === "Escape" || e.key === "Esc") { e.preventDefault(); closeModal(); return; }
      if (e.key === "Tab") {
        const focusables = getFocusableModalElements();
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    const onOverlayClick = (e) => { if (e.target === modalOverlay) closeModal(); };

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measureItemHeight, 200);
    };

    btn.addEventListener("click", onBtnClick);
    retryBtn.addEventListener("click", onRetryClick);
    ctaBtn.addEventListener("click", onCtaClick);
    modalCloseBtn.addEventListener("click", () => closeModal());
    modalOverlay.addEventListener("click", onOverlayClick);
    document.addEventListener("keydown", onDocumentKeydown);
    window.addEventListener("resize", onResize, { passive: true });

    const ATTRACT_STOP_EVENTS = ["pointerdown", "keydown", "touchstart", "wheel"];
    ATTRACT_STOP_EVENTS.forEach((type) => {
      window.addEventListener(type, stopAttract, { once: true, passive: true });
    });

    brands.forEach((brand, i) => track("hero_gift_view", { index: i, brand: brand.ctaName }));

    if (reduceMotion) reels.forEach((reel) => reel.style.transition = "none");
  };

  document.querySelectorAll("[data-gift-picker]").forEach(initBonusSlot);
})();
