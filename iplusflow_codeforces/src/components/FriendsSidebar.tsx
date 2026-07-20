import { useEffect, useState, useRef } from 'react';
import { getFriendsList, getFriendsWhoSolved, type FriendSubmission } from '../utils/friendsCode';

interface FriendsSidebarProps {
    contestId: string;
    problemIndex: string;
    onFriendClick: (submissionId: number, handle: string, language?: string) => void;
}

export default function FriendsSidebar({ contestId, problemIndex, onFriendClick }: FriendsSidebarProps) {
    const [friends, setFriends] = useState<FriendSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Prevents state updates if the user navigates away before API calls finish
    const isMounted = useRef(true);

    useEffect(() => {
        const fetchFriendsData = async () => {
            try {
                setIsLoading(true);
                
                // 1. Check Chrome Storage sync for cached friends list first (faster & avoids scraping on every page load)
                const stored = await new Promise<{ cf_friends?: string[] }>((resolve) => {
                    chrome.storage.sync.get({ cf_friends: [] }, resolve);
                });
                
                let friendsList = stored.cf_friends || [];

                if (friendsList.length === 0) {
                    // Fallback to scraping /friends if not cached
                    friendsList = await getFriendsList();
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

    return (
        <div className="cf-friends-sidebar">
            <div className="cf-sidebar-header">
                Friends' Code
            </div>
            
            <div className="cf-sidebar-body">
                {isLoading && (
                    <div className="cf-loading-skeleton">Loading friends...</div>
                )}
                
                {error && (
                    <div className="cf-error">{error}</div>
                )}
                
                {!isLoading && !error && friends.length === 0 && (
                    <div className="cf-empty">No friends have solved this yet.</div>
                )}

                {!isLoading && !error && friends.length > 0 && (
                    <ul className="cf-friends-list">
                        {friends.map((friend) => (
                            <li key={friend.submissionId}>
                                <button 
                                    className="cf-friend-btn"
                                    onClick={() => onFriendClick(friend.submissionId, friend.handle, friend.language)}
                                >
                                    <span className="cf-handle">{friend.handle}</span>
                                    <span className="cf-language">({friend.language})</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}