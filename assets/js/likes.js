const DEFAULT_LIKES_URL = "https://likes.diafestivo.co";

const toNumber = (value) => Number(value);

export function setupLikeButton({
    element,
    iconHtml,
    likesUrl = DEFAULT_LIKES_URL,
    renderHtml = (count) => `${count} ${iconHtml}`,
    fallbackCount = 0,
    exposeName = null,
}) {
    if (!element) {
        return null;
    }

    let latestCount = 0;

    const renderCount = (count) => {
        const numericCount = toNumber(count);

        if (Number.isFinite(numericCount)) {
            latestCount = Math.max(latestCount, numericCount);
            element.innerHTML = renderHtml(latestCount, iconHtml);
            return;
        }

        element.innerHTML = renderHtml(count, iconHtml);
    };

    const playAnimation = () => {
        element.classList.remove("jump");
        void element.offsetWidth;
        element.classList.add("jump");
    };

    const addLike = () => {
        playAnimation();

        fetch(likesUrl, { method: "POST" })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                return response.text();
            })
            .then(renderCount)
            .catch((error) => {
                console.error("Like update failed:", error);
            });
    };

    element.addEventListener("click", addLike);

    fetch(likesUrl, { cache: "no-store" })
        .then((response) => response.text())
        .then(renderCount)
        .catch(() => {
            element.innerHTML = renderHtml(fallbackCount, iconHtml);
        });

    if (exposeName) {
        window[exposeName] = addLike;
    }

    return { addLike, renderCount };
}
