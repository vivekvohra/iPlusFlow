// src/components/ProblemTable.tsx
import type { Problem } from '../types';

interface ProblemTableProps {
  problems: (Problem & { originalIndex: number })[];
  sortKey: "title" | "rating" | null;
  sortOrder: "asc" | "desc";
  onSort: (key: "title" | "rating") => void;
  onOpenNote: (problem: Problem) => void;
}

export default function ProblemTable({
  problems,
  sortKey,
  sortOrder,
  onSort,
  onOpenNote,
}: ProblemTableProps) {
  return (
    <table id="table" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ width: '40px', textAlign: 'center' }}>Solved</th>
          <th id="th-title" className="sortable" style={{ width: '115px' }} onClick={() => onSort("title")}>
            Problem Title
            <span className="sort-indicator">
              {sortKey === "title" && (sortOrder === "asc" ? "▲" : "▼")}
            </span>
          </th>
          <th id="th-rating" className="sortable" style={{ width: '48px' }} onClick={() => onSort("rating")}>
            Rating
            <span className="sort-indicator">
              {sortKey === "rating" && (sortOrder === "asc" ? "▲" : "▼")}
            </span>
          </th>
          <th style={{ width: '175px' }}>Tags</th>
          <th style={{ width: '48px', textAlign: 'center' }}>Notes</th>
        </tr>
      </thead>
      <tbody id="list">
        {problems.map((problem, index) => (
          <tr key={index} className={problem.solved ? "solved-row" : ""}>
            {/* 1. Solved Status */}
            <td style={{ textAlign: 'center' }}>
              <input type="checkbox" checked={!!problem.solved} disabled />
            </td>

            {/* 2. Problem Title */}
            <td style={{ wordBreak: 'break-word' }}>
              <a href={problem.url} target="_blank" rel="noopener noreferrer">
                {problem.title || problem.url || 'Problem'}
              </a>
            </td>

            {/* 3. Rating */}
            <td>{problem.rating || ''}</td>

            {/* 4. Tags */}
            <td style={{ wordBreak: 'break-word' }}>{(problem.tags || []).join(", ")}</td>

            {/* 5. Notes Button */}
            <td style={{ textAlign: 'center' }}>
              <button className="edit-notes" title="Edit Notes" onClick={() => onOpenNote(problem)}>
                Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
