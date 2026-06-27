export const REFRESH_INTERVAL_MS = 144e5;
export const REFRESH_AFTER_HIDDEN_MS = 36e5;

export function fetchHtml(url, forceRefresh = false) {
    const options = forceRefresh ? { cache: "no-store" } : {};

    return fetch(url, options).then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return response.text();
    });
}

export function refreshWhenPageReturns(callback, refreshAfterHiddenMs = REFRESH_AFTER_HIDDEN_MS) {
    let hiddenAt = Date.now();

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            hiddenAt = Date.now();
            return;
        }

        if (Date.now() - hiddenAt > refreshAfterHiddenMs) {
            callback();
        }
    });
}
