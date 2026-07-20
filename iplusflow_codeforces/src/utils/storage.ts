// src/utils/storage.ts
import type { Problem } from '../types';

/**
 * Retrieves all bookmarked problems from Chrome Storage.
 */
export const getBookmarks = (): Promise<Problem[]> => {
    return new Promise((resolve) => {
        chrome.storage.sync.get({ bookmarks: [] }, (data: { bookmarks?: any[] }) => {
            resolve((data.bookmarks || []) as Problem[]);
        });
    });
};

/**
 * Saves the entire bookmarks array to Chrome Storage.
 */
export const saveBookmarks = (bookmarks: Problem[]): Promise<void> => {
    return new Promise((resolve) => {
        chrome.storage.sync.set({ bookmarks }, () => {
            resolve();
        });
    });
};

/**
 * Adds a new problem to bookmarks if it doesn't already exist.
 */
export const addBookmark = async (problemData: Problem): Promise<{ success: boolean; message: string }> => {
    const bookmarks = await getBookmarks();
    const isAlreadyBookmarked = bookmarks.some((b) => b.url === problemData.url);

    if (isAlreadyBookmarked) {
        return { success: false, message: 'Already bookmarked.' };
    }

    await saveBookmarks([...bookmarks, problemData]);
    return { success: true, message: 'Problem bookmarked!' };
};

/**
 * Removes a problem from bookmarks by exact URL.
 */
export const removeBookmarkByUrl = async (url: string): Promise<{ success: boolean; message: string }> => {
    const bookmarks = await getBookmarks();
    const updatedBookmarks = bookmarks.filter((b) => b.url !== url);

    if (bookmarks.length === updatedBookmarks.length) {
        return { success: false, message: 'This problem is not in your bookmarks.' };
    }

    await saveBookmarks(updatedBookmarks);
    return { success: true, message: 'Removed from bookmarks.' };
};

/**
 * Checks if a URL is bookmarked and whether it is marked as solved.
 */
export const checkUrlBookmarked = async (url: string): Promise<{ bookmarked: Problem | undefined; isSolved: boolean }> => {
    const bookmarks = await getBookmarks();
    const bookmarked = bookmarks.find((b) => b.url === url);
    return { bookmarked, isSolved: !!bookmarked?.solved };
};

/**
 * Updates a bookmark's solved status to true and saves if changed.
 */
export const markBookmarkSolved = async (url: string): Promise<void> => {
    const bookmarks = await getBookmarks();
    const bookmarked = bookmarks.find((b) => b.url === url);
    if (bookmarked && !bookmarked.solved) {
        bookmarked.solved = true;
        await saveBookmarks(bookmarks);
    }
};

/**
 * Saves notes for a specific problem by URL or title.
 */
export const updateProblemNotes = async (identifier: string, notes: string): Promise<Problem[]> => {
    const bookmarks = await getBookmarks();
    const updated = bookmarks.map((prob) => {
        if (prob.url === identifier || prob.title === identifier) {
            return { ...prob, notes };
        }
        return prob;
    });
    await saveBookmarks(updated);
    return updated;
};
