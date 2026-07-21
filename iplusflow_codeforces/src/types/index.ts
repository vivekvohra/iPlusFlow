//types/index.ts

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

export interface SetupUIProps {
  onSave: (handle: string) => void;
}

export interface MainUIProps {
  onReset: (handle: string) => void;
  handle: string;
}
