/* =====================================================================
   Module der KjG-Website
   ---------------------------------------------------------------------
   Wiederkehrende Bausteine (Header, Footer, Bildfläche, Sprungmarken, Kacheln, Karten, …) stehen hier EINMAL.
   In den Seiten genügt ein kurzer Tag, z. B.  <kjg-header seite="team.html" aktiv="team.html"></kjg-header>
   Beim Laden ersetzt dieses Skript jeden Tag durch das fertige Markup – das Ergebnis ist exakt dasselbe wie
   handgeschriebenes HTML, das vorhandene CSS und main.js funktionieren unverändert.

   Texte, die auf einer Seite stehen (Überschriften, Absätze …), bleiben als Kinder des Tags im HTML.
   Texte, die in jedem Modul gleich sind (Menü, Footer, „genauere infos“ …), stehen hier in Deutsch und Englisch.

   Übersicht der Module (Attribute in Klammern):
     kjg-header (seite, aktiv)          Kopfzeile mit Menü und Sprachumschalter
     kjg-footer                         Fußzeile
     kjg-bild (name, alt, klasse, eager) Bildfläche mit Platzhalter (bilder/NAME.jpg)
     kjg-sprung (variante, klasse)      Sprungmarken; Kinder: <a href="#ziel" [x r]>Text</a>
     kjg-kachel (klasse, id, href, link, bild, bild-alt)        Petrol-Kachel mit Bild; Kinder: h2, p
     kjg-eventkachel (klasse, id, href, link, bild, bild-alt)   Angebots-Kachel; Kinder: h2, p
     kjg-karte (href, link, bild, bild-alt)                      Karte (Startseite); Kinder: h3, p …
     kjg-abschnitt (klasse, id, bild, bild-alt)                 Text + Bild (ohne bild: nur Text); Kinder: h2, p …
     kjg-person (klasse, bild, bild-alt)                        Team-Person; Kinder: h3, .rolle, p …
     kjg-zitat (klasse, bild, bild-alt)                         Zitat; Kinder: p, strong, span
     kjg-frage                          FAQ-Eintrag; Kinder: span (Frage), p (Antwort)
     kjg-hero (klasse, bild, bild-alt)  Seitenkopf mit Bild; Kind: h1
     kjg-zahlen                         Zahlenband mit drei Kennzahlen; Kinder: <span icon="uhr" zahl="72">Beschriftung</span>
     kjg-kontakt                        Kontaktband am Seitenende (Mail + Instagram), vor dem Footer
     kjg-scrollhinweis                  „Weiter scrollen“ mit Pfeil (in Scrollytellings; Sichtbarkeit steuert main.js)
     kjg-hero-split (klasse, bild, bild-alt)   Seitenkopf geteilt (Bild | Petrol); Kinder: h1, p, a.btn
   ===================================================================== */
