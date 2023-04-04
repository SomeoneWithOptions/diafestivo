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
  const h1Tag = document.createElement("h1");
  h1Tag.textContent = "¿Es Hoy Festivo en Colombia?";
  div.appendChild(h1Tag);
}

function renderIsHolidayText(div, isHoliday)
{
  const pTag = document.createElement("p");
  pTag.textContent = isHoliday ? "SI!" : "NO :(";
  pTag.classList.add("normalText");
  div.appendChild(pTag);
}

function renderDaysRemaining(div, isHoliday, days)
{
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
  description.textContent = `El proximo festivo es el dia ${formatDateToText(
    festiveDate
  )}`;
  description.classList.add("normalText");
  div.appendChild(description);
}

function renderCelebration(div, celebrationName, isHoliday) {
  const celebration = document.createElement("p");
  celebration.textContent = ` ${
    isHoliday ? "Celebramos" : "Celebraremos"
  } ${celebrationName}`;
  celebration.classList.add("normalText");
  div.appendChild(celebration);
}
