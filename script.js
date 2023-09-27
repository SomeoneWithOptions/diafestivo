function hideLoading() {
  document.querySelector(".loading").style.display = "none";
}
function renderTitle(e) {
  let t = document.createElement("p");
  (t.textContent = "\xbfEs Hoy Festivo en Colombia?"), t.classList.add("title-text", "yellow-accent"), e.appendChild(t);
}
function renderIsHolidayText(e, t) {
  let n = document.createElement("p");
  (n.textContent = t ? "SI!" : "NO :("), n.classList.add("normal-text", "blue-accent"), e.appendChild(n);
}
function renderDaysRemaining(e, t, n) {
  if (t) return;
  let a = document.createElement("p");
  (a.textContent = `A\xfan ${n > 1 ? "Faltan" : "Falta"} ${n} ${n > 1 ? "D\xedas" : "D\xeda"}`), a.classList.add("thin-text"), e.appendChild(a);
}
function renderDescription(e, t, n) {
  if (t) return;
  let a = document.createElement("p");
  (a.innerHTML = `El pr\xf3ximo festivo es el d\xeda <span class="fecha-letras">${formatDateToText(n)}<span>`), a.classList.add("thin-text"), e.appendChild(a);
}
function renderCelebration(e, t, n) {
  let a = document.createElement("p");
  (a.textContent = ` ${n ? "Celebramos" : "Celebraremos"} ${t}`), a.classList.add("normal-text", "red-accent"), e.appendChild(a);
}
function renderGifElement(e) {
  e &&
    fetch("https://test.diafestivo.co/gif")
      .then((e) => e.text())
      .then((e) => {
        let t = document.querySelector(".main-container"),
          n = document.createElement("div"),
          a = document.createElement("img"),
          i = document.createElement("img");
        (i.src = "./assets/giphyattributionmark.png"), i.classList.add("giphy-attribution-mark"), t.appendChild(i), (a.src = e), n.classList.add("gifContainer"), a.classList.add("gif"), n.appendChild(a), t.appendChild(n);
      });
}
function formatDateToText(e) {
  let t = new Date(e);
  return `${["Domingo", "Lunes", "Martes", "Mi\xe9rcoles", "Jueves", "Viernes", "S\xe1bado"][t.getUTCDay()]}, ${t.getUTCDate()} de ${["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][t.getUTCMonth()]
    } de ${t.getUTCFullYear()}`;
}
fetch("https://test.diafestivo.co/next")
  .then((e) => e.json())
  .then((e) => {
    hideLoading();
    let { name: t, date: n, isToday: a, daysUntil: i } = e,
      r = document.querySelector(".main-container");
    renderTitle(r), renderIsHolidayText(r, a), renderDaysRemaining(r, a, i), renderDescription(r, a, n), renderCelebration(r, t, a), renderGifElement(a);
  })
  .catch((e) => {
    hideLoading();
    let t = document.querySelector(".main-container"),
      n = document.createElement("p");
    (n.textContent = "Error Fetching Data \n" + e), t.appendChild(n);
  });

