// src/components/NotesModal.tsx
import type { Problem } from '../types';

interface NotesModalProps {
  activeNote: Problem | null;
  noteText: string;
  setNoteText: (text: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export default function NotesModal({
  activeNote,
  noteText,
  setNoteText,
  onSave,
  onClose,
}: NotesModalProps) {
  if (!activeNote) return null;

  return (
    <div id="notesModal" className="iplus_modal">
      <div className="iplus_modal-content">
        <span className="iplus_close-button" id="closeNotes" onClick={onClose}>
          &times;
        </span>
        <h3>Edit Notes for {activeNote.title}</h3>
        <textarea
          id="notesText"
          rows={10}
          placeholder="Enter your notes..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
        ></textarea>
        <div className="iplus_modal-footer">
          <button id="saveNoteBtn" onClick={onSave}>
            Save
          </button>
          <button id="cancelNoteBtn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
