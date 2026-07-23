// types/index.ts
// Centralized type definitions for iPlusFlow.

import React from 'react';

// ─── Data Models ───────────────────────────────────────────────

export interface FriendRef {
  handle: string;
  language: string;
  submissionUrl: string;
}

export interface Problem {
  title: string;
  url: string;
  solved: boolean;
  rating: number;
  tags: string[];
  notes?: string;
  friendRefs?: FriendRef[];
}

export interface FriendSubmission {
  handle: string;
  submissionId: number;
  language: string;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastSolvedDate: string | null;
  solvedToday?: number;
}

// ─── Component Props ───────────────────────────────────────────

export interface SetupUIProps {
  onSave: (handle: string) => void;
}

export interface MainUIProps {
  onReset: (handle: string) => void;
  handle: string;
}

export interface CodeModalProps {
  contestId: string;
  submissionId: number;
  handle: string;
  language?: string;
  onClose: () => void;
}

export interface NotesModalProps {
  activeNote: Problem | null;
  noteText: string;
  setNoteText: (text: string) => void;
  onSave: () => void;
  onClose: () => void;
  onRemoveFriendRef?: (submissionUrl: string) => void;
}

export interface ProblemTableProps {
  problems: (Problem & { originalIndex: number })[];
  sortKey: "title" | "rating" | null;
  sortOrder: "asc" | "desc";
  onSort: (key: "title" | "rating") => void;
  onOpenNote: (problem: Problem) => void;
}

export interface ProgressSidebarProps {
  isSolved: boolean;
  streakInfo: StreakInfo;
}

export interface StreakBadgeProps {
  currentStreak: number;
  longestStreak?: number;
  className?: string;
  style?: React.CSSProperties;
}

export interface FriendsSidebarProps {
  contestId: string;
  problemIndex: string;
  onFriendClick: (submissionId: number, handle: string, language?: string) => void;
  onSaveToNotes?: (friend: FriendSubmission) => void;
}
