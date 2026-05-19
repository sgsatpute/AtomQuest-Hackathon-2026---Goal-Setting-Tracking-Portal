"use client";

import { useState, useEffect } from "react";
import { calculateScore } from "@/lib/score";

export default function EmployeeDashboard({ user }: { user: any }) {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '', description: '', thrustArea: 'Financial',
    uom: 'Numeric_Min', target: '', weightage: ''
  });
  const [error, setError] = useState('');
  const [checkInData, setCheckInData] = useState<any>({});

  const fetchGoals = async () => {
    setLoading(true);
    const res = await fetch(`/api/goals?ownerId=${user.id}`);
    const data = await res.json();
    setGoals(data);
    setLoading(false);
  };

  useEffect(() => { fetchGoals(); }, [user.id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
    } else {
      setFormData({ title: '', description: '', thrustArea: 'Financial', uom: 'Numeric_Min', target: '', weightage: '' });
      fetchGoals();
    }
  };

  const handleCheckIn = async (goalId: string, target: number, uom: string) => {
    const data = checkInData[goalId];
    if (!data?.actual || !data?.quarter || !data?.status) {
      alert('Please fill in all check-in fields.');
      return;
    }
    await fetch('/api/checkins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goalId, quarter: data.quarter, actual: data.actual, status: data.status })
    });
    const score = calculateScore(uom, target, parseFloat(data.actual));
    alert(`✓ Check-in logged! Achievement Score: ${score}%`);
    setCheckInData({ ...checkInData, [goalId]: {} });
    fetchGoals();
  };

  const totalWeight = goals.reduce((sum, g) => sum + g.weightage, 0);
  const lockedGoals = goals.filter(g => g.status === 'Locked');

  // Overall weighted performance (simplified — average score across locked goals)
  const overallScore = lockedGoals.length === 0 ? null :
    Math.round(lockedGoals.reduce((sum, g) => sum + (g.weightage / 100), 0) * 100);

  const statusStyle: Record<string, string> = {
    Locked: 'badge-success', Pending: 'badge-warning', Draft: 'badge-draft', Approved: 'badge-primary'
  };

  return (
    <div>
      {/* Performance Summary */}
      {goals.length > 0 && (
        <div className="grid-3" style={{ marginBottom: '2rem' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Total Goals</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{goals.length}<span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/8</span></div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Total Weightage</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: totalWeight === 100 ? 'var(--success)' : 'var(--warning)' }}>{totalWeight}%</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Approved Goals</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success)' }}>{lockedGoals.length}</div>
          </div>
        </div>
      )}

      <div className="grid-2">
        {/* Goal Creation Form */}
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2>Create New Goal <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 400 }}>(Phase 1)</span></h2>
            <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Max 8 goals · Min 10% weightage per goal · Total must equal 100%</p>

            {error && (
              <div style={{ color: 'var(--danger)', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.375rem', fontSize: '0.875rem' }}>
                ⚠ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Goal Title</label>
                <input required className="form-input" placeholder="e.g. Increase Customer Satisfaction" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <textarea rows={2} className="form-textarea" placeholder="Provide context or success criteria..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ resize: 'vertical' }} />
              </div>

              <div className="grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Thrust Area</label>
                  <select className="form-select" value={formData.thrustArea} onChange={e => setFormData({ ...formData, thrustArea: e.target.value })}>
                    <option>Financial</option>
                    <option>Customer</option>
                    <option>Internal Process</option>
                    <option>Learning &amp; Growth</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Unit of Measurement</label>
                  <select className="form-select" value={formData.uom} onChange={e => setFormData({ ...formData, uom: e.target.value })}>
                    <option value="Numeric_Min">Numeric (↑ Higher is better)</option>
                    <option value="Numeric_Max">Numeric (↓ Lower is better)</option>
                    <option value="Percent_Min">Percentage (↑ Min)</option>
                    <option value="Percent_Max">Percentage (↓ Max)</option>
                    <option value="Timeline">Timeline</option>
                    <option value="Zero">Zero-based</option>
                  </select>
                </div>
              </div>

              <div className="grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Target Value</label>
                  <input required type="number" step="any" className="form-input" placeholder="e.g. 1000000" value={formData.target} onChange={e => setFormData({ ...formData, target: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Weightage (%)</label>
                  <input required type="number" min="10" max="100" className="form-input" placeholder="Min 10%" value={formData.weightage} onChange={e => setFormData({ ...formData, weightage: e.target.value })} />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Used: {totalWeight}% · Available: {100 - totalWeight}%
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Submit Goal for Approval →
              </button>
            </form>
          </div>
        </div>

        {/* Goals List & Check-ins */}
        <div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2>Your Goals <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 400 }}>(Phase 2)</span></h2>
              <span className={`badge ${totalWeight === 100 ? 'badge-success' : 'badge-warning'}`}>
                {totalWeight}% Allocated
              </span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading goals...</div>
            ) : goals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
                No goals set yet. Create your first goal →
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {goals.map(goal => (
                  <div key={goal.id} style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.1rem' }}>{goal.title}</h3>
                        {goal.description && <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 0 }}>{goal.description}</p>}
                      </div>
                      <span className={`badge ${statusStyle[goal.status] || 'badge-draft'}`}>{goal.status}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                      <div><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Area:</span> {goal.thrustArea}</div>
                      <div><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Target:</span> {goal.target.toLocaleString()}</div>
                      <div><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>UoM:</span> {goal.uom}</div>
                      <div><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Weight:</span> {goal.weightage}%</div>
                    </div>

                    {/* Phase 2: Check-ins for Locked Goals */}
                    {goal.status === 'Locked' && (
                      <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(79, 70, 229, 0.06)', borderRadius: '0.375rem', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
                        <h4 style={{ fontSize: '0.8125rem', marginBottom: '0.5rem', color: '#818CF8' }}>📊 Log Quarterly Check-in</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
                          <select className="form-select" style={{ padding: '0.375rem 0.5rem', fontSize: '0.8125rem' }}
                            value={checkInData[goal.id]?.quarter || ''}
                            onChange={e => setCheckInData({ ...checkInData, [goal.id]: { ...checkInData[goal.id], quarter: e.target.value } })}>
                            <option value="">Quarter</option>
                            <option value="Q1">Q1</option>
                            <option value="Q2">Q2</option>
                            <option value="Q3">Q3</option>
                            <option value="Q4">Q4</option>
                          </select>
                          <input type="number" placeholder="Actual value" className="form-input" style={{ padding: '0.375rem 0.5rem', fontSize: '0.8125rem' }}
                            value={checkInData[goal.id]?.actual || ''}
                            onChange={e => setCheckInData({ ...checkInData, [goal.id]: { ...checkInData[goal.id], actual: e.target.value } })} />
                          <select className="form-select" style={{ padding: '0.375rem 0.5rem', fontSize: '0.8125rem' }}
                            value={checkInData[goal.id]?.status || ''}
                            onChange={e => setCheckInData({ ...checkInData, [goal.id]: { ...checkInData[goal.id], status: e.target.value } })}>
                            <option value="">Status</option>
                            <option value="Not Started">Not Started</option>
                            <option value="On Track">On Track</option>
                            <option value="Completed">Completed</option>
                          </select>
                          <button onClick={() => handleCheckIn(goal.id, goal.target, goal.uom)} className="btn btn-primary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                            Submit
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
