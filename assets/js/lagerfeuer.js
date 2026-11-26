/* Team-Seite: Lagerfeuer-Scrollytelling (Personen im Kreis ums Feuer, je Scroll-Schritt rückt die nächste nach vorn) */
(function () {
  "use strict";
  const fire = document.querySelector(".feuer");
  if (!fire) return;
  const buehne = fire.querySelector(".feuer-buehne");
  const himmel = fire.querySelector(".feuer-himmel"), sterne = fire.querySelector(".feuer-sterne"), mond = fire.querySelector(".feuer-mond"), schnuppe = fire.querySelector(".feuer-schnuppe");
  const glut = fire.querySelector(".feuer-glut"), stelle = fire.querySelector(".feuer-stelle"), tannen = fire.querySelector(".feuer-tannen");
  const pe = [...fire.querySelectorAll(".feuer-p")], its = [...fire.querySelectorAll(".feuer-it")];
  const dots = fire.querySelector(".feuer-dots");
  let hinweis = null;   // „Weiter scrollen“ wird erst von module.js erzeugt (nach diesem Skript) – deshalb erst bei Bedarf suchen
  const nms = pe.map((e) => e.querySelector(".feuer-name")), dunkel = pe.map((e) => e.querySelector(".feuer-dunkel"));
  const N = pe.length;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const mix = (a, b, t) => "rgb(" + a.map((v, i) => Math.round(lerp(v, b[i], t))).join(",") + ")";
  const rng = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const reduziert = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Szene aufbauen: Sterne, Tannen, Funken
  let r = rng(9), s = "";
  for (let i = 0; i < 110; i++) s += `<circle cx="${r() * 1000}" cy="${r() * 400}" r="${0.6 + r() * 1.5}" fill="#fff" opacity="${0.4 + r() * 0.6}"/>`;
  sterne.innerHTML = s;
  { let d = "M0 130 L0 130", x = 0; const q = rng(4);
    while (x < 1600) { const h = 50 + q() * 70, w = 26 + q() * 30; d += ` L${x} 130 L${x + w / 2} ${130 - h} L${x + w} 130`; x += w * 0.7; }
    tannen.innerHTML = `<path d="${d} L1600 130 Z" fill="#001418"/>`; }
  if (!reduziert) for (let i = 0; i < 16; i++) {
    const e = document.createElement("i"); e.className = "funke";
    e.style.cssText = `--x:${(Math.random() * 120 - 60).toFixed(0)}px;--t:${(1.6 + Math.random() * 1.8).toFixed(2)}s;--dl:${(Math.random() * 3).toFixed(2)}s;left:${45 + Math.random() * 10}%`;
    stelle.appendChild(e);
  }

  // Punkte zum Anspringen
  const btns = pe.map((e, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = i + 1;
    b.setAttribute("aria-label", nms[i].textContent);
    b.addEventListener("click", () => nach(i));
    dots.appendChild(b);
    return b;
  });

  let W = 120, rx = 380, ry = 100, TA = Math.PI / 2 - 0.75, klein = false, kopf = 100, hoeheB = 600, SCHRITT = 600;
  function layout() {
    klein = innerWidth < 860;
    kopf = innerWidth >= 1273 ? 100 : 72;
    fire.style.setProperty("--kopf", kopf + "px");
    hoeheB = innerHeight - kopf;
    SCHRITT = Math.max(360, innerHeight * 0.7);
    fire.style.height = hoeheB + (N - 1) * SCHRITT + "px";
    W = klein ? 74 : 120;
    rx = clamp(innerWidth * (klein ? 0.36 : 0.22), 120, 400);
    ry = clamp(hoeheB * (klein ? 0.07 : 0.12), 40, 120);
    TA = Math.PI / 2 - (klein ? 0.5 : 0.75);
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
  let aktiv = -1, schnuppeZeit = 0;
  function update() {
    const rc = fire.getBoundingClientRect();
    const p = clamp((kopf - rc.top) / Math.max(1, rc.height - hoeheB));
    const f = p * (N - 1);
    pe.forEach((e, i) => {
      const d = ((((i - f + N / 2) % N) + N) % N) - N / 2;
      const th = TA + d * step;
      const x = rx * Math.cos(th), y = ry * Math.sin(th), z = (1 + Math.sin(th)) / 2;
      const c = ease(clamp(1 - Math.abs(d)));
      const sc = lerp(0.5 + 0.32 * z, klein ? 1.35 : 1.3, c);
      e.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-100%) scale(${sc.toFixed(3)})`;
      e.style.zIndex = Math.round(z * 100) + (c > 0.5 ? 1 : 0);
      dunkel[i].style.opacity = (1 - lerp(0.45 + 0.3 * z, 1, c)).toFixed(2);
      nms[i].style.opacity = c.toFixed(2);
      e.classList.toggle("aktiv", c > 0.6);
    });
    const a = Math.round(f);
    if (a !== aktiv) {
      aktiv = a;
      its.forEach((el, j) => el.classList.toggle("an", j === a));
      btns.forEach((b, j) => { b.classList.toggle("an", j === a); if (j === a) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
    }
    // Feuer wächst, der Himmel wird vom rosa Abend zur petrolfarbenen Nacht
    stelle.style.transform = `translate(-50%,-100%) scale(${(lerp(0.5, 1.1, ease(clamp(p * 3))) * (klein ? 0.5 : 1)).toFixed(3)})`;
    glut.style.opacity = lerp(0.45, 1, clamp(p * 3)).toFixed(2);
    const t = clamp(p * 1.3);
    himmel.style.background = `linear-gradient(180deg, ${mix([0, 105, 106], [0, 22, 25], t)}, ${mix([226, 110, 140], [0, 58, 60], t)})`;
    sterne.style.opacity = clamp((p - 0.05) / 0.45).toFixed(2);
    mond.style.opacity = clamp((p - 0.2) / 0.5).toFixed(2);
    if (!hinweis) hinweis = fire.querySelector(".scroll-hinweis");
    if (hinweis) hinweis.style.opacity = p < 0.97 ? 1 : 0;
    // gelegentlich eine Sternschnuppe
    if (!reduziert && p > 0.3 && scrollY - schnuppeZeit > 900) {
      schnuppeZeit = scrollY; schnuppe.classList.remove("los"); void schnuppe.offsetWidth;
      schnuppe.style.left = 10 + Math.random() * 50 + "%"; schnuppe.classList.add("los");
    }
  }
  let tick = false;
  addEventListener("scroll", () => { if (tick) return; tick = true; requestAnimationFrame(() => { update(); tick = false; }); }, { passive: true });
  let letzteBreite = innerWidth;
  addEventListener("resize", () => { if (innerWidth === letzteBreite && Math.abs(innerHeight - hoeheB - kopf) < 120) return; letzteBreite = innerWidth; layout(); update(); });
  layout(); update();
})();
