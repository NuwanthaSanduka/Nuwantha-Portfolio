// JavaScript සක්‍රිය බව CSS එකට දැනුම් දී scroll-reveal styles භාවිතා කිරීමට ඉඩ දෙයි.
document.documentElement.classList.add("js");

// නැවත නැවත භාවිතා කරන ප්‍රධාන HTML elements එකවර ලබා ගනී.
const hero = document.querySelector(".hero");
const siteHeader = document.querySelector("[data-site-header]");
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".hero-nav");
const toast = document.querySelector(".toast");

const HERO_DESIGN_WIDTH = 1440;
const HERO_DESIGN_HEIGHT = 1024;

/**
 * Desktop hero එක 1440 × 1024 Figma frame එකේ අනුපාතය නොවෙනස්ව
 * browser viewport එකට ගැළපෙන ප්‍රමාණයට scale කරයි.
 * Mobile/Tablet layout එක CSS media queries මගින් පාලනය වන නිසා 1200px ට අඩු විට
 * JavaScript මගින් එක් කළ custom values ඉවත් කරයි.
 */
function fitHeroToViewport() {
  if (!hero) return;

  if (window.innerWidth < 1200) {
    hero.style.removeProperty("--hero-stage-scale");
    hero.style.removeProperty("--hero-display-height");
    hero.style.removeProperty("--hero-left-shift");
    hero.style.removeProperty("--hero-name-scale");
    hero.style.removeProperty("--hero-name-width-scale");
    hero.style.removeProperty("--hero-right-shift");
    return;
  }

  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  // Hero එක viewport එකෙන් පිට නොයන විශාලම ආරක්ෂිත scale value එක සොයයි.
  const scale = Math.min(
    1,
    viewportWidth / HERO_DESIGN_WIDTH,
    viewportHeight / HERO_DESIGN_HEIGHT
  );
  // Laptop screen එකේ ඇති ඉතිරි side space අනුව වම් සහ දකුණු text positions සකස් කරයි.
  const stageSideGap = Math.max(0, (viewportWidth - HERO_DESIGN_WIDTH * scale) / 2);
  const targetEdge = Math.max(68, Math.min(108, viewportWidth * 0.055));
  const outwardShift = Math.max(0, stageSideGap + 90 * scale - targetEdge);
  const stageShift = scale > 0 ? Math.min(420, outwardShift / scale) : 0;
  const appliedOutwardShift = stageShift * scale;
  const nameScale = 1 + Math.min(0.14, (appliedOutwardShift / viewportWidth) * 0.9);
  const leftContentEdge = stageSideGap + (90 - stageShift) * scale;
  const rightContentEdge = stageSideGap + (92 - stageShift) * scale;
  const targetNameWidth = viewportWidth - leftContentEdge - rightContentEdge;
  const baseNameWidth = 1320 * scale * nameScale;
  const nameWidthScale = Math.max(0.94, Math.min(1.46, targetNameWidth / baseNameWidth));

  hero.style.setProperty("--hero-stage-scale", scale.toFixed(4));
  hero.style.setProperty("--hero-left-shift", `${Math.round(-stageShift)}px`);
  hero.style.setProperty("--hero-name-scale", nameScale.toFixed(4));
  hero.style.setProperty("--hero-name-width-scale", nameWidthScale.toFixed(4));
  hero.style.setProperty("--hero-right-shift", `${Math.round(stageShift)}px`);
  hero.style.setProperty(
    "--hero-display-height",
    `${Math.round(HERO_DESIGN_HEIGHT * scale)}px`
  );
}

fitHeroToViewport();

// Page එක load වූ පසු මුල් hero සහ navbar animation එක ආරම්භ කරයි.
window.setTimeout(() => {
  hero?.classList.add("is-loaded");
  siteHeader?.classList.add("is-loaded");
}, 350);

// Mobile menu එක වසා body scroll එක නැවත සක්‍රිය කරයි.
function closeMenu() {
  if (!siteHeader || !menuToggle) return;
  siteHeader.classList.remove("menu-open");
  document.body.classList.remove("menu-locked");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
}

