import { useEffect, useState, useRef } from 'react';
import { getFriendsWhoSolved, type FriendSubmission } from '../utils/friendsCode';
import { fetchFriendsList } from '../utils/scraper';

interface FriendsSidebarProps {
    contestId: string;
    problemIndex: string;
    onFriendClick: (submissionId: number, handle: string, language?: string) => void;
    onSaveToNotes?: (friend: FriendSubmission) => void;
}

export default function FriendsSidebar({ contestId, problemIndex, onFriendClick, onSaveToNotes }: FriendsSidebarProps) {
    const [friends, setFriends] = useState<FriendSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [savedFriends, setSavedFriends] = useState<Set<number>>(new Set());
    
    // Prevents state updates if the user navigates away before API calls finish
    const isMounted = useRef(true);

    useEffect(() => {
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

    const handleSave = (friend: FriendSubmission) => {
        if (savedFriends.has(friend.submissionId)) return;
        onSaveToNotes?.(friend);
        setSavedFriends(prev => new Set(prev).add(friend.submissionId));
    };

    const displayedFriends = isExpanded ? friends : friends.slice(0, 5);

    return (
        <div className="roundbox sidebox" style={{ marginTop: '1em' }}>
            <div className="caption titled">
                → Friends' Submissions
            </div>
            
            <div className="roundbox-body borderBottom" style={{ padding: '0' }}>
                {isLoading && (
                    <div style={{ padding: '8px 10px', fontSize: '11.5px', color: '#666', fontStyle: 'italic' }}>
                        Searching friends' submissions...
                    </div>
                )}
                
                {error && (
                    <div style={{ padding: '8px 10px', fontSize: '11.5px', color: '#b94a48' }}>{error}</div>
                )}
                
                {!isLoading && !error && friends.length === 0 && (
                    <div style={{ padding: '8px 10px', fontSize: '11.5px', color: '#666', fontStyle: 'italic' }}>
                        No friends have solved this problem yet.
                    </div>
                )}

                {!isLoading && !error && friends.length > 0 && (
                    <>
                        <div style={{ maxHeight: isExpanded ? '220px' : 'none', overflowY: isExpanded ? 'auto' : 'visible', overflowX: 'hidden' }}>
                            <table className="rtable" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '11px', margin: '0' }}>
                                <thead>
                                    <tr style={{ background: '#f8f8f8' }}>
                                        <th style={{ width: '28%', padding: '4px 4px', border: '1px solid #e1e1e1', textAlign: 'left', fontWeight: 'bold', color: '#000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Friend</th>
                                        <th style={{ width: '34%', padding: '4px 4px', border: '1px solid #e1e1e1', textAlign: 'left', fontWeight: 'bold', color: '#000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Language</th>
                                        <th style={{ width: '26%', padding: '4px 2px', border: '1px solid #e1e1e1', textAlign: 'center', fontWeight: 'bold', color: '#000' }}>Code</th>
                                        <th style={{ width: '12%', padding: '4px 2px', border: '1px solid #e1e1e1', textAlign: 'center', fontWeight: 'bold', color: '#000' }}>📌</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedFriends.map((friend) => {
                                        const isSaved = savedFriends.has(friend.submissionId);
                                        return (
                                            <tr key={friend.submissionId}>
                                                <td style={{ padding: '3px 4px', border: '1px solid #e1e1e1', background: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    <a 
                                                        href={`https://codeforces.com/profile/${friend.handle}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: '#0000cc', textDecoration: 'none', fontWeight: 'normal' }}
                                                        title={friend.handle}
                                                    >
                                                        {friend.handle}
                                                    </a>
                                                </td>
                                                <td style={{ padding: '3px 4px', border: '1px solid #e1e1e1', color: '#333', background: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={friend.language || 'C++'}>
                                                    {friend.language || 'C++'}
                                                </td>
                                                <td style={{ padding: '3px 2px', border: '1px solid #e1e1e1', textAlign: 'center', background: '#fff' }}>
                                                    <a 
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            onFriendClick(friend.submissionId, friend.handle, friend.language);
                                                        }}
                                                        style={{ color: '#003399', fontWeight: 'bold', textDecoration: 'underline', fontSize: '10.5px', whiteSpace: 'nowrap' }}
                                                        title={`Click to view ${friend.handle}'s source code`}
                                                    >
                                                        Show Code
                                                    </a>
                                                </td>
                                                <td style={{ padding: '2px 2px', border: '1px solid #e1e1e1', textAlign: 'center', background: '#fff' }}>
                                                    {isSaved ? (
                                                        <span 
                                                            style={{ color: '#0a0', fontSize: '13px', cursor: 'default' }}
                                                            title="Saved to notes"
                                                        >✓</span>
                                                    ) : (
                                                        <a
                                                            href="#"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleSave(friend);
                                                            }}
                                                            style={{ 
                                                                color: '#666', 
                                                                textDecoration: 'none', 
                                                                fontSize: '11px',
                                                                cursor: 'pointer'
                                                            }}
                                                            title={`Save ${friend.handle}'s solution reference to your notes`}
                                                        >
                                                            Save
                                                        </a>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {friends.length > 5 && (
                            <div style={{ padding: '5px 8px', background: '#f8f8f8', borderTop: '1px solid #e1e1e1', textAlign: 'center' }}>
                                <a 
                                    href="#" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setIsExpanded(!isExpanded);
                                    }}
                                    style={{ fontSize: '11px', color: '#003399', fontWeight: 'normal', textDecoration: 'underline' }}
                                >
                                    {isExpanded ? 'Show top 5 ▲' : `Show all ${friends.length} friends ▼`}
                                </a>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}