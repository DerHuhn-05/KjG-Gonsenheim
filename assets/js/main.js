document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  if (!header) return;

  // Header: transparent oben, Petrol-Leiste sobald gescrollt wird
  const SCHWELLE = 10; // Pixel
  let geplant = false;
  const pruefen = () => {
    header.classList.toggle("scrolled", window.scrollY > SCHWELLE || header.classList.contains("open"));
    geplant = false;
  };
  window.addEventListener("scroll", () => {
    if (!geplant) { geplant = true; requestAnimationFrame(pruefen); }
  }, { passive: true });
  pruefen();

  // Mobile-Menü (Hamburger)
  const toggle = document.querySelector(".menu-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = header.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      pruefen();
    });
  }
});
