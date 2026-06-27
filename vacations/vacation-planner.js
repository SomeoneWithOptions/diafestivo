import { setupLikeButton } from "../assets/js/likes.js";
import { computeCandidates, parseIsoUtc } from "./optimizer.js";

const COLOMBIA_TIMEZONE = "America/Bogota";
const startInput = document.getElementById("start");
const endInput = document.getElementById("end");
const form = document.getElementById("vacForm");
const daysInput = document.getElementById("vacDays");
const includeSaturdaysInput = document.getElementById("includeSaturdays");
const results = document.getElementById("results");
const submitBtn = form.querySelector("button[type='submit']");

daysInput.addEventListener("keydown", (e) => {
    if (["e", "E", "+", "-", ".", ","].includes(e.key)) {
        e.preventDefault();
    }
});

daysInput.addEventListener("input", () => {
    daysInput.classList.remove("input-error");
    daysInput.removeAttribute("aria-invalid");
});

const getTodayIsoInTimezone = (timeZone) => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const lookup = {};
    parts.forEach((part) => {
        lookup[part.type] = part.value;
    });

    return `${lookup.year}-${lookup.month}-${lookup.day}`;
};

const todayIso = getTodayIsoInTimezone(COLOMBIA_TIMEZONE);
const todayDateUtc = parseIsoUtc(todayIso);
const defaultYear =
    todayDateUtc.getUTCMonth() > 9
        ? todayDateUtc.getUTCFullYear() + 1
        : todayDateUtc.getUTCFullYear();

endInput.value = `${defaultYear}-12-31`;
startInput.value = todayIso;
daysInput.value = "";
results.setAttribute("aria-busy", "false");

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
    timeZone: "UTC",
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
});

const formatDateCompact = (iso) => dateFormatter.format(parseIsoUtc(iso));

const createDateTag = (iso) => {
    const time = document.createElement("time");
    time.dateTime = iso;
    time.textContent = formatDateCompact(iso);
    return time;
};

const createStat = (label, value, theme = null) => {
    const stat = document.createElement("div");
    stat.className = "result-stat";
    if (theme) {
        stat.classList.add(`result-stat--${theme}`);
    }

    const statValue = document.createElement("span");
    statValue.className = "result-stat-value";
    statValue.textContent = value;

    const statLabel = document.createElement("span");
    statLabel.className = "result-stat-label";
    statLabel.textContent = label;

    stat.append(statValue, statLabel);
    return stat;
};

const renderValidationMessage = (message, type = "error") => {
    results.innerHTML = "";
    const status = document.createElement("p");
    status.className = `result-message result-message--${type}`;
    status.textContent = message;
    results.appendChild(status);
};

const renderMainResult = (item, vacationDays) => {
    const hero = document.createElement("article");
    hero.className = "result-hero";

    const eyebrow = document.createElement("p");
    eyebrow.className = "result-eyebrow";
    eyebrow.textContent = "Mejor opción";

    const range = document.createElement("p");
    range.className = "result-range";
    range.append(
        createDateTag(item.startIso),
        Object.assign(document.createElement("span"), {
            className: "result-range-separator",
            textContent: "→",
        }),
        createDateTag(item.endIso)
    );

    const stats = document.createElement("div");
    stats.className = "result-stats";
    const extraDays = Math.max(item.totalDays - vacationDays, 0);
    stats.append(
        createStat("Descanso total", `${item.totalDays} días`, "total"),
        createStat("Vacaciones usadas", `${vacationDays} días`),
        createStat("Días extra", `${extraDays} días`, "extra")
    );

    hero.append(eyebrow, range, stats);
    results.appendChild(hero);
};

