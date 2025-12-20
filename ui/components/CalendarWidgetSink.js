'use client';

import { useState } from 'react';

export default function CalendarWidgetSink({ config, inputConfig, data, widgetId }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [inputs, setInputs] = useState({});

    // Process Data
    let events = {};
    if (Array.isArray(data)) {
        data.forEach(item => {
            const dateKey = item[config.mapping.date_key] || item.date || item.dataKey;
            const val = item[config.mapping.value_key] || item.name || item.value || item.dataValue;
            if (dateKey) events[dateKey] = val; // Assuming one event per day for simplicity, or handle array
            // If multiple events per day were needed, this would need to be array push. 
            // For now, let's just stick to simple key-value to match previous logic, 
            // but maybe check if it exists and append?
            // events[dateKey] = events[dateKey] ? events[dateKey] + ", " + val : val; 
        });
    } else if (data && typeof data === 'object') {
        events = data;
    }

    // Calendar Logic
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Create grid slots
    const slots = [];
    // Pad empty slots
    for (let i = 0; i < firstDay; i++) slots.push(null);
    // Fill days
    for (let i = 1; i <= daysInMonth; i++) slots.push(i);

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const changeMonth = (offset) => {
        setCurrentDate(new Date(year, month + offset, 1));
        setSelectedDate(null);
    };

    const handleDayClick = (day) => {
        if (!day) return;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(dateStr);
        // Pre-fill input if local
        if (config.mapping && config.mapping.date_key) {
            setInputs(prev => ({ ...prev, [config.mapping.date_key]: dateStr }));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const dateKeyName = config.mapping.date_key;
        const key = inputs[dateKeyName];
        const value = inputs[config.mapping.value_key];
        if (!key || !value) return;

        try {
            const res = await fetch(`/api/widgets/${widgetId}/local-store`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value })
            });
            if (res.ok) window.location.reload();
        } catch (err) { console.error(err); }
    };

    const handleInputChange = (field, val) => {
        setInputs(prev => ({ ...prev, [field]: val }));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontSize: '0.9rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <button
                    onClick={() => changeMonth(-1)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '0 0.5rem' }}>
                    &lt;
                </button>
                <div style={{ fontWeight: 'bold' }}>{monthNames[month]} {year}</div>
                <button
                    onClick={() => changeMonth(1)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '0 0.5rem' }}>
                    &gt;
                </button>
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center', marginBottom: '1rem' }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <div key={d} style={{ color: 'var(--text-muted)', fontSize: '0.75rem', paddingBottom: '0.25rem' }}>{d}</div>
                ))}

                {slots.map((day, idx) => {
                    const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                    const dayEvents = dateStr ? events[dateStr] : null;
                    const isSelected = dateStr === selectedDate;

                    return (
                        <div
                            key={idx}
                            onClick={() => handleDayClick(day)}
                            style={{
                                height: '30px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: day ? 'pointer' : 'default',
                                background: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                borderRadius: '4px',
                                border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                                position: 'relative'
                            }}
                        >
                            {day && (
                                <>
                                    <span>{day}</span>
                                    {dayEvents && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '2px',
                                            width: '4px',
                                            height: '4px',
                                            borderRadius: '50%',
                                            background: 'var(--primary)'
                                        }}></div>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Event Details & Form */}
            <div style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                {selectedDate ? (
                    <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>{selectedDate}</h4>
                        {events[selectedDate] ? (
                            <div style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>{events[selectedDate]}</div>
                        ) : (
                            <div style={{ marginBottom: '0.5rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No events</div>
                        )}

                        {/* Input Form only if Inputs configured */}
                        {inputConfig && Array.isArray(inputConfig.fields) && (
                            <form onSubmit={handleSave} style={{ marginTop: '0.5rem' }}>
                                {inputConfig.fields.map(field => {
                                    if (field.name === config.mapping.date_key) return null; // Hide date input as it's selected
                                    return (
                                        <div key={field.name} className="input-group" style={{ marginBottom: '0.5rem' }}>
                                            <input
                                                type={field.type}
                                                required
                                                className="input"
                                                placeholder={field.label}
                                                value={inputs[field.name] || ''}
                                                onChange={e => handleInputChange(field.name, e.target.value)}
                                                style={{ padding: '0.25rem', fontSize: '0.85rem' }}
                                            />
                                        </div>
                                    );
                                })}
                                <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '0.8rem', padding: '0.25rem' }}>
                                    Add/Update
                                </button>
                            </form>
                        )}
                    </div>
                ) : (
                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem' }}>Select a date to view details</div>
                )}
            </div>
        </div>
    );
}
