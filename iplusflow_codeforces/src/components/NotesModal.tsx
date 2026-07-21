// src/components/NotesModal.tsx
import type { Problem } from '../types';

interface NotesModalProps {
  activeNote: Problem | null;
  noteText: string;
  setNoteText: (text: string) => void;
  onSave: () => void;
  onClose: () => void;
  onRemoveFriendRef?: (submissionUrl: string) => void;
}

export default function NotesModal({
  activeNote,
  noteText,
  setNoteText,
  onSave,
  onClose,
  onRemoveFriendRef,
}: NotesModalProps) {
  if (!activeNote) return null;

  const friendRefs = activeNote.friendRefs || [];

  return (
    <div id="notesModal" className="iplus_modal">
      <div className="iplus_modal-content">
        <span className="iplus_close-button" id="closeNotes" onClick={onClose}>
          &times;
        </span>
        <h3>Edit Notes for {activeNote.title}</h3>
        <textarea
          id="notesText"
          rows={friendRefs.length > 0 ? 7 : 10}
          placeholder="Enter your notes..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
        ></textarea>

        {/* Saved Friend Solution References */}
        {friendRefs.length > 0 && (
          <div style={{
            marginTop: '8px',
            border: '1px solid #e1e1e1',
            background: '#fafafa',
          }}>
            <div style={{
              padding: '5px 8px',
              background: '#f0f0f0',
              borderBottom: '1px solid #e1e1e1',
              fontSize: '11px',
              fontWeight: 'bold',
              color: '#333',
              letterSpacing: '0.3px',
            }}>
              📌 Saved Solutions
            </div>
            {friendRefs.map((ref, i) => (
              <div
                key={ref.submissionUrl}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '5px 8px',
                  borderBottom: i < friendRefs.length - 1 ? '1px solid #eee' : 'none',
                  fontSize: '11.5px',
                }}
              >
                <span style={{ color: '#333' }}>
                  <strong style={{ color: '#0000cc' }}>{ref.handle}</strong>
                  <span style={{ color: '#888', margin: '0 6px' }}>·</span>
                  <span style={{ color: '#666' }}>{ref.language}</span>
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <a
                    href={ref.submissionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#003399',
                      textDecoration: 'none',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      padding: '2px 8px',
                      border: '1px solid #ccc',
                      background: '#fff',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    View Code →
                  </a>
                  {onRemoveFriendRef && (
                    <button
                      type="button"
                      title="Remove saved solution reference"
                      onClick={() => onRemoveFriendRef(ref.submissionUrl)}
                      style={{
                        background: '#fff',
                        border: '1px solid #d9534f',
                        color: '#d9534f',
                        cursor: 'pointer',
                        fontSize: '11px',
                        padding: '2px 6px',
                        borderRadius: '2px',
                        lineHeight: 1,
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

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
