import type { StreakInfo } from '../utils/streak';

interface ProgressSidebarProps {
    isSolved: boolean;
    streakInfo: StreakInfo;
}

export default function ProgressSidebar({ isSolved, streakInfo }: ProgressSidebarProps) {
    const solvedTodayCount = streakInfo.solvedToday ?? (streakInfo.currentStreak > 0 ? 1 : 0);

    return (
        <div className="roundbox sidebox" style={{ marginBottom: '1em' }}>
            <div className="caption titled">
                → Progress
            </div>
            <div className="roundbox-body borderBottom" style={{ padding: '8px 12px', fontSize: '12px' }}>
                {/* 1. Solved Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: isSolved ? '#0a0' : '#666', fontWeight: isSolved ? 'bold' : 'normal' }}>
                    <span>{isSolved ? '✓ Solved' : '❌ Unsolved'}</span>
                </div>

                {/* 2. Streak */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: '#333' }}>
                    <span>🔥 {streakInfo.currentStreak} Day Streak</span>
                </div>

                {/* 3. Solved Today */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#333' }}>
                    <span>⏱ Solved Today: {solvedTodayCount}</span>
                </div>
            </div>
        </div>
    );
}
