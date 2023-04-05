
const HOLIDAY_API = "https://api.diafestivo.co/";

fetch(HOLIDAY_API)
  .then((r) => r.json())
  .then((data) => {
    hideLoading();
    const mainContainer = document.querySelector(".main-container");
    const isHoliday = data.nextHoliday.isToday;
    const daysRemaining = data.nextHoliday.daysUntil;
    const nextDate = data.nextHoliday.date;
    const celebrationName = data.nextHoliday.name;

    renderTitle(mainContainer);
    renderIsHolidayText(mainContainer, isHoliday);
    renderDaysRemaining(mainContainer, isHoliday, daysRemaining);
    renderDescription(mainContainer, isHoliday, nextDate);
    renderCelebration(mainContainer, celebrationName);
    renderGifElement(isHoliday);
  })
  .catch((e) => console.log(e));

function hideLoading() {
  document.querySelector(".loading").style.display = "none";
}

function renderTitle(div) {
  const title = "¿Es Hoy Festivo en Colombia?";
  const titleTag = document.createElement("p");
  titleTag.textContent = title;
  titleTag.classList.add("title", "yellow");
  div.appendChild(titleTag);
}

function renderIsHolidayText(div, isHoliday) {
  const text = isHoliday ? "SI!" : "NO :(";
  const isHolidayTag = document.createElement("p");
  isHolidayTag.textContent = text;
  isHolidayTag.classList.add("normalText", "blue");
  div.appendChild(isHolidayTag);
}

function renderDaysRemaining(div, isHoliday, days) {
  if (isHoliday) {
    return;
  }
  const remainingDays = document.createElement("p");
  remainingDays.textContent = `Aún ${days > 1 ? "Faltan" : "Falta"} ${days} ${
    days > 1 ? "Días" : "Día"
  }`;
  remainingDays.classList.add("thin");
  div.appendChild(remainingDays);
}

function renderDescription(div, isHoliday, festiveDate) {
  if (isHoliday) {
    return;
  }
  const description = document.createElement("p");
  description.textContent = `El próximo festivo es el día ${formatDateToText(
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
  celebration.classList.add("normalText", "red");
  div.appendChild(celebration);
}

function renderGifElement(isHoliday) {
  if (!isHoliday) return;
  const GIPHY_KEY = process.env.GIPHY_KEY;
  const GIPHY_QUERY = `https://api.giphy.com/v1/gifs/random?api_key=${GIPHY_KEY}&tag=dancing&rating=g`;

  fetch(GIPHY_QUERY)
    .then((r) => r.json())
    .then((data) => {
      const mainContainer = document.querySelector(".main-container");
      const gifContainer = document.createElement("div");

      const gifElement = document.createElement("img");
      gifElement.src = data.data.images.original.url;
      gifContainer.classList.add("gifContainer");
      gifElement.classList.add("gif");
      gifContainer.appendChild(gifElement);
      mainContainer.appendChild(gifContainer);
    });
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

  const dayOfWeek = weekdays[date.getUTCDay()];
  const dayOfMonth = date.getUTCDate();
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  return `${dayOfWeek}, ${dayOfMonth} de ${month} de ${year}`;
}


console.log(process.env.GIPHY_KEY)