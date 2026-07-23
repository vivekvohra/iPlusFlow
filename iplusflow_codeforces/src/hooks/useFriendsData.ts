// hooks/useFriendsData.ts
// Custom hook to fetch and cache friends' solved submissions for a given contest/problem.

import { useEffect, useRef, useState } from 'react';
import { getFriendsWhoSolved } from '../utils/friendsCode';
import { fetchFriendsList } from '../utils/scraper';
import type { FriendSubmission } from '../types';

export function useFriendsData(contestId: string, problemIndex: string) {
    const [friends, setFriends] = useState<FriendSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        const fetchFriendsData = async () => {
            try {
                setIsLoading(true);

                // 1. Check Chrome Storage sync for cached friends list first
                const stored = await new Promise<{ cf_friends?: string[] }>((resolve) => {
                    chrome.storage.sync.get({ cf_friends: [] }, resolve);
                });

                let friendsList = stored.cf_friends || [];

                if (friendsList.length === 0) {
                    // Fallback to scraping /friends if not cached
                    friendsList = await fetchFriendsList();
                    if (friendsList.length > 0) {
                        const capped = friendsList.slice(0, 20);
                        chrome.storage.sync.set({ cf_friends: capped, cf_friends_count: capped.length });
                        friendsList = capped;
                    }
                }

                if (friendsList.length === 0) {
                    if (isMounted.current) setIsLoading(false);
                    return;
                }

                // 2. Query the API (with local cache check) to see who solved it
                const solvedFriends = await getFriendsWhoSolved(contestId, problemIndex, friendsList);

                if (isMounted.current) {
                    setFriends(solvedFriends);
                    setIsLoading(false);
                }
            } catch (err) {
                if (isMounted.current) {
                    setError('Failed to load friends data.');
                    setIsLoading(false);
                }
            }
        };

        fetchFriendsData();

        return () => {
            isMounted.current = false;
        };
    }, [contestId, problemIndex]);

    return { friends, isLoading, error };
}
