"use client";

import { useState, useEffect } from "react";
import { calculateScore } from "@/lib/score";

export default function ManagerDashboard({ user, team }: { user: any, team: any[] }) {
  const [teamGoals, setTeamGoals] = useState<any[]>([]);
  const [checkIns, setCheckIns] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});

  const fetchTeamGoals = async () => {
    setLoading(true);
    if (team.length > 0) {
      // Fetch goals for ALL team members in parallel
      const allGoalsArrays = await Promise.all(
        team.map(member => fetch(`/api/goals?ownerId=${member.id}`).then(r => r.json()))
      );
      const data = allGoalsArrays.flat();
      setTeamGoals(data);

      // Fetch check-ins for each locked goal in parallel
      const lockedGoals = data.filter((g: any) => g.status === 'Locked');
      await Promise.all(lockedGoals.map(async (goal: any) => {
        const ciRes = await fetch(`/api/checkins?goalId=${goal.id}`);
        const ciData = await ciRes.json();
        setCheckIns(prev => ({ ...prev, [goal.id]: ciData }));
      }));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTeamGoals();
  }, []);

  const handleAction = async (goalId: string, status: string) => {
    await fetch('/api/goals/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goalId, status })
    });
    fetchTeamGoals();
  };

  const handleComment = async (checkInId: string, goalId: string) => {
    const text = commentText[checkInId];
    if (!text) return;
    
    await fetch('/api/checkins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkInId, managerComment: text })
    });
    
    // Refresh check-ins for this goal
    const ciRes = await fetch(`/api/checkins?goalId=${goalId}`);
    const ciData = await ciRes.json();
    setCheckIns(prev => ({ ...prev, [goalId]: ciData }));
    setCommentText(prev => ({ ...prev, [checkInId]: '' }));
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2>Team Overview</h2>
        <p>You have {team.length} team member(s) reporting to you.</p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          {team.map(member => (
            <div key={member.id} className="badge badge-primary">{member.name}</div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Goal Approvals & Quarterly Check-ins</h2>
        {loading ? <p>Loading team data...</p> : (
          <div className="table-container" style={{ marginTop: '1rem' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Goal details</th>
                  <th>Status</th>
                  <th>Actions / Check-ins</th>
                </tr>
              </thead>
              <tbody>
                {teamGoals.map(goal => (
                  <tr key={goal.id}>
                    <td style={{ verticalAlign: 'top' }}>{team.find(t => t.id === goal.ownerId)?.name || 'Unknown'}</td>
                    <td style={{ verticalAlign: 'top' }}>
                      <strong>{goal.title}</strong><br/>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Target: {goal.target} | Weight: {goal.weightage}% | UoM: {goal.uom}
                      </span>
                    </td>
                    <td style={{ verticalAlign: 'top' }}>
                      <span className={`badge ${goal.status === 'Locked' ? 'badge-success' : goal.status === 'Pending' ? 'badge-warning' : 'badge-draft'}`}>
                        {goal.status}
                      </span>
                    </td>
                    <td style={{ verticalAlign: 'top', minWidth: '300px' }}>
                      {/* Phase 1 Actions */}
                      {goal.status === 'Pending' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleAction(goal.id, 'Locked')} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Approve</button>
                          <button onClick={() => handleAction(goal.id, 'Draft')} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Reject</button>
                        </div>
                      )}
                      
                      {/* Phase 2 Check-ins */}
                      {goal.status === 'Locked' && checkIns[goal.id] && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {checkIns[goal.id].length === 0 ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>No check-ins logged yet.</span>
                          ) : (
                            checkIns[goal.id].map(ci => (
                              <div key={ci.id} style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                  <strong>{ci.quarter}</strong>
                                  <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{ci.status}</span>
                                </div>
                                <div style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                                  Actual: {ci.actual} (Score: {calculateScore(goal.uom, goal.target, ci.actual)}%)
                                </div>
                                
                                {ci.managerComment ? (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontStyle: 'italic', background: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem', borderRadius: '0.25rem' }}>
                                    " {ci.managerComment} "
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <input 
                                      className="form-input" 
                                      style={{ padding: '0.25rem', fontSize: '0.75rem' }} 
                                      placeholder="Add feedback..."
                                      value={commentText[ci.id] || ''}
                                      onChange={e => setCommentText({...commentText, [ci.id]: e.target.value})}
                                    />
                                    <button onClick={() => handleComment(ci.id, goal.id)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Save</button>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {teamGoals.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center' }}>No goals found for team.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
