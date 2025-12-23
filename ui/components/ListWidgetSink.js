'use client';

import { useState, useRef } from 'react';
import { Calendar } from 'lucide-react';

export default function ListWidgetSink({ config, data, widgetId }) {
    const [newItemText, setNewItemText] = useState('');
    const [newItemTime, setNewItemTime] = useState('');
    const pickerRef = useRef(null);

    // Process Data
    let items = [];
    if (Array.isArray(data)) {
        items = data.map(d => {
            const id = d.id || d.dataKey || d.data_key;
            const val = d.dataValue || d.data_value || d;
            if (typeof val === 'object' && val !== null && (val.text || val.time)) {
                return { id, ...val };
            }
            return { id, ...val };
        });
    }

    // Filter and Sort
    const visibleItems = items
        .filter(item => !item.completed)
        .sort((a, b) => {
            const timeA = a.time || '99999999'; // Push items without time to the end
            const timeB = b.time || '99999999';
            return timeA.localeCompare(timeB);
        });

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItemText) return; // Only text is mandatory now

        const id = Date.now().toString();
        const value = {
            text: newItemText,
            time: newItemTime || null,
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

    const handlePickerChange = (e) => {
        const val = e.target.value; // YYYY-MM-DDTHH:MM
        if (!val) return;
        const [d, t] = val.split('T');
        const formatted = `${d.replace(/-/g, '')} ${t.replace(/:/g, '')}`;
        setNewItemTime(formatted);
    };

    const handleToggleComplete = async (item) => {
        const updatedValue = { ...item, completed: true };
        delete updatedValue.id;

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
            <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                    className="input"
                    placeholder="Task description..."
                    value={newItemText}
                    onChange={e => setNewItemText(e.target.value)}
                    style={{ flex: 3, minWidth: '150px' }}
                />
                <div style={{ display: 'flex', gap: '0.25rem', flex: 2, minWidth: '180px', position: 'relative' }}>
                    <input
                        className="input"
                        placeholder="YYYYMMDD HHMM (opt)"
                        value={newItemTime}
                        onChange={e => setNewItemTime(e.target.value)}
                        style={{ flex: 1, paddingRight: '2.5rem' }}
                    />
                    <button
                        type="button"
                        onClick={() => pickerRef.current && pickerRef.current.showPicker()}
                        className="btn btn-secondary"
                        style={{ position: 'absolute', right: '4px', top: '4px', bottom: '4px', padding: '0 8px', height: 'auto', border: 'none', background: 'transparent' }}
                    >
                        <Calendar size={18} />
                    </button>
                    <input
                        type="datetime-local"
                        ref={pickerRef}
                        onChange={handlePickerChange}
                        style={{ position: 'absolute', visibility: 'hidden', width: 0, height: 0 }}
                    />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Add</button>
            </form>

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
                                {item.time && (
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {item.time.length === 8
                                            ? `${item.time.substring(0, 4)}-${item.time.substring(4, 6)}-${item.time.substring(6, 8)}`
                                            : item.time.length >= 13
                                                ? `${item.time.substring(0, 4)}-${item.time.substring(4, 6)}-${item.time.substring(6, 8)} ${item.time.substring(9, 11)}:${item.time.substring(11, 13)}`
                                                : item.time
                                        }
                                    </div>
                                )}
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