(function () {
  "use strict";

  document.documentElement.classList.add("js");        // ab jetzt dürfen die Modul-Tags bis zum Ersetzen versteckt werden (ohne JavaScript bleibt ihr Inhalt lesbar)

  const EN = document.documentElement.lang === "en";
  const BASIS = EN ? "../" : "";                       // Englische Seiten liegen in en/, Bilder und Icons eine Ebene höher
  const T = (de, en) => (EN ? en : de);

  // Adressen, die auf mehreren Seiten vorkommen – nur hier ändern
  const MAIL = "kjg.mainzgonsenheim@gmail.com";
  const INSTAGRAM = "https://www.instagram.com/kjg_gonsenheim";
  const FACEBOOK = "https://www.facebook.com/";                  // TODO: echten Facebook-Link eintragen
  const MAPS = "https://www.google.com/maps/search/?api=1&query=Pfarrer-Grimm-Strasse+1%2C+55124+Mainz";

  const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  const attr = (el, name, fallback) => (el.hasAttribute(name) ? el.getAttribute(name) : fallback);
  const vorlage = (html) => { const t = document.createElement("template"); t.innerHTML = html; return t.content; };
  const idAttr = (el) => (el.id ? ` id="${esc(el.id)}"` : "");

  // ---- Icons ---------------------------------------------------------------------------------------------
  const ICON = {
    runter: `<img class="down" src="${BASIS}icons/pfeil-unten.svg" width="14" height="16" alt="">`,
    klein: `<img class="pfeil" src="${BASIS}icons/pfeil-rechts-klein-weiss.svg" width="14" height="10" alt="">`,
    rechts: `<img class="right" src="${BASIS}icons/pfeil-rechts.svg" width="22" height="12" alt="">`,
    chevron: `<img class="chev" src="${BASIS}icons/chevron-unten.svg" width="22" height="13" alt="">`,
    menuChevron: `<img class="mn-chev" src="${BASIS}icons/chevron-unten-weiss.svg" width="22" height="13" alt="">`,
  };

  // ---- Header --------------------------------------------------------------------------------------------
  const MENUE = [   // [Datei, deutsch, englisch]
    ["zela-2027.html", "Zela 2027", "Zela 2027"],
    ["events.html", "Angebote", "Activities"],
    ["team.html", "Team", "Team"],
    ["soziale-aktionen.html", "Soziales", "Social"],
    ["faq.html", "FAQ", "FAQ"],
  ];
  const GRUPPEN = [  // aufklappbare Gruppen im mobilen Menü
    { titel: ["Angebote", "Activities"], alle: ["events.html", "Alle Angebote", "All activities"], punkte: [
      ["zela-2027.html", "Zela 2027", "Zela 2027"], ["gruppenstunde.html", "Gruppenstunde", "Group Meetings"],
      ["mowo.html", "MoWo", "MoWo"], ["trainee-wochenende.html", "Trainee-Wochenende", "Trainee Weekend"]] },
    { titel: ["Soziales", "Social"], alle: ["soziale-aktionen.html", "Alle sozialen Aktionen", "All social projects"], punkte: [
      ["72h-aktion.html", "72h-Aktion", "72-Hour Project"], ["aktion.html", "Hilfe im Stadtteil", "Help in the Neighbourhood"],
      ["klamottenspende.html", "Klamottenspende", "Clothing Donation"]] },
  ];
  const link = (p) => `<a href="${p[0]}">${T(p[1], p[2])}</a>`;
  const gruppe = (g) => `
    <details class="mn-group">
      <summary>${T(...g.titel)}${ICON.menuChevron}</summary>
      <div class="mn-sub">
        <a class="mn-alle" href="${g.alle[0]}">${T(g.alle[1], g.alle[2])}</a>
        ${g.punkte.map(link).join("\n        ")}
      </div>
    </details>`;

  function header(el) {
    const seite = attr(el, "seite", "index.html"), aktiv = attr(el, "aktiv", "");
    const nav = MENUE.map((m) => `<a href="${m[0]}"${m[0] === aktiv ? ' aria-current="page"' : ""}>${T(m[1], m[2])}</a>`).join("\n      ");
    const sprache = EN
      ? `<a href="../${seite}" class="de" lang="de" hreflang="de">DE</a><span class="sep"></span><a href="${seite}" class="en active" lang="en" hreflang="en" aria-current="true">EN</a>`
      : `<a href="${seite}" class="de active" lang="de" hreflang="de" aria-current="true">DE</a><span class="sep"></span><a href="en/${seite}" class="en" lang="en" hreflang="en">EN</a>`;
    return vorlage(`<header class="site-header">
  <div class="bar">
    <a class="logo" href="index.html" aria-label="${T("KjG Mainz-Gonsenheim – Startseite", "KjG Mainz-Gonsenheim – Home")}"><img src="${BASIS}assets/img/logo-header.svg" width="250" height="49" alt="${T("KjG – Katholische junge Gemeinde", "KjG – Catholic Young Community")}"></a>
    <nav class="main-nav" aria-label="${T("Hauptnavigation", "Main navigation")}">
      ${nav}
    </nav>
    <div class="lang">${sprache}</div>
    <button class="menu-toggle" aria-label="${T("Menü öffnen", "Open menu")}" aria-expanded="false"><span class="bar1"></span><span class="bar2"></span></button>
  </div>
  <nav class="mobile-nav" aria-label="${T("Mobile Navigation", "Mobile navigation")}">
    <a href="index.html">${T("Startseite", "Home")}</a>
    <a href="zela-2027.html">Zela 2027</a>${gruppe(GRUPPEN[0])}
    <a href="team.html">Team</a>${gruppe(GRUPPEN[1])}
    <a href="faq.html">FAQ</a>
    <a href="ueber-uns.html">${T("Über uns", "About us")}</a>
  </nav>
</header>`);
  }

  // ---- Footer --------------------------------------------------------------------------------------------
  function footer() {
    const extern = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
    const mail = `<a href="mailto:${MAIL}">kjg.mainzgonsenheim@<br>gmail.com</a>`;
    return vorlage(`<footer class="site-footer">
  <div class="grid">
    <div class="brand"><a href="index.html"><img class="footer-logo" src="${BASIS}assets/img/logo-icon.svg" width="192" height="190" alt="${T("KjG Logo – zur Startseite", "KjG logo – to the home page")}"></a></div>
    <div class="col">
      <h3>${extern(MAPS, T("Adresse", "Address"))}</h3>
      <ul><li>${extern(MAPS, "Pfarrer-Grimm-Strasse 1")}</li><li>${extern(MAPS, "55124 Mainz")}</li></ul>
    </div>
    <div class="col">
      <h3>${T("Kontakt", "Contact")}</h3>
      <ul>
        <li>${mail}</li>
        <li>${extern(INSTAGRAM, "Instagram")}</li>
        <li>${extern(FACEBOOK, "Facebook")}</li>
      </ul>
    </div>
    <div class="col">
      <h3>${T("Quicklinks", "Quick links")}</h3>
      <ul>
        <li>${extern(INSTAGRAM, "Instagram")}</li>
        <li>${mail}</li>
      </ul>
    </div>
    <div class="col col-faq">
      <h3>FAQ</h3>
      <ul>
        <li><a href="faq.html">${T("Häufig gestellte Fragen", "Frequently asked questions")}</a></li>
        <li><a href="impressum.html">${T("Impressum", "Legal notice")}</a></li>
        <li><a href="datenschutz.html">${T("Datenschutz", "Privacy policy")}</a></li>
      </ul>
    </div>
  </div>
</footer>`);
  }

  // ---- Bildfläche ----------------------------------------------------------------------------------------
  // Platzhalter mit Dateiname; sobald bilder/NAME.jpg (oder .jpeg/.png/.webp) existiert, wird das Bild angezeigt (bilder.js)
  function bild(el) {
    const name = attr(el, "name", "");
    const lazy = el.hasAttribute("eager") ? "" : ' loading="lazy"';
    return vorlage(`<div class="${esc(attr(el, "klasse", "media"))}"><span class="ph-label">bilder/${esc(name)}.jpg</span><img src="${BASIS}bilder/${esc(name)}.jpg" data-base="${BASIS}bilder/${esc(name)}" alt="${esc(attr(el, "alt", ""))}"${lazy} onerror="kjgBild(this)"></div>`);
  }
  const bildTag = (el, eager) => `<kjg-bild name="${esc(attr(el, "bild", ""))}" alt="${esc(attr(el, "bild-alt", ""))}"${eager ? " eager" : ""}></kjg-bild>`;

  // ---- Sprungmarken --------------------------------------------------------------------------------------
  function sprung(el) {
    const v = attr(el, "variante", "unter");
    const punkte = [...el.querySelectorAll(":scope > a")];
    const eintrag = (a) => `<a href="${esc(a.getAttribute("href"))}">${ICON.runter}<span>${a.innerHTML}</span></a>`;
    const label = T("Inhalt", "Contents");
    if (v === "start") {      // Startseite: freie Positionen (x in px, Zeile r) im Raster
      return vorlage(`<nav class="jump" aria-label="${label}">
  <div class="wrap">
    <ul>
${punkte.map((a) => `      <li class="r${a.getAttribute("r")}" style="--x:${a.getAttribute("x")}px">${eintrag(a)}</li>`).join("\n")}
    </ul>
  </div>
</nav>`);
    }
    if (v === "zela") {
      return vorlage(`<nav class="z-jump" aria-label="${label}">
  <ul>
${punkte.map((a) => `      <li>${eintrag(a)}</li>`).join("\n")}
  </ul>
</nav>`);
    }
    return vorlage(`<section class="jump-section ${esc(attr(el, "klasse", ""))}">
  <div class="container">
    <ul class="jumplinks">
${punkte.map((a) => `      <li>${eintrag(a)}</li>`).join("\n")}
    </ul>
  </div>
</section>`);
  }

  // ---- Kacheln, Karten, Abschnitte ------------------------------------------------------------------------
  // Hilfsfunktion: nimmt die Kinder des Tags (Überschrift, Absätze …) und setzt sie in ein fertiges Gerüst ein
  function mitInhalt(html, el, ziel) {
    const f = vorlage(html);
    f.querySelector(ziel).prepend(...el.childNodes);
    return f;
  }

  function kachel(el) {      // große Petrol-Kachel (Startseite, Angebote, Über uns)
    const f = mitInhalt(`<section class="${esc(attr(el, "klasse", "tile"))}"${idAttr(el)}><div class="text"></div>${bildTag(el)}</section>`.replace('<div class="text">', '<div class="text">'), el, ".text");
    f.querySelector(".text").insertAdjacentHTML("beforeend", `\n    <a class="tile-link" href="${esc(el.getAttribute("href"))}">${ICON.klein}<span>${attr(el, "link", T("genauere infos", "more info"))}</span></a>`);
    return f;
  }

  function eventkachel(el) { // Kachel mit Bild rechts/links in den Übersichten (Angebote, Soziales)
    const f = mitInhalt(`<article class="${esc(attr(el, "klasse", "event-tile"))}"${idAttr(el)}><div class="text"></div>${bildTag(el)}</article>`, el, ".text");
    f.querySelector(".text").insertAdjacentHTML("beforeend", `\n      <a class="more" href="${esc(el.getAttribute("href"))}">${ICON.klein}<span>${attr(el, "link", T("genauere Infos", "more info"))}</span></a>`);
    return f;
  }

  function karte(el) {       // Karte „Unser Angebot für euch“ / „Soziale Aktionen“ auf der Startseite
    const h3 = el.querySelector(":scope > h3");
    const texte = [...el.querySelectorAll(":scope > p")];
    const f = vorlage(`<article class="card">${bildTag(el)}<h3></h3><div class="card-text"></div><a class="more-link" href="${esc(el.getAttribute("href"))}">${ICON.rechts}<span>${attr(el, "link", T("Weitere Informationen", "More information"))}</span></a></article>`);
    f.querySelector("h3").replaceWith(h3);
    f.querySelector(".card-text").append(...texte);
    return f;
  }

  function abschnitt(el) {   // Text mit Bild (Zela, Detailseiten, Über uns)
    const h2 = el.querySelector(":scope > h2");
    const absaetze = [...el.querySelectorAll(":scope > p")];
    const f = vorlage(`<section class="${esc(attr(el, "klasse", "feature"))}"${idAttr(el)}><div class="text"><div class="body"></div></div>${el.hasAttribute("bild") ? bildTag(el) : ""}</section>`);
    f.querySelector(".body").append(...absaetze);
    f.querySelector(".text").prepend(h2);
    return f;
  }

  function person(el) {      // Person im Team
    const bildHtml = el.hasAttribute("bild") ? `<div class="circle">${bildTag(el)}</div>` : "";
    return mitInhalt(`<article class="${esc(attr(el, "klasse", "person"))}">${bildHtml}<div class="text"></div></article>`, el, ".text");
  }

  function zitat(el) {       // Zitat mit rundem Foto
    const p = el.querySelector(":scope > p"), name = el.querySelector(":scope > strong"), rolle = el.querySelector(":scope > span");
    const f = vorlage(`<section class="z-quote ${esc(attr(el, "klasse", "circle-left"))}"><div class="z-quote-inner"><div class="circle"><kjg-bild name="${esc(el.getAttribute("bild"))}" alt="${esc(el.getAttribute("bild-alt"))}" klasse="media round"></kjg-bild></div><blockquote><footer></footer></blockquote></div></section>`);
    f.querySelector("footer").append(name, rolle);
    f.querySelector("blockquote").prepend(p);
    return f;
  }

  function frage(el) {       // FAQ-Eintrag
    const q = el.querySelector(":scope > span"), a = el.querySelector(":scope > p");
    const f = vorlage(`<details class="faq-item"><summary>${ICON.chevron}</summary><div class="answer"></div></details>`);
    f.querySelector("summary").prepend(q);
    f.querySelector(".answer").append(a);
    return f;
  }

  function hero(el) {        // einfacher Seitenkopf mit Hintergrundbild und Titel
    const f = vorlage(`<section class="${esc(attr(el, "klasse", "hero-simple"))}"><kjg-bild name="${esc(el.getAttribute("bild"))}" alt="${esc(el.getAttribute("bild-alt"))}" klasse="hero-bg" eager></kjg-bild></section>`);
    f.querySelector("section").append(el.querySelector(":scope > h1"));
    return f;
  }

  function heroSplit(el) {   // geteilter Seitenkopf: Bild | Petrol-Fläche mit Titel, Text, Button
    const f = vorlage(`<section class="${esc(attr(el, "klasse", "hero-split"))}"><kjg-bild name="${esc(el.getAttribute("bild"))}" alt="${esc(el.getAttribute("bild-alt"))}" eager></kjg-bild><div class="content"></div></section>`);
    f.querySelector(".content").append(...el.childNodes);
    return f;
  }

  // ---- Zahlenband ----------------------------------------------------------------------------------------
  // Drei Kennzahlen wie auf der Team-Seite; die Zahl zählt beim Erscheinen hoch (main.js). icon = Datei in icons/
  const ZAHLEN_ICON = {   // Name → [Datei, Breite, Höhe]
    uhr: ["stat-uhr", 44, 44], haus: ["stat-haus", 44, 44], herz: ["stat-herz", 44, 44], shirt: ["stat-shirt", 44, 44],
    stern: ["stat-stern", 44, 44], kalender: ["stat-kalender", 44, 44], gruppenleiter: ["team-gruppenleiter", 48, 36],
    zelt: ["team-zelte", 42, 33], gruppe: ["team-dioezesanverbaende", 44, 44], kjg: ["team-kjg-seit", 45, 44],
  };
  function zahlen(el) {
    const punkte = [...el.querySelectorAll(":scope > span")];
    const spalte = 1240 / punkte.length;                     // Raster: 1240 px breit, Spalten gleich breit, Inhalt je 300 px breit mittig
    const li = punkte.map((sp, i) => {
      const [datei, w, h] = ZAHLEN_ICON[sp.getAttribute("icon")] || ZAHLEN_ICON.stern;
      return `<li style="left:${(spalte * (i + 0.5) - 150).toFixed(1)}px"><img class="icon" src="${BASIS}icons/${datei}.svg" width="${w}" height="${h}" alt="" style="left:${((300 - w) / 2).toFixed(1)}px;top:${(32 + (44 - h) / 2).toFixed(1)}px"><span class="num">${esc(sp.getAttribute("zahl"))}</span><span class="label">${sp.innerHTML}</span></li>`;
    });
    return vorlage(`<section class="stats stats-${punkte.length}" aria-label="${T("Zahlen", "Figures")}">
  <ul>
    ${li.join("\n    ")}
  </ul>
</section>`);
  }

  // ---- Kontaktband ---------------------------------------------------------------------------------------
  function kontakt() {
    return vorlage(`<section class="kontakt-band" aria-labelledby="kontakt-titel">
  <div class="kontakt-inner">
    <h2 id="kontakt-titel">${T("Habt ihr Fragen oder wollt mitmachen?", "Questions, or want to join in?")}</h2>
    <p>${T("Schreibt uns eine Mail oder meldet euch über Instagram – wir antworten gern und helfen euch weiter.", "Send us an email or get in touch on Instagram – we are happy to answer and help.")}</p>
    <div class="kontakt-btns">
      <a class="btn" href="mailto:${MAIL}">${T("E-Mail", "Email")}</a>
      <a class="btn" href="${INSTAGRAM}" target="_blank" rel="noopener">Instagram</a>
    </div>
  </div>
</section>`);
  }

  // ---- Scroll-Hinweis --------------------------------------------------------------------------------------
  function scrollhinweis() {
    return vorlage(`<div class="scroll-hinweis" aria-hidden="true"><span>${T("Weiter scrollen", "Keep scrolling")}</span><img src="${BASIS}icons/pfeil-unten-weiss.svg" width="14" height="16" alt=""></div>`);
  }

  // ---- Ausführen -----------------------------------------------------------------------------------------
  const MODULE = {
    "kjg-header": header, "kjg-footer": footer, "kjg-bild": bild, "kjg-sprung": sprung, "kjg-kachel": kachel,
    "kjg-eventkachel": eventkachel, "kjg-karte": karte, "kjg-abschnitt": abschnitt, "kjg-person": person,
    "kjg-zitat": zitat, "kjg-zahlen": zahlen, "kjg-kontakt": kontakt, "kjg-scrollhinweis": scrollhinweis, "kjg-frage": frage, "kjg-hero": hero, "kjg-hero-split": heroSplit,
  };
  const SELEKTOR = Object.keys(MODULE).join(",");

  function ausfuehren() {
    // mehrfach, weil Module andere Module enthalten (z. B. Kachel → Bildfläche); die Reihenfolge ist von außen nach innen
    for (let runde = 0; runde < 6; runde++) {
      const tags = document.querySelectorAll(SELEKTOR);
      if (!tags.length) break;
      tags.forEach((el) => { if (el.isConnected) el.replaceWith(MODULE[el.localName](el)); });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ausfuehren);
  else ausfuehren();
})();
