'use client';

import { useEffect, useState } from 'react';
import jp from 'jsonpath';
import DataWidgetSink from './DataWidgetSink';
import CalendarWidgetSink from './CalendarWidgetSink';
import ListWidgetSink from './ListWidgetSink';

export default function WidgetRenderer({ widget }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (widget.sourceType === 'API') {
                const config = widget.sourceConfig;
                try {
                    const res = await fetch(config.request.url, {
                        method: config.request.method,
                        headers: config.request.headers
                    });
                    const json = await res.json();
                    const parser = config.parser_map;

                    if (parser.is_list) {
                        // Handle Array Response
                        let rootList = json;
                        if (parser.root_path) {
                            const rootNode = jp.query(json, parser.root_path);
                            // JSONPath returns an array of matches. If the match itself is an array, take the first match.
                            if (rootNode && rootNode.length > 0) rootList = rootNode[0];
                        }

                        if (!Array.isArray(rootList)) {
                            console.error("Parsed root is not an array", rootList);
                            setData([]);
                            setLoading(false);
                            return;
                        }

                        const mappedData = rootList.map(item => {
                            const mappedItem = {};
                            for (const [key, path] of Object.entries(parser.fields)) {
                                // Query relative to the item
                                const valueInfo = jp.query(item, path);
                                mappedItem[key] = valueInfo.length > 0 ? valueInfo[0] : null;
                            }
                            return mappedItem;
                        });
                        setData(mappedData);

                    } else {
                        // Handle Single Object Response (Existing Logic)
                        const kvPairs = {};
                        let root = json;
                        if (parser.root_path) {
                            const rootNode = jp.query(json, parser.root_path);
                            if (rootNode && rootNode.length > 0) root = rootNode[0];
                        }

                        for (const [key, path] of Object.entries(parser.fields)) {
                            const valueInfo = jp.query(root, path);
                            kvPairs[key] = valueInfo.length > 0 ? valueInfo[0] : null;
                        }
                        setData(kvPairs);
                    }

                } catch (err) {
                    console.error("API Fetch Error", err);
                }
            } else if (widget.sourceType === 'LOCAL') {
                try {
                    const res = await fetch(`/api/widgets/${widget.id}/local-store`);
                    if (res.ok) {
                        const items = await res.json();
                        // Convert List<WidgetLocalStore> to KV map
                        // But CalendarWidgetSink might expect a list. 
                        // Let's pass the raw list for LOCAL, or convert to a specific format.
                        // The user description: "mapping": { "date_key": "event_date", "value_key": "event_description" }
                        // The local store structure is: { dataKey, dataValue (json) }
                        // The calendar expects a LIST of items. 

                        // Let's normalize data to be a list of KV objects for Sink.
                        const normalizedData = items.map(item => {
                            const key = item.dataKey || item.data_key;
                            let value = item.dataValue || item.data_value;

                            // If value is a string that looks like JSON, try to parse it
                            if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
                                try {
                                    value = JSON.parse(value);
                                } catch (e) {
                                    // Not JSON, keep as string
                                }
                            }

                            return {
                                dataKey: key,
                                dataValue: value
                            };
                        });
                        setData(normalizedData);
                    }
                } catch (err) {
                    console.error("Local Fetch Error", err);
                }
            }
            setLoading(false);
        };

        fetchData();
        // Poll every minute? or just once. Just once for now.
    }, [widget]);

    if (loading) return <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem', textAlign: 'center' }}>Loading data...</div>;

    if (widget.sinkType === 'DATA_WIDGET') {
        return <DataWidgetSink config={widget.sinkConfig} data={data} />;
    } else if (widget.sinkType === 'CALENDAR') {
        return <CalendarWidgetSink config={widget.sinkConfig} inputConfig={widget.inputConfig} data={data} widgetId={widget.id} />;
    } else if (widget.sinkType === 'LIST') {
        return <ListWidgetSink config={widget.sinkConfig} data={data} widgetId={widget.id} />;
    }

    return <div style={{ color: '#ef4444', padding: '1rem' }}>Unknown Sink Type: {widget.sinkType}</div>;
}
