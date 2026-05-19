"use client";

import { useState, useEffect } from "react";

export default function AdminAnalytics() {
  const [data, setData] = useState<{ distribution: any, qoq: any, totalCheckIns: number } | null>(null);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <p>Loading Advanced Analytics...</p>;

  // Convert distribution to percentages for a simple visual bar
  const totalGoals = Object.values(data.distribution).reduce((a: any, b: any) => a + b, 0) as number;
  const colors = ['var(--primary)', 'var(--success)', 'var(--warning)', '#8B5CF6'];

  return (
    <div className="grid-2" style={{ marginTop: '2rem' }}>
      <div className="card">
        <h2>Goal Distribution (Thrust Areas)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          {Object.entries(data.distribution).map(([area, count], idx) => {
            const percent = totalGoals > 0 ? ((count as number) / totalGoals) * 100 : 0;
            return (
              <div key={area}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  <span>{area}</span>
                  <span>{count as number} Goals ({Math.round(percent)}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${percent}%`, background: colors[idx % colors.length] }}></div>
                </div>
              </div>
            );
          })}
          {totalGoals === 0 && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>No goals data available.</p>}
        </div>
      </div>

      <div className="card">
        <h2>QoQ Check-in Activity</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Total logged updates across org: {data.totalCheckIns}
        </p>
        
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '150px', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
          {['Q1', 'Q2', 'Q3', 'Q4'].map(q => {
            const val = data.qoq[q];
            // Normalize height (max 100px for demo)
            const height = data.totalCheckIns > 0 ? (val / data.totalCheckIns) * 150 : 0;
            return (
              <div key={q} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '100%', height: `${Math.max(height, 2)}px`, background: 'var(--primary)', borderRadius: '4px 4px 0 0', minHeight: '4px', transition: 'height 0.3s ease' }}></div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{q} ({val})</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
