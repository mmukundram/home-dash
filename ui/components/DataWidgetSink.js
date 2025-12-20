'use client';

export default function DataWidgetSink({ config, data }) {
    if (!data) return <div style={{ color: 'var(--text-muted)' }}>No Data</div>;

    const { layout_style, display_fields, image_source_key } = config;

    return (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {image_source_key && data[image_source_key] && (
                <div style={{ flexShrink: 0 }}>
                    <img
                        src={data[image_source_key]}
                        alt="Icon"
                        style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                    />
                </div>
            )}
            <div style={{ flex: 1 }}>
                {display_fields.map((field, idx) => (
                    <div key={idx} style={{ marginBottom: '0.5rem' }}>
                        <span style={{
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: 'var(--text-muted)',
                            display: 'block'
                        }}>
                            {field.label}
                        </span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 500, color: 'var(--text-main)' }}>
                            {data[field.key] !== undefined ? data[field.key] : '-'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
