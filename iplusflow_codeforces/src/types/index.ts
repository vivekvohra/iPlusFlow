export interface Problem {
  title: string;
  url: string;
  solved: boolean;
  rating: number | string;
  tags: string[];
  notes?: string;
}

export interface SetupUIProps {
  onSave: (handle: string) => void;
}

export interface MainUIProps {
  onReset: (handle: string) => void;
  handle: string;
}
