const HOLIDAY_API = "https://holiday.sanetomore.com/";

fetch(HOLIDAY_API)
  .then((r) => r.json())
  .then((data) => {
    hideLoading();
    const mainDiv = document.querySelector(".main-container");
    const isHoliday = data.nextHoliday.isToday;
    const daysRemaining = data.nextHoliday.daysUntil;
    const nextDate = data.nextHoliday.date;
    const celebrationName = data.nextHoliday.name;

    renderTitle(mainDiv);
    renderIsHolidayText(mainDiv, isHoliday);
    renderDaysRemaining(mainDiv, isHoliday, daysRemaining);
    renderDescription(mainDiv, isHoliday, nextDate);
    renderCelebration(mainDiv, celebrationName);
  })
  .catch((e) => console.log(e));

function hideLoading() {
  document.querySelector(".loading").style.display = "none";
}
function renderTitle(div) {
  const titleTag = document.createElement("p");
  titleTag.textContent = "¿Es Hoy Festivo en Colombia?";
  titleTag.classList.add("title");
  titleTag.classList.add("yellow");
  div.appendChild(titleTag);
}

function renderIsHolidayText(div, isHoliday) {
  const pTag = document.createElement("p");
  pTag.textContent = isHoliday ? "SI!" : "NO :(";
  pTag.classList.add("normalText");
  pTag.classList.add("blue");
  div.appendChild(pTag);
}

function renderDaysRemaining(div, isHoliday, days) {
  if (isHoliday) {
    return;
  }
  const remainingDays = document.createElement("p");
  remainingDays.textContent = `Aún ${days > 1 ? "Faltan" : "Falta"} ${days} ${
    days > 1 ? "Dias" : "Dia"
  }`;
  remainingDays.classList.add("thin");
  div.appendChild(remainingDays);
}

function formatDateToText(dateStr) {
  const weekdays = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  const months = [
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
  ];

  const date = new Date(dateStr);

  console.log(date);
  const dayOfWeek = weekdays[date.getUTCDay()];
  const dayOfMonth = date.getUTCDate();
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  return `${dayOfWeek}, ${dayOfMonth} de ${month} de ${year}`;
}

function renderDescription(div, isHoliday, festiveDate) {
  if (isHoliday) {
    return;
  }
  const description = document.createElement("p");
  description.textContent = `El próximo festivo es el dia ${formatDateToText(
    festiveDate
  )}`;
  description.classList.add("thin");
  div.appendChild(description);
}

function renderCelebration(div, celebrationName, isHoliday) {
  const celebration = document.createElement("p");
  celebration.textContent = ` ${
    isHoliday ? "Celebramos" : "Celebraremos"
  } ${celebrationName}`;
  celebration.classList.add("normalText");
  celebration.classList.add("red");
  div.appendChild(celebration);
}
