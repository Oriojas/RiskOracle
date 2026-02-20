import React, { useState } from 'react';

export default function TransactionForm({ onSubmit, loading }) {
    const [address, setAddress] = useState('');
    const [callData, setCallData] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (address && callData) {
            onSubmit(address, callData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="cyber-panel" style={{ marginTop: '2rem' }}>
            <h2 className="cyber-text" style={{ color: '#fff', marginBottom: '1.5rem', fontWeight: 700 }}>
                Transaction Analysis
            </h2>

            <div style={{ marginBottom: '1rem' }}>
                <label className="cyber-text" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.6rem' }}>
                    Contract Address
                </label>
                <input
                    type="text"
                    className="cyber-input"
                    placeholder="0x..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={loading}
                />
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <label className="cyber-text" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.6rem' }}>
                    Call Data
                </label>
                <textarea
                    className="cyber-input"
                    rows="4"
                    placeholder="0x..."
                    value={callData}
                    onChange={(e) => setCallData(e.target.value)}
                    disabled={loading}
                    style={{ resize: 'vertical' }}
                />
            </div>

            <button type="submit" className="cyber-button" disabled={loading}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="cyber-spinner"></span>
                        <span>ANALYZING...</span>
                    </div>
                ) : 'Analyze Risk'}
            </button>
        </form>
    );
}
