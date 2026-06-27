import { setupLikeButton } from "./likes.js";
import {
    fetchHtml,
    REFRESH_INTERVAL_MS,
    refreshWhenPageReturns,
} from "./remote-html.js";

const HOLIDAY_LIST_URL = "https://api.diafestivo.co/left";
const LIKE_ICON_HTML = '<img src="../assets/like.png" alt="cheering icon" width="20" height="20">';

const container = document.getElementById("main-container");
const loading = document.getElementById("loading");
const clapsButton = document.getElementById("claps");

function showContent() {
    loading.style.display = "none";
    container.style.display = "block";
    container.classList.add("animation__fade-in");
}

function loadHolidayList(forceRefresh = false) {
    return fetchHtml(HOLIDAY_LIST_URL, forceRefresh)
        .then((html) => {
            showContent();

            const nextHtml = html.trim();
            if (container.innerHTML.trim() !== nextHtml) {
                container.innerHTML = nextHtml;
            }
        })
        .catch((error) => {
            console.error("Holiday list refresh failed:", error);
            if (!container.innerHTML.trim()) {
                showContent();
                container.innerHTML = error;
            }
        });
}

loadHolidayList();
setInterval(() => loadHolidayList(true), REFRESH_INTERVAL_MS);
refreshWhenPageReturns(() => loadHolidayList(true));

setupLikeButton({
    element: clapsButton,
    iconHtml: LIKE_ICON_HTML,
    exposeName: "addLike",
});
