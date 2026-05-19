"use client";

import { useState, useEffect } from "react";
import AdminAnalytics from "./AdminAnalytics";
import AdminEscalations from "./AdminEscalations";

export default function AdminDashboard({ user }: { user: any }) {
  const [stats, setStats] = useState({ totalUsers: 0, totalGoals: 0, lockedGoals: 0 });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Shared KPI form state
  const [users, setUsers] = useState<any[]>([]);
  const [kpiForm, setKpiForm] = useState({
    title: '', description: '', thrustArea: 'Financial',
    uom: 'Numeric_Min', target: '', weightage: '', assignToAll: true, targetUserId: ''
  });
  const [kpiMsg, setKpiMsg] = useState('');
  const [kpiError, setKpiError] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    const [resStats, resAudit, resUsers] = await Promise.all([
      fetch('/api/admin/stats'),
      fetch('/api/admin/audit'),
      fetch('/api/admin/kpi'),
    ]);
    setStats(await resStats.json());
    setAuditLogs(await resAudit.json());
    setUsers(await resUsers.json());
    setLoading(false);
  };

  useEffect(() => { fetchAdminData(); }, []);

  const handleExport = () => { window.location.href = '/api/admin/export'; };

  const handleKpiSubmit = async (e: any) => {
    e.preventDefault();
    setKpiMsg(''); setKpiError('');
    const res = await fetch('/api/admin/kpi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kpiForm)
    });
    const data = await res.json();
    if (!res.ok) {
      setKpiError(data.error);
    } else {
      setKpiMsg(`✓ Shared KPI assigned to ${data.count} user(s) successfully!`);
      setKpiForm({ title: '', description: '', thrustArea: 'Financial', uom: 'Numeric_Min', target: '', weightage: '', assignToAll: true, targetUserId: '' });
      fetchAdminData();
    }
  };

  return (
    <div>
      {/* Stats Row */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Total Employees', value: stats.totalUsers, color: 'var(--primary)' },
          { label: 'Total Goals', value: stats.totalGoals, color: 'var(--warning)' },
          { label: 'Locked Goals', value: stats.lockedGoals, color: 'var(--success)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</h3>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: s.color, lineHeight: 1.2, marginTop: '0.5rem' }}>
              {loading ? '-' : s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* Shared KPI Assignment */}
        <div className="card">
          <h2>Assign Shared KPI</h2>
          <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Assign a top-down goal (auto-locked) to all employees or a specific user.</p>

          {kpiMsg && <div style={{ color: 'var(--success)', background: 'rgba(16,185,129,0.1)', padding: '0.5rem', borderRadius: '0.25rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{kpiMsg}</div>}
          {kpiError && <div style={{ color: 'var(--danger)', background: 'rgba(239,68,68,0.1)', padding: '0.5rem', borderRadius: '0.25rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{kpiError}</div>}

          <form onSubmit={handleKpiSubmit}>
            <div className="form-group">
              <label className="form-label">KPI Title</label>
              <input required className="form-input" placeholder="e.g. Q1 Revenue Target" value={kpiForm.title} onChange={e => setKpiForm({ ...kpiForm, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <input className="form-input" placeholder="Brief description..." value={kpiForm.description} onChange={e => setKpiForm({ ...kpiForm, description: e.target.value })} />
            </div>
            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Thrust Area</label>
                <select className="form-select" value={kpiForm.thrustArea} onChange={e => setKpiForm({ ...kpiForm, thrustArea: e.target.value })}>
                  <option>Financial</option>
                  <option>Customer</option>
                  <option>Internal Process</option>
                  <option>Learning &amp; Growth</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Unit of Measurement</label>
                <select className="form-select" value={kpiForm.uom} onChange={e => setKpiForm({ ...kpiForm, uom: e.target.value })}>
                  <option value="Numeric_Min">Numeric (Min)</option>
                  <option value="Numeric_Max">Numeric (Max)</option>
                  <option value="Percent_Min">Percent (Min)</option>
                  <option value="Percent_Max">Percent (Max)</option>
                  <option value="Timeline">Timeline</option>
                  <option value="Zero">Zero-based</option>
                </select>
              </div>
            </div>
            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Target Value</label>
                <input required type="number" step="any" className="form-input" value={kpiForm.target} onChange={e => setKpiForm({ ...kpiForm, target: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Weightage (%)</label>
                <input required type="number" min="10" max="100" className="form-input" value={kpiForm.weightage} onChange={e => setKpiForm({ ...kpiForm, weightage: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="radio" name="assignTarget" checked={kpiForm.assignToAll} onChange={() => setKpiForm({ ...kpiForm, assignToAll: true, targetUserId: '' })} />
                  All Employees &amp; Managers
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="radio" name="assignTarget" checked={!kpiForm.assignToAll} onChange={() => setKpiForm({ ...kpiForm, assignToAll: false })} />
                  Specific User
                </label>
              </div>
              {!kpiForm.assignToAll && (
                <select className="form-select" style={{ marginTop: '0.5rem' }} value={kpiForm.targetUserId} onChange={e => setKpiForm({ ...kpiForm, targetUserId: e.target.value })}>
                  <option value="">Select user...</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                </select>
              )}
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Assign Shared KPI</button>
          </form>
        </div>

        {/* Reporting & Audit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h2>Reporting &amp; Cycle Management</h2>
            <p style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>Active Cycle: <strong>Phase 2 — Q1 Check-in (Closes July 31)</strong></p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary">Lock Cycle</button>
              <button onClick={handleExport} className="btn btn-primary">Export CSV Report</button>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Goal Setting Completion</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                <span>Locked / Total Goals</span>
                <span style={{ fontWeight: 600 }}>{stats.totalGoals > 0 ? Math.round((stats.lockedGoals / stats.totalGoals) * 100) : 0}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${stats.totalGoals > 0 ? (stats.lockedGoals / stats.totalGoals) * 100 : 0}%`, background: 'var(--success)', transition: 'width 0.5s ease' }}></div>
              </div>
            </div>
          </div>

          <div className="card" style={{ flex: 1, overflow: 'hidden' }}>
            <h2>Audit Trail</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Latest 50 actions across the organization.</p>
            {loading ? <p>Loading logs...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto' }}>
                {auditLogs.map(log => (
                  <div key={log.id} style={{ fontSize: '0.75rem', padding: '0.625rem', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '0.25rem', borderLeft: '3px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{log.action}</strong>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>{log.details}</div>
                  </div>
                ))}
                {auditLogs.length === 0 && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>No audit logs found.</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      <AdminEscalations />
      <AdminAnalytics />
    </div>
  );
}
