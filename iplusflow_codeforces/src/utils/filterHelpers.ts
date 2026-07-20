// src/utils/filterHelpers.ts
import type { Problem } from '../types';

/**
 * Filters a list of problems based on tag search text and rating/solved dropdown option.
 */
export function filterProblems<T extends Problem>(
    problems: T[],
    tagFilterText: string,
    filterOption: string
): T[] {
    const searchLower = tagFilterText.toLowerCase();

    return problems.filter((problem) => {
        // Tag search filter
        const passTag = !searchLower || (problem.tags || []).some(t => t.toLowerCase().includes(searchLower));

        // Rating / solved filter
        let passDropdown = true;
        const r = typeof problem.rating === 'number' ? problem.rating : (parseInt(problem.rating as string, 10) || 0);

        if (filterOption === "<1200") passDropdown = r < 1200;
        else if (filterOption === "1200-1600") passDropdown = r >= 1200 && r <= 1600;
        else if (filterOption === ">1600") passDropdown = r > 1600;
        else if (filterOption === "unsolved") passDropdown = !problem.solved;

        return passTag && passDropdown;
    });
}

/**
 * Sorts problems by title or rating, breaking ties with originalIndex.
 */
export function sortProblems<T extends Problem & { originalIndex: number }>(
    problems: T[],
    sortKey: "title" | "rating" | null,
    sortOrder: "asc" | "desc"
): T[] {
    if (!sortKey) return [...problems];

    const dir = sortOrder === "asc" ? 1 : -1;
    const sorted = [...problems];

    sorted.sort((a, b) => {
        if (sortKey === 'rating') {
            const pa = typeof a.rating === 'number' ? a.rating : (parseInt(a.rating as string, 10) || 0);
            const pb = typeof b.rating === 'number' ? b.rating : (parseInt(b.rating as string, 10) || 0);
            if (pa !== pb) {
                return (pa - pb) * dir;
            }
            return a.originalIndex - b.originalIndex;
        } else {
            const av = (a.title || '').toLowerCase();
            const bv = (b.title || '').toLowerCase();
            if (av < bv) return -1 * dir;
            if (av > bv) return 1 * dir;
            return a.originalIndex - b.originalIndex;
        }
    });

    return sorted;
}
