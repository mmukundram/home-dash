'use client';

import { useEffect, useRef } from 'react';

export default function GoogleCalendarSink({ config }) {
    const containerRef = useRef(null);
    const embedCode = config.embedCode || '';

    useEffect(() => {
        if (containerRef.current && embedCode) {
            // Find the iframe in the embed code and ensure it has 100% width/height
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = embedCode;
            const iframe = tempDiv.querySelector('iframe');
            if (iframe) {
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = '0';
                iframe.setAttribute('frameborder', '0');
                iframe.setAttribute('scrolling', 'no');

                containerRef.current.innerHTML = '';
                containerRef.current.appendChild(iframe);
            } else {
                containerRef.current.innerHTML = embedCode;
            }
        }
    }, [embedCode]);

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '400px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden'
            }}
        />
    );
}
