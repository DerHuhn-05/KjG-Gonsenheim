/* Startseite: Video spielt automatisch und stumm, hält außerhalb des Bildschirms an; Knopf zum Pausieren/Abspielen */
KJG.beiBereit(() => {
  "use strict";
  const video = document.querySelector(".hero video");
  if (!video) return;
  video.muted = true;                       // stumm ist Voraussetzung für Autoplay auf dem Handy
  video.setAttribute("playsinline", "");
  const starten = () => { const versuch = video.play(); if (versuch && versuch.catch) versuch.catch(() => { /* Autoplay blockiert: Knopf bleibt auf „Abspielen“ */ }); };
  if (KJG.ruhig) video.pause(); else starten();

  let vonHandPausiert = KJG.ruhig;          // außerhalb des Bildschirms anhalten spart Akku – aber nicht wieder starten, wenn jemand pausiert hat
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((eintraege) => {
      if (!eintraege[0].isIntersecting) video.pause();
      else if (!vonHandPausiert) starten();
    }, { threshold: 0 }).observe(video);
  }

  const knopf = document.querySelector(".video-toggle");
  if (!knopf) return;
  const bild = knopf.querySelector("img");
  const anzeigen = () => {
    const pausiert = video.paused;
    bild.src = bild.src.replace(/video-(play|pause)\.svg/, pausiert ? "video-play.svg" : "video-pause.svg");
    knopf.setAttribute("aria-label", pausiert ? KJG.T("Video abspielen", "Play video") : KJG.T("Video pausieren", "Pause video"));
  };
  knopf.addEventListener("click", () => {
    vonHandPausiert = !video.paused;
    if (video.paused) starten(); else video.pause();
  });
  video.addEventListener("play", anzeigen);
  video.addEventListener("pause", anzeigen);
  anzeigen();
});
