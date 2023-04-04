const HOLIDAY_API = "https://holiday.sanetomore.com/";

fetch(HOLIDAY_API)
  .then((r) => r.json())
  .then((data) => {
    hideLoading();
    const mainDiv = document.querySelector(".main-container");
    renderTitle(mainDiv);
    renderIsHolidayText(mainDiv,data.nextHoliday.isToday);
  })
  .catch((e) => console.log(e));

function renderIsHolidayText(div ,isHoliday) {
  const pTag = document.createElement("p");
  pTag.textContent = isHoliday ? "SI!" : "NO :(";
  pTag.classList.add('is-holiday')
  div.appendChild(pTag)
}

function renderTitle(div) {
  const h1Tag = document.createElement("h1");
  h1Tag.textContent = "¿Es Hoy Festivo en Colombia?";
  div.appendChild(h1Tag);
}

function hideLoading() {
  document.querySelector(".loading").style.display = "none";
}

