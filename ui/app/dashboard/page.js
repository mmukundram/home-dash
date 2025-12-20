'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardList() {
    const router = useRouter();
    const [dashboards, setDashboards] = useState([]);
    const [user, setUser] = useState(null);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboards'); // 'dashboards' or 'library'
    const [libraryWidgets, setLibraryWidgets] = useState([]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/');
            return;
        }
        const u = JSON.parse(storedUser);
        setUser(u);
        fetchDashboards(u.id);
        fetchLibraryWidgets(u.id);
    }, [router]);

    const fetchLibraryWidgets = async (userId) => {
        try {
            const res = await fetch(`/api/widgets/creator/${userId}`);
            if (res.ok) {
                const allWidgets = await res.json();
                // Library shows widgets NOT on any dashboard (or all, but user asked for "LOCAL" widgets library)
                // Let's show widgets where dashboardId is null
                setLibraryWidgets(allWidgets.filter(w => w.dashboardId === null));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchDashboards = async (userId) => {
        try {
            const res = await fetch(`/api/dashboards/creator/${userId}`);
            if (res.ok) {
                setDashboards(await res.json());
            }
        } catch (err) {
            console.error(err);
        }
    };

    const createDashboard = async (e) => {
        e.preventDefault();
        if (!user) return;

        try {
            const res = await fetch('/api/dashboards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTitle,
                    description: newDesc,
                    createdBy: user.id
                }),
            });

            if (res.ok) {
                setNewTitle('');
                setNewDesc('');
                setShowCreate(false);
                fetchDashboards(user.id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deletePermanently = async (widgetId) => {
        if (!confirm("Delete this widget and all its data permanently?")) return;
        try {
            const res = await fetch(`/api/widgets/${widgetId}`, { method: 'DELETE' });
            if (res.ok) fetchLibraryWidgets(user.id);
        } catch (err) { console.error(err); }
    };

    const addToDashboard = async (widget, dashboardId) => {
        try {
            const res = await fetch(`/api/widgets/${widget.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...widget, dashboardId })
            });
            if (res.ok) fetchLibraryWidgets(user.id);
        } catch (err) { console.error(err); }
    };

    return (
        <div className="container">
            <div className="header-row">
                <h1 className="text-gradient" style={{ margin: 0 }}>My Dashboards</h1>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Dashboard</button>
            </div>

            <div className="tab-row" style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                <div
                    onClick={() => setActiveTab('dashboards')}
                    style={{
                        padding: '0.75rem 0',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'dashboards' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: activeTab === 'dashboards' ? 'var(--text-main)' : 'var(--text-muted)',
                        fontWeight: activeTab === 'dashboards' ? 'bold' : 'normal'
                    }}
                >
                    My Dashboards
                </div>
                <div
                    onClick={() => setActiveTab('library')}
                    style={{
                        padding: '0.75rem 0',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'library' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: activeTab === 'library' ? 'var(--text-main)' : 'var(--text-muted)',
                        fontWeight: activeTab === 'library' ? 'bold' : 'normal'
                    }}
                >
                    Widget Library
                </div>
            </div>

            {activeTab === 'dashboards' ? (
                <div className="grid-dash">
                    {dashboards.map(d => (
                        <div
                            key={d.id}
                            className="card"
                            onClick={() => router.push(`/dashboard/${d.id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <h3 style={{ marginTop: 0 }}>{d.title}</h3>
                            <p style={{ color: 'var(--text-muted)' }}>{d.description || "No description"}</p>
                        </div>
                    ))}

                    {dashboards.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                            You haven't created any dashboards yet.
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid-dash">
                    {libraryWidgets.map(w => (
                        <div key={w.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ margin: 0 }}>{w.title}</h3>
                                <button
                                    onClick={() => deletePermanently(w.id)}
                                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                    title="Delete Permanently"
                                >
                                    &#128465;
                                </button>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Type: {w.sinkType} | Created: {new Date(w.createdAt).toLocaleDateString()}
                            </div>
                            <div style={{ marginTop: 'auto' }}>
                                <select
                                    className="select"
                                    onChange={(e) => {
                                        if (e.target.value) addToDashboard(w, e.target.value);
                                    }}
                                    defaultValue=""
                                    style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                                >
                                    <option value="" disabled>Add to Dashboard...</option>
                                    {dashboards.map(d => (
                                        <option key={d.id} value={d.id}>{d.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                    {libraryWidgets.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                            Library is empty. Remove widgets from dashboards to see them here.
                        </div>
                    )}
                </div>
            )}

            {showCreate && (
                <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <h2 style={{ marginTop: 0 }}>Create Dashboard</h2>
                        <form onSubmit={createDashboard}>
                            <div className="input-group">
                                <label className="label">Title</label>
                                <input
                                    className="input"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    required
                                    placeholder="e.g., Home Overview"
                                />
                            </div>
                            <div className="input-group">
                                <label className="label">Description</label>
                                <textarea
                                    className="textarea"
                                    value={newDesc}
                                    onChange={e => setNewDesc(e.target.value)}
                                    placeholder="What's this dashboard for?"
                                    rows={3}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