// Four-square menu button එක click කළ විට navigation panel එක open/close කරයි.
menuToggle?.addEventListener("click", () => {
  const isOpen = siteHeader?.classList.toggle("menu-open") ?? false;
  document.body.classList.toggle("menu-locked", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

// Navigation link එකක් තෝරාගත් පසු mobile menu එක ස්වයංක්‍රීයව වසයි.
navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

// Keyboard එකේ Escape key එකෙන්ද menu එක වසාගත හැක.
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

// Scroll කිරීම ආරම්භ වූ විට navbar background එක පැහැදිලි කර content කියවීමට පහසු කරයි.
function updateHeaderState() {
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 12);
}

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

const revealItems = [...document.querySelectorAll(".reveal")];

// Screen එක තුළට පැමිණෙන sections සහ cards smooth ලෙස reveal කරයි.
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -10%" }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const sectionLinks = [...document.querySelectorAll('.hero-nav a[href^="#"]')];
const observedSections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

// දැනට user බලන section එකට අදාළ navigation link එක active කරයි.
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visibleEntry) return;

      sectionLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${visibleEntry.target.id}`);
      });
    },
    { threshold: [0.15, 0.4, 0.65], rootMargin: "-18% 0px -55%" }
  );

  observedSections.forEach((section) => sectionObserver.observe(section));
}

/**
 * Project සහ certificate tracks සඳහා එකම carousel controls සකස් කරයි.
 * Arrow button හෝ swipe/scroll කළ විට active dot එකත් update වේ.
 */
function setupCarousel(control) {
  const carouselName = control.dataset.carousel;
  const track = document.querySelector(`[data-track="${carouselName}"]`);
  if (!track) return;

  const items = [...track.children];
  const dots = [...control.querySelectorAll(".carousel-dots span")];
  let activeIndex = 0;

  const updateDots = (index) => {
    activeIndex = Math.max(0, Math.min(index, items.length - 1));
    dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === activeIndex));
  };

  // තෝරාගත් card එක track එකේ මැදට smooth ලෙස ගෙන එයි.
  const moveTo = (index) => {
    const targetIndex = (index + items.length) % items.length;
    const target = items[targetIndex];
    const centeredLeft = target.offsetLeft - (track.clientWidth - target.clientWidth) / 2;
    track.scrollTo({ left: centeredLeft, behavior: "smooth" });
    updateDots(targetIndex);
  };

  control.querySelectorAll("[data-direction]").forEach((button) => {
    button.addEventListener("click", () => {
      moveTo(activeIndex + (button.dataset.direction === "next" ? 1 : -1));
    });
  });

  let scrollFrame;
  // User අතින් swipe කළ විට මැදට ආසන්න card එක active ලෙස සලකයි.
  track.addEventListener(
    "scroll",
    () => {
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = window.requestAnimationFrame(() => {
        const trackCenter = track.scrollLeft + track.clientWidth / 2;
        const closestIndex = items.reduce((closest, item, index) => {
          const itemCenter = item.offsetLeft + item.clientWidth / 2;
          const closestCenter = items[closest].offsetLeft + items[closest].clientWidth / 2;
          return Math.abs(itemCenter - trackCenter) < Math.abs(closestCenter - trackCenter) ? index : closest;
        }, 0);
        updateDots(closestIndex);
      });
    },
    { passive: true }
  );

  updateDots(0);
}

document.querySelectorAll("[data-carousel]").forEach(setupCarousel);

/**
 * Tool logos නතර නොවන horizontal loop එකක් ලෙස animate කරයි.
 * Hover, keyboard focus හෝ drag කරන අතරතුර animation එක තාවකාලිකව නවතයි.
 */
function setupToolMarquee(marquee) {
  const firstSet = marquee.querySelector("[data-tool-set]");
  const secondSet = firstSet?.nextElementSibling;
  if (!firstSet || !secondSet) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let isHovered = false;
  let isFocused = false;
  let isPointerActive = false;
  let isMouseDragging = false;
  let dragStartX = 0;
  let dragStartScroll = 0;
  let resumeAfter = 0;
  let previousTime = performance.now();

  const loopWidth = () => secondSet.offsetLeft - firstSet.offsetLeft;

  // දෙවන duplicate tool set එකට පැමිණි විට scroll position එක පළමු set එකට මාරු කර seam එක සඟවයි.
  const normalizeScroll = () => {
    const width = loopWidth();
    if (width <= 0) return;
    while (marquee.scrollLeft >= width) marquee.scrollLeft -= width;
    while (marquee.scrollLeft < 0) marquee.scrollLeft += width;
  };

  // සෑම animation frame එකකම ඉතා සුළු scroll ප්‍රමාණයක් එකතු කරයි.
  const animate = (time) => {
    const elapsed = Math.min(48, time - previousTime);
    previousTime = time;
    const isPaused =
      reducedMotion.matches ||
      document.hidden ||
      isHovered ||
      isFocused ||
      isPointerActive ||
      time < resumeAfter;

    if (!isPaused) {
      marquee.scrollLeft += elapsed * 0.036;
      normalizeScroll();
    }

    window.requestAnimationFrame(animate);
  };

  marquee.addEventListener("mouseenter", () => { isHovered = true; });
  marquee.addEventListener("mouseleave", () => {
    isHovered = false;
    isMouseDragging = false;
    isPointerActive = false;
    marquee.classList.remove("is-dragging");
    resumeAfter = performance.now() + 700;
  });
  marquee.addEventListener("focusin", () => { isFocused = true; });
  marquee.addEventListener("focusout", () => {
    isFocused = false;
    resumeAfter = performance.now() + 700;
  });

  // Mouse එකෙන් tool strip එක අල්ලා දෙපසට drag කිරීමට අවශ්‍ය values save කරයි.
  marquee.addEventListener("pointerdown", (event) => {
    isPointerActive = true;
    if (event.pointerType !== "mouse") return;
    isMouseDragging = true;
    dragStartX = event.clientX;
    dragStartScroll = marquee.scrollLeft;
    marquee.classList.add("is-dragging");
    marquee.setPointerCapture(event.pointerId);
  });

  marquee.addEventListener("pointermove", (event) => {
    if (!isMouseDragging) return;
    event.preventDefault();
    marquee.scrollLeft = dragStartScroll - (event.clientX - dragStartX);
  });

  // Drag එක අවසන් වූ පසු loop position එක නිවැරදි කර animation එක නැවත ආරම්භ කරයි.
  const finishPointer = (event) => {
    if (isMouseDragging && marquee.hasPointerCapture(event.pointerId)) {
      marquee.releasePointerCapture(event.pointerId);
    }
    isMouseDragging = false;
    isPointerActive = false;
    marquee.classList.remove("is-dragging");
    normalizeScroll();
    resumeAfter = performance.now() + 1200;
  };

  marquee.addEventListener("pointerup", finishPointer);
  marquee.addEventListener("pointercancel", finishPointer);
  window.requestAnimationFrame(animate);
}

document.querySelectorAll("[data-tool-marquee]").forEach(setupToolMarquee);

let toastTimer;

// Placeholder project button එකක් click කළ විට කෙටි message එකක් පෙන්වයි.
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3200);
}

// Real project URLs එක් කළ පසු මෙම buttons <a> links වලට මාරු කළ හැක.
document.querySelectorAll("[data-project-action]").forEach((button) => {
  button.addEventListener("click", () => {
    showToast("Add your real project URL to this button in index.html.");
  });
});

// Online CV page එකේ Print / Save PDF button එක browser print dialog එක විවෘත කරයි.
document.querySelector("[data-print-cv]")?.addEventListener("click", () => {
  window.print();
});

// Screen size එක වෙනස් වන විට hero scale එක නැවත ගණනය කර desktop වෙත ගියොත් menu එක වසයි.
window.addEventListener("resize", () => {
  fitHeroToViewport();
  if (window.innerWidth >= 1200) closeMenu();
});

// Mobile browser address bar එක වෙනස් වීමත් සමඟ hero height එක නිවැරදිව තබයි.
window.visualViewport?.addEventListener("resize", fitHeroToViewport);
