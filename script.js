const HOLIDAY_API = "https://holiday.sanetomore.com/";

fetch(HOLIDAY_API)
  .then((r) => r.json())
  .then((data) => {
    hideLoading();
    const mainDiv = document.querySelector(".main-container");
    const isHoliday = data.nextHoliday.isToday;
    const daysRemaining = data.nextHoliday.daysUntil;
    renderTitle(mainDiv);
    renderIsHolidayText(mainDiv, isHoliday);
    renderDaysRemaining(mainDiv, isHoliday, daysRemaining);
  })
  .catch((e) => console.log(e));

function hideLoading() {
  document.querySelector(".loading").style.display = "none";
}

function renderIsHolidayText(div, isHoliday) {
  const pTag = document.createElement("p");
  pTag.textContent = isHoliday ? "SI!" : "NO :(";
  pTag.classList.add("normalText");
  div.appendChild(pTag);
}

function renderTitle(div) {
  const h1Tag = document.createElement("h1");
  h1Tag.textContent = "¿Es Hoy Festivo en Colombia?";
  div.appendChild(h1Tag);
}

function renderDaysRemaining(div, isHoliday, days) {
  if (isHoliday) {
    return;
  }
  const remainingDays = document.createElement("p");
  remainingDays.textContent = `Aun ${days > 1 ? "Faltan" : "Falta"} ${days} ${
    days > 1 ? "Dias" : "Dia"
  }`;
  remainingDays.classList.add("normalText");
  div.appendChild(remainingDays);
}

function renderDescription(div, isHoliday) {}
