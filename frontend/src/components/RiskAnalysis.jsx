import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function RiskAnalysis({ data }) {
    if (!data) return null;

    const { status, risk_level, explanation, function_name, arguments: args, message } = data;
    const isError = status === 'error';

    return (
        <div className="cyber-panel page-fade-enter-active" style={{ marginTop: '2rem', borderColor: isError ? 'var(--neon-red)' : 'var(--neon-cyan)' }}>
            <h2 className="cyber-text" style={{ color: isError ? 'var(--neon-red)' : 'var(--neon-green)', marginBottom: '1.5rem' }}>
                {isError ? '! SYSTEM ERROR !' : '> ANALYSIS COMPLETE'}
            </h2>

            {risk_level && (
                <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                    <span className="cyber-text" style={{ fontSize: '0.9rem', marginRight: '1rem' }}>RISK LEVEL:</span>
                    <span className={`risk-badge ${risk_level.toLowerCase().includes('alto') || risk_level.toLowerCase().includes('high') ? 'risk-high' :
                        risk_level.toLowerCase().includes('medio') || risk_level.toLowerCase().includes('medium') ? 'risk-medium' :
                            'risk-low'
                        }`}>
                        {risk_level.toUpperCase()}
                    </span>
                </div>
            )}

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 className="cyber-text" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    Detected Function
                </h3>
                <p style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>
                    {function_name ? `${function_name}(...)` : 'Unknown'}
                </p>
            </div>

            {args && args.length > 0 && (
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 className="cyber-text" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                        Decoded Params
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {args.map((arg, idx) => (
                            <li key={idx} style={{ marginBottom: '0.5rem', wordBreak: 'break-all', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--brand-electric)' }}>[{idx}]</span> {arg}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 className="cyber-text" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    System Analysis
                </h3>
                <div style={{ lineHeight: '1.6', color: 'var(--text-main)', fontSize: '0.95rem' }} className="markdown-content">
                    {explanation ? (
                        <ReactMarkdown
                            components={{
                                ul: ({ node, ...props }) => <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-main)' }} {...props} />,
                                li: ({ node, ...props }) => <li style={{ marginBottom: '0.5rem' }} {...props} />
                            }}
                        >
                            {explanation}
                        </ReactMarkdown>
                    ) : (
                        <p>{message || "No details available."}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
