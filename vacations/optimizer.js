/**
 * @typedef {Object} VacationCandidate
 * @property {string} startIso
 * @property {string} endIso
 * @property {number} totalDays
 */

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const parseIsoUtc = (iso) => {
    if (!ISO_DATE_RE.test(iso)) {
        throw new Error(`Invalid ISO date: ${iso}`);
    }

    const [year, month, day] = iso.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
};

export const toIsoUtc = (date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const nextUtcDay = (date) => {
    const next = new Date(date.getTime());
    next.setUTCDate(next.getUTCDate() + 1);
    return next;
};

export const isNonWorkingDay = (dateUtc, holidaySet) => {
    const weekday = dateUtc.getUTCDay();
    const iso = toIsoUtc(dateUtc);
    return weekday === 0 || weekday === 6 || holidaySet.has(iso);
};

const buildUtcDateRange = (startIso, endIso) => {
    const startDate = parseIsoUtc(startIso);
    const endDate = parseIsoUtc(endIso);
    const rangeDates = [];

    for (let day = startDate; day <= endDate; day = nextUtcDay(day)) {
        rangeDates.push(day);
    }

    return rangeDates;
};

const countWorkingDays = (rangeDates, holidaySet) =>
    rangeDates.reduce(
        (count, day) => (isNonWorkingDay(day, holidaySet) ? count : count + 1),
        0
    );

/**
 * @param {{startIso: string, endIso: string, vacationDays: number, holidaySet: Set<string>}} params
 * @returns {VacationCandidate[]}
 */
export const computeCandidates = ({ startIso, endIso, vacationDays, holidaySet }) => {
    if (!Number.isInteger(vacationDays) || vacationDays <= 0) {
        return [];
    }

    if (!ISO_DATE_RE.test(startIso) || !ISO_DATE_RE.test(endIso) || startIso > endIso) {
        return [];
    }

    const rangeDates = buildUtcDateRange(startIso, endIso);
    if (countWorkingDays(rangeDates, holidaySet) < vacationDays) {
        return [];
    }

    /** @type {VacationCandidate[]} */
    const candidates = [];

    for (let index = 0; index < rangeDates.length; index++) {
        if (isNonWorkingDay(rangeDates[index], holidaySet)) {
            continue;
        }

        let usedDays = 0;
        let runner = index;

        for (; runner < rangeDates.length && usedDays < vacationDays; runner++) {
            if (!isNonWorkingDay(rangeDates[runner], holidaySet)) {
                usedDays += 1;
            }
        }

        if (usedDays < vacationDays) {
            break;
        }

        let startIndex = index;
        let endIndex = runner - 1;

        while (
            startIndex > 0 &&
            isNonWorkingDay(rangeDates[startIndex - 1], holidaySet)
        ) {
            startIndex -= 1;
        }

        while (
            endIndex < rangeDates.length - 1 &&
            isNonWorkingDay(rangeDates[endIndex + 1], holidaySet)
        ) {
            endIndex += 1;
        }

        candidates.push({
            startIso: toIsoUtc(rangeDates[startIndex]),
            endIso: toIsoUtc(rangeDates[endIndex]),
            totalDays: endIndex - startIndex + 1,
        });
    }

    candidates.sort(
        (left, right) =>
            right.totalDays - left.totalDays ||
            left.startIso.localeCompare(right.startIso)
    );

    const deduped = [];
    const seen = new Set();

    for (const candidate of candidates) {
        const key = `${candidate.startIso}|${candidate.endIso}`;
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        deduped.push(candidate);
    }

    return deduped;
};
