import { useEffect, useState } from 'react';
import { Bell, Users, Shield, UserCog, Trash2, PauseCircle, PlayCircle, Plus } from 'lucide-react';
import { adminFetch } from '../api';

const ROLE_LABELS = { main_admin: 'Main Admin', website_editor: 'Website Editor' };
const STATUS_LABELS = { active: 'Active', suspended: 'Suspended' };

export default function AdminsAdmin() {
  const [admins, setAdmins] = useState([]);
  const [activity, setActivity] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [adminActivity, setAdminActivity] = useState([]);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ email: '', name: '', password: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    const [adminList, log] = await Promise.all([
      adminFetch('/admins'),
      adminFetch('/activity')
    ]);
    setAdmins(adminList);
    setActivity(log);
  }

  useEffect(() => {
    load().catch((err) => setMsg(err.message));
  }, []);

  async function createAdmin(e) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await adminFetch('/admins', { method: 'POST', body: form });
      setForm({ email: '', name: '', password: '' });
      setMsg('Admin created successfully.');
      await load();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleSuspend(admin) {
    setMsg('');
    try {
      const path = admin.status === 'active' ? `/admins/${admin.id}/suspend` : `/admins/${admin.id}/activate`;
      await adminFetch(path, { method: 'PUT' });
      await load();
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function deleteAdmin(admin) {
    if (!window.confirm(`Delete admin "${admin.name}"?`)) return;
    setMsg('');
    try {
      await adminFetch(`/admins/${admin.id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function showActivity(adminId) {
    if (expandedId === adminId) {
      setExpandedId(null);
      return;
    }
    const rows = await adminFetch(`/admins/${adminId}/activity`);
    setAdminActivity(rows);
    setExpandedId(adminId);
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>
          <Users size={28} aria-hidden="true" /> Admins
        </h1>
        <p className="admin-lead">Manage website editors and view activity history.</p>
      </div>

      {msg && <p className={msg.includes('success') ? 'admin-msg' : 'admin-error'}>{msg}</p>}

      <div className="admin-card">
        <h2>Admin list</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td>
                    {admin.role === 'main_admin' ? <Shield size={14} aria-hidden="true" /> : <UserCog size={14} aria-hidden="true" />}{' '}
                    {admin.name}
                  </td>
                  <td>{admin.email}</td>
                  <td>{ROLE_LABELS[admin.role]}</td>
                  <td>
                    <span className={`admin-status admin-status-${admin.status}`}>{STATUS_LABELS[admin.status]}</span>
                  </td>
                  <td className="admin-actions-cell">
                    <button type="button" className="admin-secondary-btn" onClick={() => showActivity(admin.id)}>
                      Activity
                    </button>
                    {admin.role !== 'main_admin' && (
                      <>
                        <button type="button" className="admin-secondary-btn" onClick={() => toggleSuspend(admin)}>
                          {admin.status === 'active' ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                          {admin.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button type="button" className="admin-danger-btn" onClick={() => deleteAdmin(admin)}>
                          <Trash2 size={16} /> Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {expandedId && (
          <div className="admin-activity-panel">
            <h3>Activity history</h3>
            <ul className="admin-activity-list">
              {adminActivity.length === 0 ? (
                <li>No activity recorded.</li>
              ) : (
                adminActivity.map((row) => (
                  <li key={row.id}>
                    <strong>{row.section}</strong> � {row.action}
                    {row.details ? `: ${row.details}` : ''}
                    <small>{new Date(row.created_at).toLocaleString()}</small>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>

      <form className="admin-form admin-card" onSubmit={createAdmin}>
        <h2>
          <Plus size={20} aria-hidden="true" /> Create admin
        </h2>
        <label>
          Name
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            minLength={6}
            required
          />
        </label>
        <button type="submit" className="admin-primary-btn" disabled={saving}>
          {saving ? 'Creating�' : 'Create Website Editor'}
        </button>
      </form>

      <div className="admin-card">
        <h2>
          <Bell size={20} aria-hidden="true" /> Activity log
        </h2>
        <ul className="admin-activity-list admin-activity-log">
          {activity.length === 0 ? (
            <li>No activity yet.</li>
          ) : (
            activity.map((row) => (
              <li key={row.id}>
                <strong>{row.admin_name}</strong> � {row.section}: {row.action}
                {row.details ? ` (${row.details})` : ''}
                <small>{new Date(row.created_at).toLocaleString()}</small>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
