(function () {
  "use strict";

  const LOCALE = (document.documentElement.lang || "hu").slice(0, 2).toLowerCase();
  const TOGGLE_LABELS = {
    hu: { more: "Több mutatása", less: "Kevesebb mutatása", readMore: "Bővebben", readLess: "Kevesebb" },
    de: { more: "Mehr anzeigen", less: "Weniger anzeigen", readMore: "Mehr erfahren", readLess: "Weniger anzeigen" },
    en: { more: "Show more", less: "Show less", readMore: "Read more", readLess: "Show less" },
    ro: { more: "Arată mai mult", less: "Arată mai puțin", readMore: "Detalii", readLess: "Mai puțin" },
    cs: { more: "Zobrazit více", less: "Zobrazit méně", readMore: "Více informací", readLess: "Méně" },
  };
  const A11Y_LABELS = {
    hu: { dot: (n) => "Mutasd a(z) " + n + ". játékot", close: "Előnézet bezárása", prev: "Előző képernyőkép", next: "Következő képernyőkép" },
    de: { dot: (n) => "Spiel " + n + " anzeigen", close: "Vorschau schließen", prev: "Vorheriger Screenshot", next: "Nächster Screenshot" },
    en: { dot: (n) => "Show game " + n, close: "Close preview", prev: "Previous screenshot", next: "Next screenshot" },
    ro: { dot: (n) => "Arată jocul " + n, close: "Închide previzualizarea", prev: "Captura de ecran anterioară", next: "Captura de ecran următoare" },
    cs: { dot: (n) => "Zobrazit hru " + n, close: "Zavřít náhled", prev: "Předchozí snímek obrazovky", next: "Další snímek obrazovky" },
  };
  const A = A11Y_LABELS[LOCALE] || A11Y_LABELS.hu;
  const T = TOGGLE_LABELS[LOCALE] || TOGGLE_LABELS.hu;

  const header = document.querySelector(".site-header");
  if (header) {
    const logoImg = header.querySelector(".site-header__logo img");
    const overHero = !!document.querySelector(".hero");
    const onScroll = () => {
      const scrolled = window.scrollY > 2;
      header.classList.toggle("is-scrolled", scrolled);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  const mobOffer = document.getElementById("mob-offer");
  if (mobOffer) {
    const closeBtn = document.getElementById("mob-offer-close");
    let dismissed = false;
    const toggleOffer = () => {
      if (dismissed) return;
      mobOffer.classList.toggle("is-visible", window.scrollY > 320);
    };
    toggleOffer();
    window.addEventListener("scroll", toggleOffer, { passive: true });
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        dismissed = true;
        mobOffer.classList.remove("is-visible");
      });
    }
  }

  const gamesTrack = document.querySelector("[data-games-track]");
  const gamesDots = document.querySelector("[data-games-dots]");
  if (gamesTrack && gamesDots) {
    const cards = Array.from(gamesTrack.children);
    const scrollToCard = (card, behavior) => {
      const trackRect = gamesTrack.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const cardLeft = gamesTrack.scrollLeft + (cardRect.left - trackRect.left);
      const target = cardLeft - (gamesTrack.clientWidth - cardRect.width) / 2;
      gamesTrack.scrollTo({ left: target, behavior });
    };
    const dots = cards.map((card, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "games-carousel__dot";
      dot.setAttribute("aria-label", A.dot(i + 1));
      dot.addEventListener("click", () => scrollToCard(card, "smooth"));
      gamesDots.appendChild(dot);
      return dot;
    });

    const setActiveCard = (index) => {
      cards.forEach((card, i) => card.classList.toggle("is-active", i === index));
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    };
    setActiveCard(0);

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries.reduce((best, entry) => {
          return !best || entry.intersectionRatio > best.intersectionRatio ? entry : best;
        }, null);
        if (mostVisible && mostVisible.isIntersecting) {
          setActiveCard(cards.indexOf(mostVisible.target));
        }
      },
      { root: gamesTrack, threshold: 0.6 }
    );
    window.setTimeout(() => {
      cards.forEach((card) => observer.observe(card));
    }, 300);
  }

  const winsList = document.querySelector("[data-hero-wins-list]");
  if (winsList) {
    const WINS_CONFIG = {
      periodMs: 60 * 60 * 1000, // only records newer than this are shown
      smallMax: 1000, // "small" win: amount <= smallMax
      largeMin: 100000, // "large" win: amount >= largeMin
      refreshMin: 2000, // ms between swaps (random within min..max)
      refreshMax: 2000,
      noRepeatGames: 4, // a game is not shown again within this many swaps
      fadeMs: 200, // must match the .is-leaving transition in style.css
    };

    // A win record, as the data source must provide it:
    // { id, time (ms timestamp), player (masked), game, img (file name in
    //   /assets/games/thumbs/, no extension), amount (exact number), currency,
    //   ctaName (CTA link key) }
    //
    // DEMO SOURCE: there is no real wins feed in the project yet, so these
    // records are generated in the browser. Replace demoFeed() with the real
    // source; everything below only relies on the record shape above.
    //
    // Game -> CTA pairs mirror the popular games block, so each tile links to
    // the same casino as that game's card further down the page. The pairing
    // differs per language page, so it is read from the cards (matched by the
    // image file name); the CTA below is only the fallback.
    const GAMES = [
      ["Gates of Olympus", "Gates-of-Olymps", "slotoro"],
      ["Sizzling Hot Deluxe", "Sizzling-Hot", "glorion"],
      ["Ultra Hot", "ultra-hot-deluxe", "rollingslots"],
      ["Bonanza Megaways", "Bonanza-Megaways", "hitnspin"],
      ["Book of Ra Deluxe", "Book-of-Ra", "alawin"],
      ["Starburst", "starburst", "bigclash"],
      ["Big Bass Bonanza", "Big-Bass-Bonanza", "stonevegas"],
      ["Book of Dead", "Book-of-Dead", "casoola"],
      ["Sweet Bonanza", "sweet-bonanza", "vox"],
      ["Aviator", "aviator", "vvegas"],
    ];
    document.querySelectorAll("[data-games-track] .game-card").forEach((card) => {
      const img = card.querySelector("img");
      const btn = card.querySelector("[data-cta-name]");
      if (!img || !btn) return;
      const file = img.getAttribute("src").split("/").pop().replace(/\.webp$/, "");
      const game = GAMES.find((g) => g[1] === file);
      if (game) game[2] = btn.dataset.ctaName;
    });
    const NAMES = ["Bal", "Kri", "Gáb", "Zso", "Lás", "Pét", "Ann", "Esz", "Tam", "Nor", "Dán", "Reg", "Ist", "Kat", "Mik", "Vik"];
    const ENDS = ["s", "a", "i", "o", "n", "r", "y", "e"];
    const rand = (n) => Math.floor(Math.random() * n);
    const pick = (arr) => arr[rand(arr.length)];
    // Log-uniform between ~150 and ~950 000 Ft: every order of magnitude is
    // equally likely (hundreds, thousands, tens and hundreds of thousands),
    // with random fillér so amounts look like real payouts (637,84 / 10 179,04).
    const demoAmount = () => {
      const min = Math.log(150);
      const max = Math.log(950000);
      const whole = Math.floor(Math.exp(min + Math.random() * (max - min)));
      return whole + rand(100) / 100;
    };
    let demoId = 0;
    const demoFeed = (avoidGames = [], ageMs = 0) => {
      const pool = GAMES.filter((g) => !avoidGames.includes(g[0]));
      const game = pick(pool.length ? pool : GAMES);
      return {
        id: "demo-" + ++demoId,
        time: Date.now() - ageMs,
        player: pick(NAMES) + "***" + pick(ENDS) + (Math.random() < 0.7 ? rand(99) + 1 : ""),
        game: game[0],
        img: game[1],
        amount: demoAmount(),
        currency: "Ft",
        ctaName: game[2],
      };
    };

    // Hungarian format: space-grouped thousands, decimal comma, fraction only
    // when the value has one, no-break spaces so "Ft" never wraps away.
    const formatAmount = (value, currency) => {
      const [int, frac] = value.toFixed(2).split(".");
      const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      return grouped + (frac === "00" ? "" : "," + frac) + " " + currency;
    };

    const isSmall = (r) => r.amount <= WINS_CONFIG.smallMax;
    const isLarge = (r) => r.amount >= WINS_CONFIG.largeMin;
    const usedIds = new Set(); // an event is never shown twice
    const recentGames = []; // games shown in the last few swaps

    // Next record for a card, given the record on the other card: newest
    // unseen record within the period, never the same game or player as the
    // neighbour, avoiding recently shown games, and preferring the opposite
    // size (small next to large and vice versa) so the pair looks varied.
    const pickNext = (records, other) => {
      const now = Date.now();
      const base = records
        .filter((r) => now - r.time <= WINS_CONFIG.periodMs && !usedIds.has(r.id))
        .filter((r) => !other || (r.game !== other.game && r.player !== other.player))
        .sort((x, y) => y.time - x.time);
      const fresh = base.filter((r) => !recentGames.includes(r.game));
      const pool = fresh.length ? fresh : base;
      const prefer = other && isLarge(other) ? isSmall : other && isSmall(other) ? isLarge : null;
      return (prefer && pool.find(prefer)) || pool[0] || null;
    };

    // Shrink long amounts until they fit the tile width, but never below a
    // comfortably readable 14px.
    const fitAmount = (el) => {
      el.style.fontSize = "";
      let size = parseFloat(getComputedStyle(el).fontSize);
      while (el.scrollWidth > el.clientWidth && size > 14) {
        size -= 0.5;
        el.style.fontSize = size + "px";
      }
    };

    const tiles = [...winsList.querySelectorAll(".hero-wins__tile")];
    const shown = [null, null];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Update a tile in place so its height and position never change.
    const fill = (i, win) => {
      const tile = tiles[i];
      shown[i] = win;
      usedIds.add(win.id);
      recentGames.push(win.game);
      if (recentGames.length > WINS_CONFIG.noRepeatGames) recentGames.shift();
      tile.dataset.winId = win.id;
      tile.dataset.ctaName = win.ctaName;
      // cta-links.js sets hrefs on load (after this script); once it has,
      // keep the href in step with the new record.
      if (tile.href) {
        const url = new URL(tile.href);
        url.searchParams.set("ctaName", win.ctaName);
        tile.href = url.toString();
      }
      const img = tile.querySelector(".hero-wins__thumb");
      img.src = "/assets/games/thumbs/" + win.img + ".webp";
      img.removeAttribute("loading");
      tile.querySelector(".hero-wins__player").textContent = win.player;
      tile.querySelector(".hero-wins__game").textContent = win.game;
      const amount = tile.querySelector(".hero-wins__amount");
      amount.textContent = formatAmount(win.amount, win.currency);
      fitAmount(amount);
    };

    // Hold still while the pointer or keyboard focus is on the block, so a
    // card never changes (and re-targets its link) under the user (WCAG 2.2.2).
    // Mouse only: a touch "hover" would otherwise stick after a tap.
    let hovered = false;
    let focused = false;
    const paused = () => hovered || focused;
    winsList.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") hovered = true; });
    winsList.addEventListener("pointerleave", () => { hovered = false; });
    winsList.addEventListener("focusin", () => { focused = true; });
    winsList.addEventListener("focusout", (e) => {
      if (!winsList.contains(e.relatedTarget)) focused = false;
    });

    // Fade the card's content out, swap it once the new cover is decoded (so
    // it never flashes empty), fade back in and briefly glow the amount.
    const swap = (i, win) => {
      const tile = tiles[i];
      const cover = new Image();
      cover.src = "/assets/games/thumbs/" + win.img + ".webp";
      const ready = cover.decode ? cover.decode().catch(() => {}) : Promise.resolve();
      ready.then(() => {
        if (paused()) return;
        if (reduceMotion.matches) return fill(i, win);
        tile.classList.add("is-leaving");
        window.setTimeout(() => {
          // Paused mid-fade: keep the current card, just fade it back in.
          if (paused()) return tile.classList.remove("is-leaving");
          fill(i, win);
          tile.classList.remove("is-leaving");
          const amount = tile.querySelector(".hero-wins__amount");
          amount.classList.remove("is-fresh");
          void amount.offsetWidth;
          amount.classList.add("is-fresh");
        }, WINS_CONFIG.fadeMs);
      });
    };

    // Seed a few backdated demo records so the first pair has a choice.
    const records = [];
    for (let k = 0; k < 6; k++) records.push(demoFeed([], (k + 1) * 60 * 1000));
    tiles.forEach((_, i) => {
      const win = pickNext(records, shown[1 - i]);
      if (win) fill(i, win);
    });

    window.addEventListener("resize", () => {
      tiles.forEach((t) => fitAmount(t.querySelector(".hero-wins__amount")));
    }, { passive: true });

    // Only animate while the block is actually on screen.
    let onScreen = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        onScreen = entries[0].isIntersecting;
      }).observe(winsList);
    }

    // One card at a time, alternating left and right.
    let next = 0;
    const schedule = () => window.setTimeout(() => {
      if (!document.hidden && onScreen && !paused()) {
        records.push(demoFeed(shown.filter(Boolean).map((r) => r.game).concat(recentGames)));
        // Drop records older than the period and cap the buffer.
        const cutoff = Date.now() - WINS_CONFIG.periodMs;
        for (let k = records.length - 1; k >= 0; k--) if (records[k].time < cutoff) records.splice(k, 1);
        if (records.length > 50) records.splice(0, records.length - 50);
        const win = pickNext(records, shown[1 - next]);
        if (win) swap(next, win);
        next = 1 - next;
      }
      schedule();
    }, WINS_CONFIG.refreshMin + rand(WINS_CONFIG.refreshMax - WINS_CONFIG.refreshMin));
    schedule();
  }

  const heroToggle = document.querySelector(".hero__lead-toggle");
  if (heroToggle) {
    const target = document.getElementById(heroToggle.dataset.target);
    if (target) {
      // Hide the toggle when the clamped lead already fits in two lines.
      const syncToggle = () => {
        if (target.classList.contains("is-expanded")) return;
        heroToggle.style.display = target.scrollHeight <= target.clientHeight + 1 ? "none" : "";
      };
      syncToggle();
      window.addEventListener("resize", syncToggle, { passive: true });
      heroToggle.addEventListener("click", () => {
        const expanded = target.classList.toggle("is-expanded");
        heroToggle.setAttribute("aria-expanded", String(expanded));
        heroToggle.textContent = expanded ? T.less : T.more;
      });
    }
  }

  const menuBtn = document.querySelector(".mob-menu-btn");
  const menu = document.getElementById("mob-menu");
  if (menuBtn && menu) {
    const backdrop = menu.querySelector(".mob-menu__backdrop");
    const closeBtn = menu.querySelector(".mob-menu__close");
    const open = () => {
      menu.classList.add("is-open");
      menuBtn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    };
    const close = () => {
      menu.classList.remove("is-open");
      menuBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    };
    menuBtn.addEventListener("click", open);
    if (backdrop) backdrop.addEventListener("click", close);
    if (closeBtn) closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  document.querySelectorAll("[data-lang-switch]").forEach((widget) => {
    const btn = widget.querySelector(".lang-switch__btn");
    const list = widget.querySelector(".lang-switch__list");
    const current = widget.querySelector("[data-lang-current]");
    const currentFlag = widget.querySelector("[data-lang-current-flag]");
    if (!btn || !list) return;

    const close = () => {
      widget.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      list.hidden = true;
    };
    const open = () => {
      widget.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      list.hidden = false;
    };

    btn.addEventListener("click", () => {
      if (list.hidden) open();
      else close();
    });

    list.querySelectorAll("[data-lang]").forEach((option) => {
      option.addEventListener("click", () => {
        list.querySelectorAll(".lang-switch__option").forEach((el) => el.classList.remove("is-active"));
        list.querySelectorAll("[role='option']").forEach((el) => el.setAttribute("aria-selected", "false"));
        option.classList.add("is-active");
        option.closest("[role='option']")?.setAttribute("aria-selected", "true");
        if (current) current.textContent = option.dataset.langLabel || option.dataset.lang.toUpperCase();
        const flagEl = option.querySelector(".lang-switch__flag");
        if (currentFlag && flagEl) currentFlag.textContent = flagEl.textContent;
        close();
        const href = option.dataset.href;
        if (href && href !== window.location.pathname) {
          window.location.href = href;
        }
      });
    });

    document.addEventListener("click", (e) => {
      if (!widget.contains(e.target)) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  });

  const reviewNav = document.querySelector(".review-nav");
  if (reviewNav) {
    const navItems = Array.from(reviewNav.querySelectorAll(".review-nav__item"));
    const targets = navItems
      .map((item) => document.getElementById(item.getAttribute("href").slice(1)))
      .filter(Boolean);
    if (targets.length) {
      const setActive = (id) => {
        navItems.forEach((item) => {
          const active = item.getAttribute("href") === "#" + id;
          item.classList.toggle("is-active", active);
          if (active) {
            const target = item.offsetLeft - (reviewNav.clientWidth - item.offsetWidth) / 2;
            reviewNav.scrollTo({ left: target, behavior: "smooth" });
          }
        });
      };
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActive(entry.target.id);
          });
        },
        { rootMargin: "-160px 0px -60% 0px", threshold: 0 }
      );
      targets.forEach((el) => observer.observe(el));

      navItems.forEach((item) => {
        item.addEventListener("click", (e) => {
          const target = document.getElementById(item.getAttribute("href").slice(1));
          if (!target) return;
          e.preventDefault();
          const offset = (header ? header.offsetHeight : 0) + reviewNav.offsetHeight;
          const top = target.getBoundingClientRect().top + window.scrollY - offset - 10;
          window.scrollTo({ top, behavior: "smooth" });
        });
      });
    }
  }

  document.querySelectorAll(".review-card__readmore").forEach((btn) => {
    const body = btn.previousElementSibling;
    if (!body || !body.classList.contains("review-card__body")) return;
    btn.addEventListener("click", () => {
      const expanded = body.classList.toggle("is-expanded");
      btn.textContent = expanded ? T.readLess : T.readMore;
    });
  });

  const carousels = document.querySelectorAll(".review-card__carousel");
  if (carousels.length) {
    let lightbox, imgEl, prevBtn, nextBtn;
    let currentImages = [];
    let currentIndex = 0;

    const show = (i) => {
      currentIndex = (i + currentImages.length) % currentImages.length;
      const img = currentImages[currentIndex];
      imgEl.src = img.currentSrc || img.src;
      imgEl.alt = img.alt || "";
      const multi = currentImages.length > 1;
      prevBtn.hidden = !multi;
      nextBtn.hidden = !multi;
    };
    const closeLightbox = () => {
      if (lightbox) lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
    };
    const buildLightbox = () => {
      lightbox = document.createElement("div");
      lightbox.className = "lightbox";
      lightbox.innerHTML =
        '<div class="lightbox__backdrop"></div>' +
        '<button type="button" class="lightbox__close" aria-label="' + A.close + '">' +
        '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="3" x2="17" y2="17"/><line x1="17" y1="3" x2="3" y2="17"/></svg>' +
        "</button>" +
        '<button type="button" class="lightbox__nav lightbox__nav--prev" aria-label="' + A.prev + '">' +
        '<svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="12 4 6 10 12 16"/></svg>' +
        "</button>" +
        '<button type="button" class="lightbox__nav lightbox__nav--next" aria-label="' + A.next + '">' +
        '<svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="8 4 14 10 8 16"/></svg>' +
        "</button>" +
        '<img class="lightbox__img" alt="">';
      document.body.appendChild(lightbox);

      imgEl = lightbox.querySelector(".lightbox__img");
      prevBtn = lightbox.querySelector(".lightbox__nav--prev");
      nextBtn = lightbox.querySelector(".lightbox__nav--next");

      lightbox.querySelector(".lightbox__backdrop").addEventListener("click", closeLightbox);
      lightbox.querySelector(".lightbox__close").addEventListener("click", closeLightbox);
      prevBtn.addEventListener("click", () => show(currentIndex - 1));
      nextBtn.addEventListener("click", () => show(currentIndex + 1));
    };
    const openLightbox = (images, startIndex) => {
      if (!lightbox) buildLightbox();
      currentImages = images;
      show(startIndex);
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };

    carousels.forEach((carousel) => {
      const images = Array.from(carousel.querySelectorAll("img"));
      images.forEach((img, i) => {
        img.style.cursor = "zoom-in";
        img.addEventListener("click", () => openLightbox(images, i));
      });
    });

    document.addEventListener("keydown", (e) => {
      if (!lightbox || !lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") show(currentIndex - 1);
      if (e.key === "ArrowRight") show(currentIndex + 1);
    });
  }

  document.querySelectorAll(".faq__btn").forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute("aria-controls"));
    if (!panel) return;
    const toggle = () => {
      const item = btn.closest(".faq__item");
      const isOpen = item.classList.contains("faq__item--open");
      item.classList.toggle("faq__item--open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
      panel.style.maxHeight = isOpen ? "0" : panel.scrollHeight + "px";
    };
    btn.addEventListener("click", toggle);
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
    const heading = btn.closest(".faq__question")?.querySelector("h3");
    heading?.addEventListener("click", toggle);
  });
})();
