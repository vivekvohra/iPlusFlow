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
    <table id="table">
      <thead>
        <tr>
          <th>Solved</th>
          <th id="th-title" className="sortable" onClick={() => onSort("title")}>
            Problem Title
            <span className="sort-indicator">
              {sortKey === "title" && (sortOrder === "asc" ? "▲" : "▼")}
            </span>
          </th>
          <th id="th-rating" className="sortable" onClick={() => onSort("rating")}>
            Rating
            <span className="sort-indicator">
              {sortKey === "rating" && (sortOrder === "asc" ? "▲" : "▼")}
            </span>
          </th>
          <th>Tags</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody id="list">
        {problems.map((problem, index) => (
          <tr key={index} className={problem.solved ? "solved-row" : ""}>
            {/* 1. Solved Status */}
            <td>
              <input type="checkbox" checked={!!problem.solved} disabled />
            </td>

            {/* 2. Problem Title */}
            <td>
              <a href={problem.url} target="_blank" rel="noopener noreferrer">
                {problem.title || problem.url || 'Problem'}
              </a>
            </td>

            {/* 3. Rating */}
            <td>{problem.rating || ''}</td>

            {/* 4. Tags */}
            <td>{(problem.tags || []).join(", ")}</td>

            {/* 5. Notes Button */}
            <td>
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
