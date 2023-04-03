const HOLIDAY_API = "https://holiday.sanetomore.com/";

fetch(HOLIDAY_API)
  .then((r) => r.json())
  .then((data) => {
    setIsHolidayText(data.nextHoliday.isToday);
  })
  .catch((e) => console.log(e));

  function setIsHolidayText(isHoliday) {
    document.querySelector(".is-holiday").textContent = isHoliday ? "SI!" : "NO :(";
  }
