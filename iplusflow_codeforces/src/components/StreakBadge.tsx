// src/components/StreakBadge.tsx
import React from 'react';
import './StreakBadge.css';

interface StreakBadgeProps {
    currentStreak: number;
    longestStreak?: number;
    className?: string;
    style?: React.CSSProperties;
}

export default function StreakBadge({ currentStreak, longestStreak, className, style }: StreakBadgeProps) {
    const label = `${currentStreak} ${currentStreak === 1 ? 'Day' : 'Days'}`;
    const tooltipText = longestStreak !== undefined
        ? `Current Streak: ${currentStreak} Day${currentStreak === 1 ? '' : 's'} | Record: ${longestStreak} Day${longestStreak === 1 ? '' : 's'}`
        : `Current Streak: ${currentStreak} Day${currentStreak === 1 ? '' : 's'}`;

    return (
        <div 
            className={`iplus-streak-badge ${className || ''}`} 
            title={tooltipText}
            style={style}
        >
            <span className="streak-flame">🔥</span>
            <span className="streak-count">{label}</span>
        </div>
    );
}
