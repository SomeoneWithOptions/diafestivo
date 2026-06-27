import { setupLikeButton } from "./likes.js";
import {
    fetchHtml,
    REFRESH_INTERVAL_MS,
    refreshWhenPageReturns,
} from "./remote-html.js";

const TEMPLATE_URL = "https://api.diafestivo.co/template";
const LIKE_ICON_HTML = '<img src="./assets/like.png" alt="contact icon" width="20px" height="20px">';

const container = document.getElementById("main-container");
const loading = document.getElementById("loading");
const likeButton = document.getElementById("like");

function refreshTemplate(forceRefresh = false) {
    return fetchHtml(TEMPLATE_URL, forceRefresh)
        .then((html) => {
            const nextHtml = html.trim();
            if (container.innerHTML.trim() !== nextHtml) {
                container.innerHTML = nextHtml;
            }
        })
        .catch((error) => {
            console.error("Template refresh failed:", error);
        });
}

fetch(TEMPLATE_URL)
    .then((response) => response.text())
    .then((html) => {
        loading.style.display = "none";
        container.style.display = "flex";
        container.classList.add("animation__fade-in");
        container.innerHTML = html;
    })
    .catch((error) => {
        container.innerHTML = error;
    });

setupLikeButton({
    element: likeButton,
    iconHtml: LIKE_ICON_HTML,
    exposeName: "addLike",
});

setInterval(() => refreshTemplate(true), REFRESH_INTERVAL_MS);
refreshWhenPageReturns(() => refreshTemplate(true));
