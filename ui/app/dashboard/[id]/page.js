'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import WidgetRenderer from '../../../components/WidgetRenderer';

export default function DashboardView({ params }) {
    const router = useRouter();
    const { id } = params;
    const [dashboard, setDashboard] = useState(null);
    const [widgets, setWidgets] = useState([]);
    const [showAddWidget, setShowAddWidget] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        fetchDashboard();
        fetchWidgets();
    }, [id]);

    const fetchDashboard = async () => {
        try {
            const res = await fetch(`/api/dashboards/${id}`);
            if (res.ok) setDashboard(await res.json());
        } catch (err) { console.error(err); }
    };

    const fetchWidgets = async () => {
        try {
            const res = await fetch(`/api/widgets/dashboard/${id}`);
            if (res.ok) setWidgets(await res.json());
        } catch (err) { console.error(err); }
    };

    const [editingWidget, setEditingWidget] = useState(null);

    const handleSaveWidget = async (widgetData) => {
        try {
            const method = editingWidget ? 'PUT' : 'POST';
            const url = editingWidget ? `/api/widgets/${editingWidget.id}` : '/api/widgets';
            const body = editingWidget
                ? { ...widgetData, id: editingWidget.id, dashboardId: id, createdBy: user?.id }
                : { ...widgetData, dashboardId: id, layoutOffset: widgets.length, createdBy: user?.id };

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                setShowAddWidget(false);
                setEditingWidget(null);
                fetchWidgets();
            }
        } catch (err) { console.error(err); }
    };

    const openEditModal = (widget) => {
        setEditingWidget(widget);
        setShowAddWidget(true);
    };

    const handleRemoveWidget = async (widgetId) => {
        if (!confirm("Remove this widget from dashboard? (It will be saved in your library)")) return;
        try {
            const res = await fetch(`/api/widgets/${widgetId}/dissociate`, { method: 'POST' });
            if (res.ok) fetchWidgets();
        } catch (err) { console.error(err); }
    };

    if (!dashboard) return <div className="container">Loading...</div>;

    return (
        <div className="container">
            <div className="back-link" onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer' }}>
                <span>&larr;</span> Back to Dashboards
            </div>

            <div className="header-row">
                <h1 className="text-gradient" style={{ margin: 0 }}>{dashboard.title}</h1>
                <button className="btn btn-primary" onClick={() => { setEditingWidget(null); setShowAddWidget(true); }}>
                    + Add Widget
                </button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1.5rem'
            }}>
                {widgets.map(widget => (
                    <div
                        key={widget.id}
                        className="card"
                        style={{
                            gridColumn: `span ${widget.layoutWidth || 1}`,
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative'
                        }}
                    >
                        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                            <button
                                onClick={() => openEditModal(widget)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', marginRight: '0.5rem' }}
                                title="Edit Widget"
                            >
                                &#9998;
                            </button>
                            <button
                                onClick={() => handleRemoveWidget(widget.id)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
                                title="Remove from Dashboard"
                            >
                                &times;
                            </button>
                        </div>
                        <h3 style={{ marginTop: 0, fontSize: '1rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', paddingRight: '2rem' }}>
                            {widget.title}
                        </h3>
                        <div style={{ flex: 1 }}>
                            <WidgetRenderer widget={widget} />
                        </div>
                    </div>
                ))}
            </div>

            {showAddWidget && (
                <div className="modal-overlay" onClick={() => { setShowAddWidget(false); setEditingWidget(null); }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <AddWidgetForm
                            initialData={editingWidget}
                            onSubmit={handleSaveWidget}
                            onCancel={() => { setShowAddWidget(false); setEditingWidget(null); }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function AddWidgetForm({ onSubmit, onCancel, initialData }) {
    const [title, setTitle] = useState('');
    const [sourceType, setSourceType] = useState('API');
    const [sinkType, setSinkType] = useState('DATA_WIDGET');
    const [sourceConfig, setSourceConfig] = useState('{\n  "request": {\n    "url": "",\n    "method": "GET"\n  },\n  "parser_map": {\n    "root_path": "$",\n    "fields": {}\n  }\n}');
    const [sinkConfig, setSinkConfig] = useState('{\n  "layout_style": "card_view",\n  "display_fields": []\n}');
    const [inputConfig, setInputConfig] = useState('{\n  "fields": []\n}');

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setSourceType(initialData.sourceType);
            setSinkType(initialData.sinkType);
            setSourceConfig(JSON.stringify(initialData.sourceConfig, null, 2));
            setSinkConfig(JSON.stringify(initialData.sinkConfig, null, 2));
            setInputConfig(JSON.stringify(initialData.inputConfig || {}, null, 2));
        }
    }, [initialData]);

    // Update defaults when switching types (only if not editing or manually changed)
    const handleSourceTypeChange = (e) => {
        const type = e.target.value;
        setSourceType(type);
        if (!initialData) {
            if (type === 'API') {
                setSourceConfig('{\n  "request": {\n    "url": "",\n    "method": "GET"\n  },\n  "parser_map": {\n    "root_path": "$",\n    "fields": {}\n  }\n}');
            } else {
                setSourceConfig('{\n  "namespace": "user_events"\n}');
            }
        }
    };

    const handleSinkTypeChange = (e) => {
        const type = e.target.value;
        setSinkType(type);
        if (!initialData) {
            if (type === 'DATA_WIDGET') {
                setSinkConfig('{\n  "layout_style": "card_view",\n  "display_fields": []\n}');
                setInputConfig('{}');
            } else if (type === 'LIST') {
                setSinkConfig('{}');
                setInputConfig('{}');
            } else if (type === 'GOOGLE_CALENDAR') {
                setSinkConfig('{\n  "embedCode": ""\n}');
                setInputConfig('{}');
            } else {
                setSinkConfig('{\n  "date_format": "YYYY-MM-DD",\n  "mapping": {\n    "date_key": "event_date",\n    "value_key": "event_description"\n  }\n}');
                setInputConfig('{\n  "fields": [\n    { "name": "event_date", "type": "date", "label": "Date" },\n    { "name": "event_description", "type": "text", "label": "Description" }\n  ]\n}');
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            const parsedSource = JSON.parse(sourceConfig);
            const parsedSink = JSON.parse(sinkConfig);
            const parsedInput = inputConfig ? JSON.parse(inputConfig) : {};

            onSubmit({
                title,
                sourceType,
                sinkType,
                sourceConfig: parsedSource,
                sinkConfig: parsedSink,
                inputConfig: parsedInput,
                // Layout width preserved if editing, else default
                layoutWidth: initialData ? initialData.layoutWidth : (sinkType === 'GOOGLE_CALENDAR' ? 4 : 2)
            });
        } catch (err) {
            alert("Invalid JSON Configuration: " + err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="header-row" style={{ marginBottom: '1.5rem', borderBottom: 'none', paddingBottom: 0 }}>
                <h2 style={{ margin: 0 }}>{initialData ? 'Edit Widget' : 'Create Widget'}</h2>
                <button type="button" onClick={onCancel} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>

            <div className="input-group">
                <label className="label">Title</label>
                <input className="input" value={title} onChange={e => setTitle(e.target.value)} required placeholder="My Widget" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="input-group">
                    <label className="label">Source Type</label>
                    <select className="select" value={sourceType} onChange={handleSourceTypeChange}>
                        <option value="API">API Source</option>
                        <option value="LOCAL">Local Store</option>
                    </select>
                </div>
                <div className="input-group">
                    <label className="label">Sink Type</label>
                    <select className="select" value={sinkType} onChange={handleSinkTypeChange}>
                        <option value="DATA_WIDGET">Data Widget</option>
                        <option value="CALENDAR">Calendar</option>
                        <option value="LIST">List</option>
                        <option value="GOOGLE_CALENDAR">Google Calendar Embed</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                    <label className="label">Source Config (JSON)</label>
                    <textarea
                        className="textarea"
                        value={sourceConfig}
                        onChange={e => setSourceConfig(e.target.value)}
                        style={{ height: '200px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                    />
                </div>
                <div className="input-group">
                    <label className="label">Sink Config (JSON)</label>
                    <textarea
                        className="textarea"
                        value={sinkConfig}
                        onChange={e => setSinkConfig(e.target.value)}
                        style={{ height: '200px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                    />
                </div>
            </div>

            <div className="input-group">
                <label className="label">Input Config (JSON - Optional)</label>
                <textarea
                    className="textarea"
                    value={inputConfig}
                    onChange={e => setInputConfig(e.target.value)}
                    style={{ height: '80px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ minWidth: '120px' }}>{initialData ? 'Save Changes' : 'Create Widget'}</button>
            </div>
        </form>
    );
}
