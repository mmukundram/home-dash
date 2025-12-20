'use client';

import { useState } from 'react';

export default function ListWidgetSink({ config, data, widgetId }) {
    const [newItemText, setNewItemText] = useState('');
    const [newItemTime, setNewItemTime] = useState('');

    // Process Data
    // data is an array of { dataKey, dataValue } from LOCAL source
    let items = [];
    if (Array.isArray(data)) {
        items = data.map(d => {
            const id = d.id || d.dataKey || d.data_key;
            const val = d.dataValue || d.data_value || d;

            // If val is just the item object (already contains text/time etc)
            if (typeof val === 'object' && val !== null && (val.text || val.time)) {
                return { id, ...val };
            }
            // If val is the raw object but d was the wrapper
            return { id, ...val };
        });
    }

    // Filter and Sort
    const visibleItems = items
        .filter(item => !item.completed)
        .sort((a, b) => {
            const timeA = a.time || '';
            const timeB = b.time || '';
            return timeA.localeCompare(timeB);
        });

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItemText || !newItemTime) return;

        const id = Date.now().toString();
        const value = {
            text: newItemText,
            time: newItemTime,
            completed: false
        };

        try {
            const res = await fetch(`/api/widgets/${widgetId}/local-store`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: id, value })
            });
            if (res.ok) {
                setNewItemText('');
                setNewItemTime('');
                window.location.reload();
            }
        } catch (err) { console.error(err); }
    };

    const handleToggleComplete = async (item) => {
        const updatedValue = { ...item, completed: true };
        delete updatedValue.id; // Remove ID from payload as it's the key

        try {
            const res = await fetch(`/api/widgets/${widgetId}/local-store`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: item.id, value: updatedValue })
            });
            if (res.ok) window.location.reload();
        } catch (err) { console.error(err); }
    };

    const handleDeleteItem = async (itemId) => {
        try {
            const res = await fetch(`/api/widgets/${widgetId}/local-store/${itemId}`, {
                method: 'DELETE'
            });
            if (res.ok) window.location.reload();
        } catch (err) { console.error(err); }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
            {/* Add Item Form */}
            <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                    className="input"
                    placeholder="Task description..."
                    value={newItemText}
                    onChange={e => setNewItemText(e.target.value)}
                    style={{ flex: 2, minWidth: '150px' }}
                />
                <input
                    className="input"
                    type="datetime-local"
                    value={newItemTime}
                    onChange={e => setNewItemTime(e.target.value.replace('T', ' '))}
                    style={{ flex: 1, minWidth: '150px' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Add</button>
            </form>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {visibleItems.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No pending items</div>
                ) : (
                    visibleItems.map(item => (
                        <div key={item.id} className="card" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.03)' }}>
                            <input
                                type="checkbox"
                                onChange={() => handleToggleComplete(item)}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '500' }}>{item.text}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.time}</div>
                            </div>
                            <button
                                onClick={() => handleDeleteItem(item.id)}
                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}
                                title="Delete Permanently"
                            >
                                &#128465;
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
