// src/utils/api.ts

/**
 * Fetches Codeforces user profile information for a given handle.
 */
export const fetchUserInfo = async (handle: string) => {
    try {
        const response = await fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`);
        const data = await response.json();
        if (data.status !== 'OK') {
            throw new Error(data.comment || 'Handle not found');
        }
        return data.result?.[0] || null;
    } catch (error) {
        console.warn(`Failed to fetch info for ${handle}:`, error);
        return null;
    }
};

/**
 * Fetches the recent submissions for a given Codeforces handle.
 */
export const fetchUserStatus = async (handle: string, count: number = 1000) => {
    try {
        const response = await fetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=${count}`);
        const data = await response.json();
        
        if (data.status !== 'OK') {
            throw new Error(data.comment || 'API request failed');
        }
        
        return data.result || [];
    } catch (error) {
        console.warn(`Failed to fetch status for ${handle}:`, error);
        return [];
    }
};
