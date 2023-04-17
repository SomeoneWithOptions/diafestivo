const HOLIDAY_API = "https://api.diafestivo.co/",
  GIF_API = "https://api.diafestivo.co/gif";
function hideLoading() {
  document.querySelector(".loading").style.display = "none";
}
function renderTitle(e) {
  let t = document.createElement("p");
  (t.textContent = "\xbfEs Hoy Festivo en Colombia?"),
    t.classList.add("title-text", "yellow-accent"),
    e.appendChild(t);
}
function renderIsHolidayText(e, t) {
  let n = document.createElement("p");
  (n.textContent = t ? "SI!" : "NO :("),
    n.classList.add("normal-text", "blue-accent"),
    e.appendChild(n);
}
function renderDaysRemaining(e, t, n) {
  if (t) return;
  let a = document.createElement("p");
  (a.textContent = `A\xfan ${n > 1 ? "Faltan" : "Falta"} ${n} ${
    n > 1 ? "D\xedas" : "D\xeda"
  }`),
    a.classList.add("thin-text"),
    e.appendChild(a);
}
function renderDescription(e, t, n) {
  if (t) return;
  let a = document.createElement("p");
  (a.innerHTML = `El pr\xf3ximo festivo es el d\xeda <span class="fecha-letras">${formatDateToText(
    n
  )}<span>`),
    a.classList.add("thin-text"),
    e.appendChild(a);
}
function renderCelebration(e, t, n) {
  let a = document.createElement("p");
  (a.textContent = ` ${n ? "Celebramos" : "Celebraremos"} ${t}`),
    a.classList.add("normal-text", "red-accent"),
    e.appendChild(a);
}
function renderGifElement(e) {
  e &&
    fetch("https://api.diafestivo.co/gif")
      .then((e) => e.text())
      .then((e) => {
        let t = document.querySelector(".main-container"),
          n = document.createElement("div"),
          a = document.createElement("img");
        (a.src = e),
          n.classList.add("gifContainer"),
          a.classList.add("gif"),
          n.appendChild(a),
          t.appendChild(n);
      });
}
function formatDateToText(e) {
  let t = new Date(e),
    n = [
      "Domingo",
      "Lunes",
      "Martes",
      "Mi\xe9rcoles",
      "Jueves",
      "Viernes",
      "S\xe1bado",
    ][t.getUTCDay()],
    a = t.getUTCDate(),
    i;
  return `${n}, ${a} de ${
    [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ][t.getUTCMonth()]
  } de ${t.getUTCFullYear()}`;
}

fetch("https://api.diafestivo.co/next")
  .then((e) => e.json())
  .then((nextHolidayData) => {
    hideLoading();
    const { name, date, isToday, daysUntil } = nextHolidayData;
    const mainContainer = document.querySelector(".main-container");
    renderTitle(mainContainer);
    renderIsHolidayText(mainContainer, isToday);
    renderDaysRemaining(mainContainer, isToday, daysUntil);
    renderDescription(mainContainer, isToday, date);
    renderCelebration(mainContainer, name, isToday);
    renderGifElement(isToday);
  })
    .catch((e) =>
    { 
        const mainContainer = document.querySelector(".main-container");
        const errorDisplay = document.createElement("p");
        errorDisplay.textContent = "Error Fetching Data \n" + e;
        mainContainer.appendChild(errorDisplay);
    });
