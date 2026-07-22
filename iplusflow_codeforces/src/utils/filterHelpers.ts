// src/utils/filterHelpers.ts
import type { Problem } from '../types';

/**
 * Filters a list of problems based on tag search text and rating/solved dropdown option.
 */
export function filterProblems<T extends Problem>(
    problems: T[],
    tagFilterText: string,
    filterOption: string,
    selectedTags: string[] = []
): T[] {
    const searchLower = tagFilterText.trim().toLowerCase();

    return problems.filter((problem) => {
        const problemTags = (problem.tags || []).map(t => t.toLowerCase());

        // Every tag pill added must be present in the problem's tags (substring match)
        const passSelectedTags = selectedTags.every(chip => 
            problemTags.some(t => t.includes(chip.toLowerCase()))
        );

        // Any text currently being typed in the search box must also match
        const passText = !searchLower || problemTags.some(t => t.includes(searchLower));

        let passDropdown = true;
        const r = Number(problem.rating) || 0;

        if (filterOption === "<1200") passDropdown = r < 1200;
        else if (filterOption === "1200-1600") passDropdown = r >= 1200 && r <= 1600;
        else if (filterOption === ">1600") passDropdown = r > 1600;
        else if (filterOption === "unsolved") passDropdown = !problem.solved;

        return passSelectedTags && passText && passDropdown;
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
            const pa = Number(a.rating) || 0;
            const pb = Number(b.rating) || 0;
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
