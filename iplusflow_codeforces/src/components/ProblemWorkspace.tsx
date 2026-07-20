import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./ProblemWorkspace.css";
import {
  findCodeforcesContainers,
  removeCodeforcesContainers,
  type InjectionContainers,
} from "../utils/domHelpers";

import { extractProblemData, getCurrentProblemKey, getUsername } from "../utils/scraper";
import { fetchUserStatus } from "../utils/api";
import { addBookmark, removeBookmarkByUrl, checkUrlBookmarked, markBookmarkSolved, updateProblemNotes } from "../utils/storage";
import { getUserStreak, type StreakInfo } from "../utils/streak";
import type { Problem } from "../types";
import FriendsSidebar from "./FriendsSidebar";
import CodeModal from "./CodeModal";
import NotesModal from "./NotesModal";
import StreakBadge from "./StreakBadge";

export default function ProblemWorkspace() {
    const [handle, setHandle] = useState<string | null>(null);
    const [isCheckingHandle, setIsCheckingHandle] = useState(true);
    const [containers, setContainers] = useState<InjectionContainers>({});
    const [isSolved, setIsSolved] = useState(false);
    const [showTags, setShowTags] = useState(false);
    const isMounted = useRef(true);

    const [activeSubmission, setActiveSubmission] = useState<{id: number, handle: string, language?: string} | null>(null);

    // Notes Modal State for page-level ADD NOTE tab
    const [isNotesOpen, setIsNotesOpen] = useState(false);
    const [noteText, setNoteText] = useState("");
    const [currentProblemObj, setCurrentProblemObj] = useState<Problem | null>(null);

    // Streak State
    const [streakInfo, setStreakInfo] = useState<StreakInfo>({ currentStreak: 0, longestStreak: 0, lastSolvedDate: null });

    // Extract contestId and problemIndex for the Sidebar props
    const problemKey = getCurrentProblemKey();
    const [contestId, problemIndex] = problemKey ? problemKey.split('-') : [null, null];

    // 1. Verify if user is logged in (has cf_handle saved in extension storage)
    useEffect(() => {
        isMounted.current = true;
        
        chrome.storage.sync.get("cf_handle", (data) => {
            if (!isMounted.current) return;
            const savedHandle = typeof data.cf_handle === "string" ? data.cf_handle.trim() : "";
            setHandle(savedHandle || null);
            setIsCheckingHandle(false);
        });

        const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
            if (areaName === "sync" && changes.cf_handle) {
                const newHandle = typeof changes.cf_handle.newValue === "string" ? changes.cf_handle.newValue.trim() : "";
                if (isMounted.current) {
                    setHandle(newHandle || null);
                }
            }
        };

        chrome.storage.onChanged.addListener(handleStorageChange);
        return () => {
            isMounted.current = false;
            chrome.storage.onChanged.removeListener(handleStorageChange);
        };
    }, []);

    // 2. Initialize DOM containers ONLY if user is logged in (handle exists)
    useEffect(() => {
        if (!handle) {
            setContainers({});
            return;
        }

        const newContainers = findCodeforcesContainers();

        queueMicrotask(() => {
            if (isMounted.current) {
                setContainers(newContainers);
            }
        });

        // Cleanup containers when component unmounts or handle is removed
        return () => {
            removeCodeforcesContainers(newContainers);
        };
    }, [handle]);

    // 3. Check solved status & fetch streak ONLY if user is logged in
    useEffect(() => {
        if (!handle) return;

        getUserStreak(handle).then((info) => {
            if (isMounted.current) {
                setStreakInfo(info);
            }
        });

        const checkSolvedStatus = async () => {
            const problemKey = getCurrentProblemKey();
            const username = getUsername() || handle;
            if (!problemKey || !username) return;

            const [contestId, problemIndex] = problemKey.split('-');
            const currentUrl = window.location.href;

            // Check Chrome Storage first
            const { bookmarked, isSolved: cachedSolved } = await checkUrlBookmarked(currentUrl);
            if (cachedSolved) {
                if (isMounted.current) setIsSolved(true);
                return;
            }

            // If not cached as solved, query Codeforces API
            try {
                const submissions = await fetchUserStatus(username, 1000);
                if (submissions && submissions.length > 0) {
                    const hasSolved = submissions.some((sub: any) => 
                        sub.verdict === 'OK' &&
                        String(sub.problem.contestId) === contestId &&
                        sub.problem.index === problemIndex
                    );

                    if (hasSolved) {
                        if (isMounted.current) setIsSolved(true);
                        if (bookmarked) {
                            await markBookmarkSolved(currentUrl);
                        }
                    }
                }
            } catch (e) {
                console.warn('API fetch error:', e);
            }
        };

        checkSolvedStatus();
    }, [handle]);

    // 4. Sync tag visibility with the Codeforces DOM ONLY if logged in
    useEffect(() => {
        if (!handle) return;
        const tagBadges = document.querySelectorAll('.tag-box');
        tagBadges.forEach((badge) => {
            (badge as HTMLElement).style.display = showTags ? '' : 'none';
        });
    }, [showTags, handle]);

    const handleBookmark = async () => {
        const problemData = extractProblemData();
        if (!problemData) {
            console.warn("Could not extract problem data.");
            return;
        }
        if (isSolved) {
            problemData.solved = true;
        }
        const result = await addBookmark(problemData);
        alert(result.message);
    };

    const handleRemove = async () => {
        const result = await removeBookmarkByUrl(window.location.href);
        alert(result.message);
    };

    const handleOpenNotesModal = async () => {
        const currentUrl = window.location.href;
        const problemData = extractProblemData();
        const title = problemData?.title || "Current Problem";

        const problemObj: Problem = {
            title,
            url: currentUrl,
            solved: isSolved,
            rating: problemData?.rating || 0,
            tags: problemData?.tags || [],
            notes: ""
        };

        const { bookmarked } = await checkUrlBookmarked(currentUrl);
        if (bookmarked && bookmarked.notes) {
            problemObj.notes = bookmarked.notes;
        }

        setCurrentProblemObj(problemObj);
        setNoteText(problemObj.notes || "");
        setIsNotesOpen(true);
    };

    const handleSaveNote = async () => {
        if (!currentProblemObj) return;
        const currentUrl = window.location.href;
        const { bookmarked } = await checkUrlBookmarked(currentUrl);

        if (!bookmarked) {
            const problemData = extractProblemData();
            if (problemData) {
                problemData.solved = isSolved;
                problemData.notes = noteText;
                await addBookmark(problemData);
            }
        } else {
            await updateProblemNotes(currentUrl, noteText);
        }

        setIsNotesOpen(false);
        alert('Note saved!');
    };

    // If still checking handle or user has no saved handle, render NOTHING on the Codeforces page
    if (isCheckingHandle || !handle) {
        return null;
    }

    return (
        <>
            {/* 1. Problem Title Actions */}
            {containers.titleActions &&
                createPortal(
                    <>
                        <button className="cf-button" onClick={handleBookmark}>🔖 Bookmark</button>
                        <button className="cf-button red" onClick={handleRemove}>❌ Remove</button>
                    </>,
                    containers.titleActions
                )}

            {/* 2. Problem Tags Toggle Button */}
            {containers.tagsToggle &&
                createPortal(
                    <button className="cf-toggle-tags"
                    onClick={() => setShowTags(!showTags)}>
                    { showTags ? 'Hide Tags' : 'Show Tags'}
                    </button>,
                    containers.tagsToggle
                )}

            {/* 3. Streak Badge in Sidebar */}
            {containers.streakBadge &&
                createPortal(
                    <StreakBadge 
                        currentStreak={streakInfo.currentStreak} 
                        longestStreak={streakInfo.longestStreak} 
                    />,
                    containers.streakBadge
                )}

            {/* 4. Solved Problem Sidebar Badge */}
            {containers.solvedBadge && isSolved &&
                createPortal(
                    <div className="solved-sidebar-badge">
                        <span>Solved</span>
                        <span className="solved-icon">✔</span>
                    </div>,
                    containers.solvedBadge
                )}

            {/* 5. Friends' Accepted Codes Sidebar Box */}
            {containers.friendsSidebox && contestId && problemIndex &&
                createPortal(
                    <FriendsSidebar 
                        contestId={contestId}
                        problemIndex={problemIndex}
                        onFriendClick={(id, handle, language) => setActiveSubmission({ id, handle, language })}
                    />,
                    containers.friendsSidebox
                )}

            {/* 6. ADD NOTE Header Menu Tab */}
            {containers.addNoteTab &&
                createPortal(
                    <a
                        style={{ color: '#d9534f', fontWeight: 'bold', cursor: 'pointer' }}
                        onClick={(e) => {
                            e.preventDefault();
                            handleOpenNotesModal();
                        }}
                    >
                        ADD NOTE
                    </a>,
                    containers.addNoteTab
                )}

            {/* 7. Modals */}
            {containers.modalRoot && activeSubmission && contestId &&
                createPortal(
                    <CodeModal
                        contestId={contestId}
                        submissionId={activeSubmission.id}
                        handle={activeSubmission.handle}
                        language={activeSubmission.language}
                        onClose={() => setActiveSubmission(null)}
                    />,
                    containers.modalRoot
                )}

            {containers.modalRoot && isNotesOpen && currentProblemObj &&
                createPortal(
                    <NotesModal
                        activeNote={currentProblemObj}
                        noteText={noteText}
                        setNoteText={setNoteText}
                        onSave={handleSaveNote}
                        onClose={() => setIsNotesOpen(false)}
                    />,
                    containers.modalRoot
                )}
        </>
    );
}