"use client";

import { useState, useEffect } from "react";

export default function AdminEscalations() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/escalation');
    const data = await res.json();
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const runEngine = async () => {
    await fetch('/api/admin/escalation', { method: 'POST' });
    fetchLogs();
    alert("Escalation Engine executed. Notifications theoretically sent to Teams/Email.");
  };

  return (
    <div className="card" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2>Rule-Based Escalation Engine</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Automatically flag compliance failures across the organization.</p>
        </div>
        <button onClick={runEngine} className="btn btn-danger">Run Escalation Scan</button>
      </div>

      {loading ? <p>Loading escalations...</p> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Target User</th>
                <th>Rule Trigger</th>
                <th>Level</th>
                <th>Message</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td><strong>{log.targetUser}</strong></td>
                  <td><span className="badge badge-warning">{log.ruleTrigger}</span></td>
                  <td>{log.level}</td>
                  <td>{log.message}</td>
                  <td>
                    <span className="badge badge-danger">Unresolved</span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center' }}>No escalations active. Everyone is compliant!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
