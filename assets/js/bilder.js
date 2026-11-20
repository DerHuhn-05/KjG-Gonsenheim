// Lädt Bilder aus dem Ordner bilder/. Fehlt die .jpg-Datei, werden
// .jpeg, .png und .webp probiert. Gibt es keine, bleibt der graue
// Platzhalter mit dem erwarteten Dateinamen sichtbar.
window.kjgBild = function (img) {
  var endungen = ["jpg", "jpeg", "png", "webp"];
  var i = Number(img.getAttribute("data-try") || 0) + 1;
  if (i < endungen.length) {
    img.setAttribute("data-try", i);
    img.src = img.getAttribute("data-base") + "." + endungen[i];
  } else {
    img.remove();
  }
};
