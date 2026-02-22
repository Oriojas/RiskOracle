import React, { useState, useEffect } from 'react';
import { requestChainlinkAudit } from '../api';

export default function ChainlinkVerification({ contractAddress, callData, initialRiskLevel, disabled }) {
    const [auditData, setAuditData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loadingStep, setLoadingStep] = useState(0);

    // Animate loading steps
    useEffect(() => {
        if (!loading) { setLoadingStep(0); return; }
        const timers = [
            setTimeout(() => setLoadingStep(1), 2000),
            setTimeout(() => setLoadingStep(2), 6000),
        ];
        return () => timers.forEach(clearTimeout);
    }, [loading]);

    const handleVerify = async () => {
        setLoading(true);
        setError(null);
        setAuditData(null);
        try {
            const result = await requestChainlinkAudit(contractAddress, callData);
            if (result.status === 'error') {
                setError(result.message || 'Verification failed');
            } else {
                setAuditData(result);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getRiskClass = (level) => {
        if (!level) return '';
        const l = level.toLowerCase();
        if (l.includes('high') || l.includes('critical') || l.includes('alto')) return 'risk-high';
        if (l.includes('medium') || l.includes('medio')) return 'risk-medium';
        return 'risk-low';
    };

    const getMatchStatus = () => {
        if (!auditData?.risk_level || !initialRiskLevel) return null;
        const chainlinkLevel = auditData.risk_level.toLowerCase();
        const rustLevel = initialRiskLevel.toLowerCase();
        const isSame =
            (chainlinkLevel.includes('low') && rustLevel.includes('low')) ||
            (chainlinkLevel.includes('medium') && rustLevel.includes('medium')) ||
            (chainlinkLevel.includes('high') && (rustLevel.includes('high') || rustLevel.includes('critical'))) ||
            (chainlinkLevel.includes('critical') && (rustLevel.includes('high') || rustLevel.includes('critical')));
        return isSame;
    };

    return (
        <div className="chainlink-verification" id="chainlink-verification-section">
            {/* Verify Button */}
            {!auditData && !loading && (
                <button
                    className="chainlink-verify-btn"
                    onClick={disabled ? undefined : handleVerify}
                    disabled={disabled}
                    style={{ opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
                    id="chainlink-verify-button"
                >
                    <span className="chainlink-btn-icon">
                        <svg width="22" height="22" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 0L25.5 8.5L35 5L31.5 14.5L40 20L31.5 25.5L35 35L25.5 31.5L20 40L14.5 31.5L5 35L8.5 25.5L0 20L8.5 14.5L5 5L14.5 8.5L20 0Z" fill="currentColor" />
                        </svg>
                    </span>
                    Verify with Chainlink DON
                    <span className="chainlink-btn-subtitle">
                        {disabled ? 'Run an analysis first to enable Decentralized Verification' : 'Decentralized Oracle Network Consensus'}
                    </span>
                </button>
            )}

            {/* Loading State */}
            {loading && (
                <div className="chainlink-loading">
                    <div className="chainlink-loading-animation">
                        <div className="chainlink-node node-1"></div>
                        <div className="chainlink-node node-2"></div>
                        <div className="chainlink-node node-3"></div>
                        <div className="chainlink-node node-4"></div>
                        <div className="chainlink-center-node"></div>
                        <svg className="chainlink-connections" viewBox="0 0 140 80">
                            <line x1="15" y1="40" x2="70" y2="40" className="connection-line" />
                            <line x1="125" y1="40" x2="70" y2="40" className="connection-line" />
                            <line x1="70" y1="10" x2="70" y2="40" className="connection-line" />
                            <line x1="70" y1="70" x2="70" y2="40" className="connection-line" />
                        </svg>
                    </div>
                    <div className="chainlink-loading-text">
                        <span className="loading-dot">●</span>
                        Decentralized verification in progress...
                    </div>
                    <div className="chainlink-loading-steps">
                        <div className={`loading-step ${loadingStep >= 0 ? 'active' : ''}`}>
                            {loadingStep >= 1 ? '✓' : '◦'} Fetching ABI from Etherscan V2
                        </div>
                        <div className={`loading-step ${loadingStep >= 1 ? 'active' : ''}`}>
                            {loadingStep >= 2 ? '✓' : '◦'} DON nodes analyzing contract
                        </div>
                        <div className={`loading-step ${loadingStep >= 2 ? 'active' : ''}`}>
                            ◦ Reaching BFT consensus
                        </div>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="chainlink-error">
                    <span className="error-icon">⚠️</span>
                    <span>{error}</span>
                    <button className="chainlink-retry-btn" onClick={handleVerify}>Retry</button>
                </div>
            )}

            {/* Result */}
            {auditData && (
                <div className="chainlink-result">
                    {/* Header with verified badge */}
                    <div className="chainlink-result-header">
                        <div className="chainlink-verified-badge">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            <span>Chainlink DON Verified</span>
                        </div>
                        <span className={`risk-badge ${getRiskClass(auditData.risk_level)}`}>
                            {auditData.risk_level?.toUpperCase()}
                        </span>
                    </div>

                    {/* Verification Hash */}
                    {auditData.verification_hash && (
                        <div className="verification-hash-container">
                            <div className="hash-header">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <span>Verification Hash (SHA-256)</span>
                            </div>
                            <div className="hash-value">
                                <code>{auditData.verification_hash.slice(0, 18)}...{auditData.verification_hash.slice(-16)}</code>
                                <button
                                    className="copy-hash-btn"
                                    onClick={() => navigator.clipboard.writeText(auditData.verification_hash)}
                                    title="Copy full hash"
                                >
                                    📋
                                </button>
                            </div>
                            <div className="hash-full" title={auditData.verification_hash}>
                                Full: {auditData.verification_hash}
                            </div>
                            <div className="hash-note" style={{ fontSize: '0.65rem', color: 'rgba(170, 196, 255, 0.5)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                                * In production, this result would be cryptographically signed by the Chainlink DON and verifiable on-chain via BFT consensus.
                            </div>
                        </div>
                    )}

                    {/* Consensus comparison */}
                    {initialRiskLevel && (
                        <div className={`consensus-comparison ${getMatchStatus() ? 'consensus-match' : 'consensus-mismatch'}`}>
                            <div className="comparison-icon">
                                {getMatchStatus() ? '✓' : '⚡'}
                            </div>
                            <div className="comparison-details">
                                <div className="comparison-title">
                                    {getMatchStatus()
                                        ? 'Consensus Reached — Decentralized Verification Matches'
                                        : 'Different Assessment — Independent Analysis'
                                    }
                                </div>
                                <div className="comparison-levels">
                                    <div className="comparison-source">
                                        <span className="source-label">Backend Engine</span>
                                        <span className={`risk-badge-sm ${getRiskClass(initialRiskLevel)}`}>{initialRiskLevel}</span>
                                    </div>
                                    <span className="comparison-arrow">⟶</span>
                                    <div className="comparison-source">
                                        <span className="source-label">Chainlink DON</span>
                                        <span className={`risk-badge-sm ${getRiskClass(auditData.risk_level)}`}>{auditData.risk_level}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dangerous Functions */}
                    {auditData.dangerous_functions && (
                        <div className="chainlink-dangerous-functions">
                            <h4>⚠ Dangerous Functions Detected</h4>
                            <div className="dangerous-list">
                                {auditData.dangerous_functions.split(',').map((fn, idx) => (
                                    <span key={idx} className="dangerous-tag">{fn.trim()}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Explanation */}
                    <div className="chainlink-explanation">
                        <h4>// DECENTRALIZED ANALYSIS — CHAINLINK DON CONSENSUS</h4>
                        <p>{auditData.explanation}</p>
                    </div>

                    {/* Footer */}
                    <div className="chainlink-result-footer">
                        <div className="footer-item">
                            <span className="footer-label">Verified By</span>
                            <span className="footer-value">{auditData.auditor}</span>
                        </div>
                        <div className="footer-item">
                            <span className="footer-label">Consensus Timestamp</span>
                            <span className="footer-value">
                                {auditData.verified_timestamp
                                    ? new Date(auditData.verified_timestamp).toLocaleString()
                                    : 'N/A'
                                }
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
