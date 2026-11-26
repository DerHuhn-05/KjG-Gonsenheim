/* Team-Seite: Lagerfeuer-Scrollytelling (Personen im Kreis ums Feuer, je Scroll-Schritt rückt die nächste nach vorn) */
(function () {
  "use strict";
  const fire = document.querySelector(".feuer");
  if (!fire) return;
  const ring = fire.querySelector(".feuer-ring"), stelle = fire.querySelector(".feuer-stelle"), bahn = fire.querySelector(".feuer-bahn");
  const pe = [...fire.querySelectorAll(".feuer-p")], its = [...fire.querySelectorAll(".feuer-it")];
  const dots = fire.querySelector(".feuer-dots");
  let hinweis = null;   // „Weiter scrollen“ wird erst von module.js erzeugt (nach diesem Skript) – deshalb erst bei Bedarf suchen
  const nms = pe.map((e) => e.querySelector(".feuer-name"));
  const N = pe.length;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const reduziert = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Punkte zum Anspringen
  const pfeil = (richtung) => {   // Pfeil-Knopf links/rechts neben den Nummern
    const b = document.createElement("button");
    b.type = "button"; b.className = "feuer-pfeil";
    b.setAttribute("aria-label", richtung < 0 ? (document.documentElement.lang === "en" ? "Previous person" : "Vorherige Person") : (document.documentElement.lang === "en" ? "Next person" : "Nächste Person"));
    b.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="${richtung < 0 ? "M10 2 L4 7 L10 12" : "M4 2 L10 7 L4 12"}" fill="none" stroke="#fff" stroke-width="2"/></svg>`;
    b.addEventListener("click", () => nach(clamp(aktiv + richtung, 0, N - 1)));
    return b;
  };
  const zurueck = pfeil(-1), weiter = pfeil(1);
  dots.appendChild(zurueck);
  const btns = pe.map((e, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = i + 1;
    b.setAttribute("aria-label", nms[i].textContent);
    b.addEventListener("click", () => nach(i));
    dots.appendChild(b);
    return b;
  });
  dots.appendChild(weiter);

  let feuerSkala = 0.9, rx = 380, ry = 100, TA = Math.PI / 2, klein = false, kopf = 100, hoeheB = 600, SCHRITT = 600;
  function layout() {
    klein = innerWidth < 860;
    kopf = innerWidth >= 1273 ? 100 : 72;
    fire.style.setProperty("--kopf", kopf + "px");
    hoeheB = innerHeight - kopf;
    SCHRITT = Math.max(360, innerHeight * 0.7);
    fire.style.height = hoeheB + (N - 1) * SCHRITT + "px";
    rx = clamp(innerWidth * (klein ? 0.37 : 0.22), 120, 400);
    ry = clamp(hoeheB * (klein ? 0.065 : 0.13), 40, 130);
    bahn.style.width = 2 * rx + "px"; bahn.style.height = 2 * ry + "px";
    if (klein) {   // Handy: Szene füllt den Platz über der Kachel; der Name der aktiven Person endet 20 px über der Infokachel
      const info = fire.querySelector(".feuer-info");
      const unten = parseFloat(getComputedStyle(info).bottom) || 0;
      fire.classList.remove("kompakt");
      let oben = hoeheB - unten - info.offsetHeight;
      if (oben < hoeheB * 0.48) { fire.classList.add("kompakt"); oben = hoeheB - unten - info.offsetHeight; }   // zu wenig Platz: Zitat der Person entfällt
      const platz = oben - 20;                                   // Name endet hier
      const W = clamp(platz * 0.27, 60, 100);
      pe.forEach((e) => (e.style.width = W + "px"));
      ry = clamp(platz * 0.1, 26, 56);
      bahn.style.width = 2 * rx + "px"; bahn.style.height = 2 * ry + "px";
      ring.style.top = platz - 24 - ry + "px";
      feuerSkala = clamp((platz - 24 - ry - 0.75 * ry - 64) / 260, 0.35, 0.8);
    } else { ring.style.top = ""; pe.forEach((e) => (e.style.width = "")); feuerSkala = 0.9; }
    TA = Math.PI / 2;   // die aktive Person sitzt immer ganz vorn in der Mitte des Kreises
  }
  function nach(i) {   // zur i-ten Person scrollen
    const oben = fire.getBoundingClientRect().top + scrollY;
    scrollTo({ top: oben - kopf + i * SCHRITT, behavior: reduziert ? "auto" : "smooth" });
  }
  // Sprungmarken der Seite (Lagerleitung / Planungsleitung / Pfarrleitung) → erste Person der Gruppe
  const GRUPPE = { lagerleitung: 0, planungsleitung: 3, pfarrleitung: 6 };
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    const id = a.getAttribute("href").slice(1);
    if (id in GRUPPE) a.addEventListener("click", (ev) => { ev.preventDefault(); nach(GRUPPE[id]); });
  });

  const step = (2 * Math.PI) / N;
  let aktiv = -1;
  function update() {
    const rc = fire.getBoundingClientRect();
    const p = clamp((kopf - rc.top) / Math.max(1, rc.height - hoeheB));
    const f = p * (N - 1);
    pe.forEach((e, i) => {
      const d = ((((i - f + N / 2) % N) + N) % N) - N / 2;
      const th = TA + d * step;
      const x = rx * Math.cos(th), y = ry * Math.sin(th), z = (1 + Math.sin(th)) / 2;
      const c = ease(clamp(1 - Math.abs(d)));
      const sc = lerp(0.5 + 0.32 * z, klein ? 1.3 : 1.3, c);
      e.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-100%) scale(${sc.toFixed(3)})`;
      e.style.zIndex = Math.round(z * 100) + (c > 0.5 ? 1 : 0);
      e.style.opacity = lerp(0.35 + 0.3 * z, 1, c).toFixed(2);
      nms[i].style.opacity = c.toFixed(2);
      e.classList.toggle("aktiv", c > 0.6);
    });
    const a = Math.round(f);
    if (a !== aktiv) {
      aktiv = a;
      its.forEach((el, j) => el.classList.toggle("an", j === a));
      zurueck.disabled = a === 0; weiter.disabled = a === N - 1;
      btns.forEach((b, j) => { b.classList.toggle("an", j === a); if (j === a) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
    }
    stelle.style.transform = `translate(-50%,${(-0.75 * ry).toFixed(0)}px) translate(0,-100%) scale(${(lerp(0.85, 1, ease(clamp(p * 3))) * feuerSkala).toFixed(3)})`;
    if (!hinweis) hinweis = fire.querySelector(".scroll-hinweis");
    if (hinweis) hinweis.style.opacity = p < 0.97 ? 1 : 0;
  }
  let tick = false;
  addEventListener("scroll", () => { if (tick) return; tick = true; requestAnimationFrame(() => { update(); tick = false; }); }, { passive: true });
  let letzteBreite = innerWidth;
  addEventListener("resize", () => { if (innerWidth === letzteBreite && Math.abs(innerHeight - hoeheB - kopf) < 120) return; letzteBreite = innerWidth; layout(); update(); });
  layout(); update();
  addEventListener("load", () => { layout(); update(); });   // nach dem Laden der Schrift stimmt die Höhe der Infokachel
})();