const renderSecondaryResults = (items, vacationDays) => {
    if (!items.length) {
        return;
    }

    const details = document.createElement("details");
    details.className = "results-details";

    const summary = document.createElement("summary");
    summary.className = "results-summary";
    summary.textContent = "Más resultados";
    details.appendChild(summary);

    const list = document.createElement("ol");
    list.className = "results-list";

    items.slice(0, 10).forEach((item) => {
        const row = document.createElement("li");
        row.className = "results-item";

        const range = document.createElement("p");
        range.className = "results-item-range";
        range.append(
            createDateTag(item.startIso),
            Object.assign(document.createElement("span"), {
                className: "result-range-separator",
                textContent: "→",
            }),
            createDateTag(item.endIso)
        );

        const extraDays = Math.max(item.totalDays - vacationDays, 0);
        const meta = document.createElement("div");
        meta.className = "results-item-badges";
        
        const badgeTotal = document.createElement("span");
        badgeTotal.className = "badge badge--total";
        badgeTotal.textContent = `${item.totalDays} descanso`;
        
        const badgeVac = document.createElement("span");
        badgeVac.className = "badge badge--vac";
        badgeVac.textContent = `${vacationDays} vac.`;
        
        const badgeExtra = document.createElement("span");
        badgeExtra.className = "badge badge--extra";
        badgeExtra.textContent = `+${extraDays} extra`;

        meta.append(badgeTotal, badgeVac, badgeExtra);

        row.append(range, meta);
        list.appendChild(row);
    });

    details.appendChild(list);
    results.appendChild(details);
};

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const vacationDays = parseInt(daysInput.value, 10);
    const startIso = startInput.value;
    const endIso = endInput.value;
    const includeSaturdays = includeSaturdaysInput.checked;

    if (!vacationDays || Number.isNaN(vacationDays) || vacationDays < 1) {
        daysInput.classList.add("input-error");
        daysInput.setAttribute("aria-invalid", "true");
        renderValidationMessage("Ingresa un número válido de días mayor a 0.");
        return;
    }

    if (!startIso || !endIso) {
        renderValidationMessage("Selecciona una fecha de inicio y fin.");
        return;
    }

    if (startIso > endIso) {
        renderValidationMessage("La fecha de inicio debe ser anterior a la fecha final.");
        return;
    }

    results.innerHTML = "";
    submitBtn.disabled = true;
    submitBtn.textContent = "Calculando...";
    results.setAttribute("aria-busy", "true");

    try {
        const startYear = Number(startIso.slice(0, 4));
        const endYear = Number(endIso.slice(0, 4));
        const years = [...Array(endYear - startYear + 1)].map((_, index) => startYear + index);

        const holidaySet = new Set();
        for (const year of years) {
            const data = await fetch(`https://api.diafestivo.co/make?year=${year}`)
                .then((response) => response.json())
                .catch(() => []);

            (data.holidays || data).forEach((holiday) => {
                const holidayIso = String(holiday.date).slice(0, 10);
                if (holidayIso >= startIso && holidayIso <= endIso) {
                    holidaySet.add(holidayIso);
                }
            });
        }

        const candidates = computeCandidates({
            startIso,
            endIso,
            vacationDays,
            holidaySet,
            includeSaturdays,
        });

        if (!candidates.length) {
            renderValidationMessage("No encontramos combinaciones en ese rango. Prueba con otras fechas.", "warning");
            return;
        }

        results.innerHTML = "";
        renderMainResult(candidates[0], vacationDays);
        renderSecondaryResults(candidates.slice(1), vacationDays);
    } catch (error) {
        renderValidationMessage("No se pudo completar el cálculo en este momento. Intenta nuevamente.", "warning");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Calcular";
        results.setAttribute("aria-busy", "false");
    }
});

const clapsButton = document.getElementById("claps");
const likeIconHtml = '<img class="vac-footer__icon" src="../assets/like.png" alt="cheering icon" width="20" height="20">';

setupLikeButton({
    element: clapsButton,
    iconHtml: likeIconHtml,
    renderHtml: (count, iconHtml) => `<span class="vac-footer__count">${count}</span> ${iconHtml}`,
    exposeName: "addLike",
});
